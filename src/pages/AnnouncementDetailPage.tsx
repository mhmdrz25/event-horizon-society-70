
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import CommentSection from '@/components/common/CommentSection';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  author: {
    name: string;
    email: string;
  };
}

const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('announcements')
          .select(`
            *,
            author:users(name, email)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setAnnouncement(data as Announcement);
      } catch (error) {
        console.error('Error fetching announcement:', error);
        toast({
          title: 'خطا در بارگذاری اطلاعیه',
          description: 'لطفا دوباره تلاش کنید',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-2/3 mb-2" />
          <Skeleton className="h-5 w-1/3" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-5 w-2/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="container py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4 text-navy dark:text-white">اطلاعیه یافت نشد</h1>
        <p className="mb-6 text-muted-foreground">اطلاعیه مورد نظر یافت نشد یا ممکن است حذف شده باشد.</p>
        <Link to="/announcements">
          <Button>بازگشت به لیست اطلاعیه‌ها</Button>
        </Link>
      </div>
    );
  }

  // Format date for display
  const formattedDate = new Date(announcement.created_at).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container py-8 px-4">
      <div className="mb-6">
        <Link to="/announcements" className="flex items-center text-gold hover:underline mb-4">
          <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
          بازگشت به لیست اطلاعیه‌ها
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">{announcement.title}</h1>
        
        <div className="flex items-center space-x-4 space-x-reverse mb-6">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{announcement.author?.name?.charAt(0) || announcement.author?.email?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{announcement.author?.name || announcement.author?.email}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 ml-1" />
            {formattedDate}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="prose dark:prose-invert max-w-none whitespace-pre-line">
            {announcement.content}
          </div>
        </CardContent>
      </Card>

      {/* Comment Section */}
      <CommentSection contentType="announcement" contentId={announcement.id} />
    </div>
  );
};

export default AnnouncementDetailPage;
