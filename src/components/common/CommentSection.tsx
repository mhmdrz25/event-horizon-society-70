
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface CommentSectionProps {
  contentType: 'announcement' | 'event';
  contentId: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    name: string;
    email: string;
  };
}

const CommentSection: React.FC<CommentSectionProps> = ({ contentType, contentId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Set up realtime subscription
    const channelA = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: contentType === 'announcement' 
            ? `announcement_id=eq.${contentId}` 
            : `event_id=eq.${contentId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelA);
    };
  }, [contentId, contentType]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(name, email)
        `)
        .eq(contentType === 'announcement' ? 'announcement_id' : 'event_id', contentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setComments(data as Comment[] || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'خطا در دریافت نظرات',
        description: 'لطفا صفحه را رفرش کنید و دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: 'برای ارسال نظر باید وارد شوید',
        description: 'لطفا ابتدا وارد حساب کاربری خود شوید',
      });
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'نظر خالی است',
        description: 'لطفا متن نظر خود را وارد کنید',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const commentData = {
        content: newComment,
        user_id: user.id,
        [contentType === 'announcement' ? 'announcement_id' : 'event_id']: contentId,
      };

      const { error } = await supabase.from('comments').insert(commentData);

      if (error) throw error;

      setNewComment('');
      toast({
        title: 'نظر ارسال شد',
        description: 'نظر شما با موفقیت ثبت شد',
      });
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'خطا در ارسال نظر',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center">
        <MessageSquare className="ml-2" />
        <h3 className="text-xl font-bold">نظرات</h3>
      </div>
      
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" />
          <AvatarFallback>{user?.email?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea 
            placeholder="نظر خود را بنویسید..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-2 resize-none"
          />
          <Button 
            onClick={handleSubmitComment} 
            disabled={isSubmitting}
            className="bg-navy hover:bg-navy/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال ارسال...
              </>
            ) : (
              <>
                <Send className="ml-2 h-4 w-4" />
                ارسال نظر
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-navy" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{comment.user?.name?.charAt(0) || comment.user?.email?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{comment.user?.name || comment.user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), 'yyyy/MM/dd HH:mm')}
                  </p>
                </div>
              </div>
              <p className="text-sm mt-2">{comment.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهد!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
