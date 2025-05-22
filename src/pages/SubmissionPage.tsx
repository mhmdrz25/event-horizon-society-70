
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

// Define the Supabase URL from environment variable
const SUPABASE_URL = "https://krbddfvnclrgcycgdxpu.supabase.co";

// Validation schema
const submissionSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  content: z.string().min(10, 'محتوا باید حداقل ۱۰ کاراکتر باشد'),
});

const SubmissionPage = () => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionSent, setSubmissionSent] = useState(false);
  
  // Check if user is allowed to make submissions
  const [isAllowed, setIsAllowed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Check if the user already has a pending submission
        const { data, error } = await supabase
          .from('submissions')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        setIsAllowed(!data); // Set to false if there's a pending submission
      } catch (error) {
        console.error('Error checking submission status:', error);
        toast({
          title: 'خطا در بررسی وضعیت',
          description: 'خطایی در بررسی وضعیت ارسال‌های قبلی رخ داده است',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubmissionStatus();
  }, [user]);

  const validateForm = () => {
    try {
      submissionSchema.parse({ title, content });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert([
          {
            title,
            content,
            user_id: user!.id,
          },
        ])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: 'درخواست ارسال شد',
        description: 'درخواست شما با موفقیت ارسال شد و در انتظار بررسی است',
      });

      setSubmissionSent(true);
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast({
        title: 'خطا در ارسال',
        description: error.message || 'خطایی در ارسال درخواست رخ داده است',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if user not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show success message after submission
  if (submissionSent) {
    return (
      <div className="container py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium">درخواست شما با موفقیت ارسال شد</h3>
              <p className="text-gray-600">
                درخواست شما در انتظار بررسی است. پس از بررسی، نتیجه به شما اطلاع داده خواهد شد.
              </p>
              <div className="pt-4">
                <Button onClick={() => window.location.href = '/'}>
                  بازگشت به صفحه اصلی
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">ارسال درخواست</h1>
        <p className="text-muted-foreground">
          درخواست خود را برای ما ارسال کنید. ما در اسرع وقت به آن رسیدگی خواهیم کرد.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !isAllowed ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">شما در حال حاضر یک درخواست در انتظار بررسی دارید</h3>
              <p className="text-gray-600">
                پس از بررسی درخواست فعلی، می‌توانید درخواست جدیدی ارسال کنید.
              </p>
              <div className="pt-4">
                <Button onClick={() => window.location.href = '/'}>
                  بازگشت به صفحه اصلی
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>فرم ارسال درخواست</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان درخواست</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                  required
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">متن درخواست</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`min-h-[200px] resize-y ${errors.content ? "border-red-500" : ""}`}
                  required
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <Send className="ml-2 h-4 w-4" />
                    ارسال درخواست
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubmissionPage;
