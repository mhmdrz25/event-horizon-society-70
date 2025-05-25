
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SMSNotificationData {
  phone: string;
  message: string;
  submissionId?: string;
}

export const useSMSNotifications = () => {
  const sendSMS = async (data: SMSNotificationData): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در ارسال پیامک');
      }

      const result = await response.json();
      console.log('SMS sent successfully:', result);

      toast({
        title: 'پیامک ارسال شد',
        description: 'پیامک با موفقیت ارسال شد',
      });

      return true;
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'خطا در ارسال پیامک',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
      return false;
    }
  };

  const sendFileUploadNotification = async (submissionId: string, userId: string) => {
    try {
      // Get user phone number
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('phone_number')
        .eq('id', userId)
        .single();

      if (userError || !userData?.phone_number) {
        console.log('User phone number not found or error:', userError);
        return false;
      }

      const message = `فایل جدیدی برای درخواست شماره ${submissionId} توسط انجمن علمی افق رویداد بارگذاری شد.`;
      
      return await sendSMS({
        phone: userData.phone_number,
        message,
        submissionId,
      });
    } catch (error) {
      console.error('Error sending file upload notification:', error);
      return false;
    }
  };

  const sendSubmissionApprovedNotification = async (submissionId: string, userId: string) => {
    try {
      // Get user phone number
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('phone_number')
        .eq('id', userId)
        .single();

      if (userError || !userData?.phone_number) {
        console.log('User phone number not found or error:', userError);
        return false;
      }

      const message = `درخواست شماره ${submissionId} شما توسط انجمن علمی افق رویداد تایید شد.`;
      
      return await sendSMS({
        phone: userData.phone_number,
        message,
        submissionId,
      });
    } catch (error) {
      console.error('Error sending submission approved notification:', error);
      return false;
    }
  };

  return {
    sendSMS,
    sendFileUploadNotification,
    sendSubmissionApprovedNotification,
  };
};
