
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSMSNotifications } from './useSMSNotifications';

export interface SubmissionFile {
  id: string;
  submission_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export interface SubmissionFileInsert {
  submission_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const useSubmissionFiles = (submissionId: string) => {
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { sendFileUploadNotification } = useSMSNotifications();

  useEffect(() => {
    if (submissionId) {
      fetchFiles();
    }
  }, [submissionId]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('submission_files')
        .select('*')
        .eq('submission_id', submissionId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast({
        title: 'خطا در بارگذاری فایل‌ها',
        description: 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File, userId: string): Promise<boolean> => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: 'فرمت فایل نامعتبر',
        description: 'لطفا فایل‌های PDF، ZIP، Word، تصویر یا متن انتخاب کنید',
        variant: 'destructive',
      });
      return false;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'حجم فایل زیاد است',
        description: 'حداکثر حجم مجاز فایل ۱۰ مگابایت است',
        variant: 'destructive',
      });
      return false;
    }

    setIsUploading(true);
    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `submission_${submissionId}/${uniqueFileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('submission-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file record to database
      const fileRecord: SubmissionFileInsert = {
        submission_id: submissionId,
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
      };

      const { error: dbError } = await supabase
        .from('submission_files')
        .insert(fileRecord);

      if (dbError) throw dbError;

      toast({
        title: 'فایل بارگذاری شد',
        description: 'فایل با موفقیت اضافه شد',
      });

      // Send SMS notification to submission owner
      try {
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('user_id')
          .eq('id', submissionId)
          .single();

        if (submissionData?.user_id) {
          await sendFileUploadNotification(submissionId, submissionData.user_id);
        }
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
        // Don't fail the upload if SMS fails
      }

      await fetchFiles(); // Refresh file list
      return true;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'خطا در بارگذاری فایل',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('submission-files')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('submission_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: 'فایل حذف شد',
        description: 'فایل با موفقیت حذف شد',
      });

      await fetchFiles(); // Refresh file list
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: 'خطا در حذف فایل',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    }
  };

  const getFileDownloadUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('submission-files')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    files,
    isLoading,
    isUploading,
    uploadFile,
    deleteFile,
    getFileDownloadUrl,
    formatFileSize,
    refreshFiles: fetchFiles,
  };
};
