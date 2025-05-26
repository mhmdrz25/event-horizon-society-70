
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import SubmissionForm from '@/components/submission/SubmissionForm';
import SubmissionSuccess from '@/components/submission/SubmissionSuccess';
import SubmissionRestricted from '@/components/submission/SubmissionRestricted';
import SubmissionLoading from '@/components/submission/SubmissionLoading';

const SubmissionPage = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSent, setSubmissionSent] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  
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

  const handleSubmit = async (title: string, content: string) => {
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

      if (data && data[0]) {
        setSubmissionId(data[0].id);
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
  if (submissionSent && submissionId) {
    return <SubmissionSuccess submissionId={submissionId} />;
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
        <SubmissionLoading />
      ) : !isAllowed ? (
        <SubmissionRestricted />
      ) : (
        <SubmissionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
};

export default SubmissionPage;
