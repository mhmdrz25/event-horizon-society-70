
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Download, Trash2, Loader2 } from 'lucide-react';
import { useSubmissionFiles } from '@/hooks/useSubmissionFiles';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadFormProps {
  submissionId: string;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({ submissionId }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    files,
    isLoading,
    isUploading,
    uploadFile,
    deleteFile,
    getFileDownloadUrl,
    formatFileSize,
  } = useSubmissionFiles(submissionId);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && user) {
      await uploadFile(selectedFile, user.id);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const url = getFileDownloadUrl(filePath);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    if (window.confirm('آیا از حذف این فایل اطمینان دارید؟')) {
      await deleteFile(fileId, filePath);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          ضمیمه مقاله (PDF)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf"
          />
          <Button
            onClick={handleFileSelect}
            disabled={isUploading}
            variant="outline"
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال بارگذاری...
              </>
            ) : (
              <>
                <Upload className="ml-2 h-4 w-4" />
                انتخاب فایل PDF
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            فقط فایل‌های PDF پذیرفته می‌شوند (حداکثر ۱۰ مگابایت)
          </p>
        </div>

        {/* File List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">
              هنوز فایلی بارگذاری نشده است
            </p>
          ) : (
            files.map((file) => (
              <div key={file.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file.file_path, file.file_name)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {user && user.id === file.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file.id, file.file_path)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadForm;
