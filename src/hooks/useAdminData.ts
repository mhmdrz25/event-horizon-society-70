
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useSMSNotifications } from './useSMSNotifications';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  author?: {
    name: string;
  };
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  created_at: string;
  created_by: string;
  organizer?: {
    name: string;
  };
  registrations_count: number;
}

interface Submission {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  user_id: string;
  user?: {
    name: string;
    email: string;
  };
}

export const useAdminData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { sendSubmissionApprovedNotification } = useSMSNotifications();
  
  // Set up realtime subscription for submissions
  useEffect(() => {
    const channel = supabase
      .channel('admin-submissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions'
        },
        (payload) => {
          console.log('New submission received:', payload);
          // Fetch updated submissions data
          if (submissions.length > 0) {
            fetchData('submissions');
          }
          
          toast({
            title: 'درخواست جدید',
            description: 'درخواست جدیدی ارسال شده است',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions'
        },
        (payload) => {
          console.log('Submission updated:', payload);
          // Update local state
          setSubmissions(prev => 
            prev.map(submission => 
              submission.id === payload.new.id 
                ? { ...submission, ...payload.new } 
                : submission
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [submissions.length]);
  
  const fetchData = async (tab: string) => {
    setIsLoading(true);
    try {
      switch (tab) {
        case 'users':
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (userError) throw userError;
          setUsers(userData as User[]);
          break;

        case 'announcements':
          const { data: announcementData, error: announcementError } = await supabase
            .from('announcements')
            .select(`
              *,
              author:users(name)
            `)
            .order('created_at', { ascending: false });
          
          if (announcementError) throw announcementError;
          setAnnouncements(announcementData as Announcement[]);
          break;

        case 'events':
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select(`
              *,
              organizer:users(name),
              registrations_count:event_registrations(count)
            `)
            .order('date', { ascending: true });
          
          if (eventError) throw eventError;
          
          const eventsWithRegistrationCount = eventData.map(event => ({
            ...event,
            registrations_count: event.registrations_count?.length || 0
          }));
          
          setEvents(eventsWithRegistrationCount as Event[]);
          break;

        case 'submissions':
          const { data: submissionData, error: submissionError } = await supabase
            .from('submissions')
            .select(`
              *,
              user:users(name, email)
            `)
            .order('submitted_at', { ascending: false });
          
          if (submissionError) throw submissionError;
          setSubmissions(submissionData as Submission[]);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      toast({
        title: 'خطا در بارگذاری اطلاعات',
        description: 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: 'نقش کاربر بروزرسانی شد',
        description: `نقش کاربر با موفقیت به ${newRole} تغییر یافت`,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'خطا در بروزرسانی نقش کاربر',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/v1/manage-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          submissionId: id,
          status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در بروزرسانی وضعیت');
      }

      // Update local state
      setSubmissions(submissions.map(submission => 
        submission.id === id ? { ...submission, status } : submission
      ));

      // Send SMS notification if status is approved
      if (status === 'approved') {
        try {
          const submission = submissions.find(s => s.id === id);
          if (submission?.user_id) {
            await sendSubmissionApprovedNotification(id, submission.user_id);
          }
        } catch (smsError) {
          console.error('SMS notification failed:', smsError);
          // Don't fail the status update if SMS fails
        }
      }

      toast({
        title: 'وضعیت مقاله بروزرسانی شد',
        description: `مقاله با موفقیت ${status === 'approved' ? 'تایید' : 'رد'} شد`,
      });
    } catch (error: any) {
      console.error('Error updating submission status:', error);
      toast({
        title: 'خطا در بروزرسانی وضعیت مقاله',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return {
    isLoading,
    users,
    announcements,
    events,
    submissions,
    fetchData,
    handleUpdateUserRole,
    handleUpdateSubmissionStatus,
    formatDate
  };
};
