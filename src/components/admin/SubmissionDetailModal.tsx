import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, X, MessageSquare, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

interface SubmissionComment {
  id: string;
  comment: string;
  created_at: string;
  admin_id: string;
  admin?: {
    name: string;
  };
}

interface SubmissionDetailModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, status: 'approved' | 'rejected') => void;
  formatDate: (dateString: string) => string;
}

const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  isOpen,
  onClose,
  onUpdate,
  formatDate
}) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<SubmissionComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    if (submission && isOpen) {
      fetchComments();
    }
  }, [submission, isOpen]);

  const fetchComments = async () => {
    if (!submission) return;
    
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('submission_comments')
        .select(`
          *,
          admin:users(name)
        `)
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'خطا در بارگذاری نظرات',
        description: 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!submission || !user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/manage-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          submissionId: submission.id,
          status,
          comment: comment.trim() || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در بروزرسانی وضعیت');
      }

      toast({
        title: 'وضعیت مقاله بروزرسانی شد',
        description: `مقاله با موفقیت ${status === 'approved' ? 'تایید' : 'رد'} شد`,
      });

      onUpdate(submission.id, status);
      if (comment.trim()) {
        setComment('');
        await fetchComments();
      }
      onClose();
    } catch (error: any) {
      console.error('Error updating submission:', error);
      toast({
        title: 'خطا در بروزرسانی وضعیت',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!submission || !user || !comment.trim()) return;

    try {
      const { error } = await supabase
        .from('submission_comments')
        .insert({
          submission_id: submission.id,
          admin_id: user.id,
          comment: comment.trim()
        });

      if (error) throw error;

      toast({
        title: 'نظر اضافه شد',
        description: 'نظر شما با موفقیت ثبت شد',
      });

      setComment('');
      await fetchComments();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: 'خطا در افزودن نظر',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">جزئیات مقاله</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Submission Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{submission.title}</CardTitle>
                <Badge 
                  variant={
                    submission.status === 'approved' ? 'default' :
                    submission.status === 'rejected' ? 'destructive' : 'secondary'
                  }
                >
                  {submission.status === 'approved' ? 'تایید شده' :
                   submission.status === 'rejected' ? 'رد شده' : 'در انتظار بررسی'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{submission.user?.name || submission.user?.email || 'ناشناس'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(submission.submitted_at)}</span>
                </div>
              </div>
              <Separator />
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{submission.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                نظرات مدیریت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="نظر خود را بنویسید..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  size="sm"
                >
                  افزودن نظر
                </Button>
              </div>

              <Separator />

              {/* Existing Comments */}
              <div className="space-y-3">
                {isLoadingComments ? (
                  <p className="text-center text-muted-foreground">در حال بارگذاری نظرات...</p>
                ) : comments.length === 0 ? (
                  <p className="text-center text-muted-foreground">هنوز نظری ثبت نشده است</p>
                ) : (
                  comments.map((commentItem) => (
                    <div key={commentItem.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{commentItem.admin?.name || 'مدیر سیستم'}</span>
                        <span>{formatDate(commentItem.created_at)}</span>
                      </div>
                      <p className="text-sm">{commentItem.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {submission.status === 'pending' && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('rejected')}
                disabled={isLoading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 ml-2" />
                رد کردن
              </Button>
              <Button
                onClick={() => handleStatusUpdate('approved')}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 ml-2" />
                تایید کردن
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailModal;
