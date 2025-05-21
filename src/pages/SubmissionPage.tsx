
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Maximum file size (10 MB in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Validation schema
const formSchema = z.object({
  title: z.string().min(5, { message: 'عنوان باید حداقل ۵ کاراکتر باشد' }),
  content: z.string().min(50, { message: 'محتوا باید حداقل ۵۰ کاراکتر باشد' }),
  file: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `حداکثر حجم فایل ۱۰ مگابایت است`)
    .refine(
      file => ACCEPTED_FILE_TYPES.includes(file.type),
      'فقط فایل‌های PDF یا DOCX پذیرفته می‌شوند'
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SubmissionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      file: undefined,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Validate file manually
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        form.setError('file', { 
          type: 'manual', 
          message: 'حداکثر حجم فایل ۱۰ مگابایت است' 
        });
      } else if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
        form.setError('file', { 
          type: 'manual', 
          message: 'فقط فایل‌های PDF یا DOCX پذیرفته می‌شوند' 
        });
      } else {
        form.clearErrors('file');
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: 'خطای دسترسی',
        description: 'برای ارسال مقاله باید ابتدا وارد سیستم شوید',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert submission to database
      const { data: submission, error } = await supabase
        .from('submissions')
        .insert({
          title: data.title,
          content: data.content,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Upload file if selected
      if (file && submission) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${submission.id}.${fileExt}`;

        const { error: uploadError } = await supabase
          .storage
          .from('submissions')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL for the file
        const { data: publicURL } = supabase
          .storage
          .from('submissions')
          .getPublicUrl(filePath);
        
        // Update submission with file URL
        if (publicURL) {
          const { error: updateError } = await supabase
            .from('submissions')
            .update({ 
              // We can't directly use file_url since it's not in the type
              // Instead, we'll use RPC to update it or modify the database schema
              content: data.content + '\n\nFile: ' + publicURL.publicUrl
            })
            .eq('id', submission.id);
            
          if (updateError) {
            console.error('Error updating submission with file URL:', updateError);
          }
        }
      }

      toast({
        title: 'مقاله با موفقیت ارسال شد',
        description: 'مقاله شما برای بررسی به مدیران ارسال شد',
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error submitting paper:', error);
      
      // Provide user-friendly error message
      let errorMessage = 'لطفا دوباره تلاش کنید';
      
      if (error.message.includes('bucket')) {
        errorMessage = 'خطا در آپلود فایل: مخزن ذخیره‌سازی پیکربندی نشده است';
      } else if (error.message.includes('auth')) {
        errorMessage = 'خطای احراز هویت. لطفاً دوباره وارد سیستم شوید';
      }
      
      toast({
        title: 'خطا در ارسال مقاله',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">ارسال مقاله</h1>
        <p className="text-muted-foreground">ایده‌ها و یافته‌های پژوهشی خود را با جامعه علمی به اشتراک بگذارید</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>فرم ارسال مقاله</CardTitle>
          <CardDescription>لطفا اطلاعات مقاله خود را با دقت تکمیل کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان مقاله</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان مقاله خود را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>محتوای مقاله</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="محتوای مقاله خود را وارد کنید"
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      چکیده یا محتوای کامل مقاله خود را وارد کنید
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>فایل پیوست (اختیاری)</FormLabel>
                    <FormControl>
                      <div className="border border-input rounded-md p-2">
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.docx"
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      فرمت‌های قابل قبول: PDF و DOCX (حداکثر ۱۰ مگابایت)
                    </FormDescription>
                    {form.formState.errors.file && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.file.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-gold text-black hover:bg-gold/90" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <Upload className="ml-2 h-4 w-4" />
                    ارسال مقاله
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          مقاله شما پس از بررسی توسط مدیران انجمن منتشر خواهد شد
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubmissionPage;
