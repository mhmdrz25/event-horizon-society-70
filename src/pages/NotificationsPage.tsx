
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, BellOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'خطا در دریافت اعلان‌ها',
          description: 'لطفاً صفحه را مجدداً بارگذاری کنید',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: 'اعلان جدید',
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      toast({
        title: 'اعلان‌ها',
        description: 'تمامی اعلان‌ها خوانده شده علامت‌گذاری شدند',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format date to Persian format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
        <span className="mr-2">در حال بارگذاری اعلان‌ها...</span>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">اعلان‌ها</h1>
          <p className="text-muted-foreground">اطلاعیه‌ها و یادآوری‌های مهم</p>
        </div>
        {notifications.some(notif => !notif.is_read) && (
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            className="flex items-center"
          >
            <CheckCircle size={16} className="ml-2" />
            علامت‌گذاری همه به عنوان خوانده شده
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all ${!notification.is_read ? 'border-gold bg-amber-50 dark:bg-amber-950/20' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {!notification.is_read ? (
                      <Bell className="h-5 w-5 text-gold ml-2" />
                    ) : (
                      <BellOff className="h-5 w-5 text-muted-foreground ml-2" />
                    )}
                    <CardTitle className="text-lg">اعلان</CardTitle>
                  </div>
                  {!notification.is_read && (
                    <Badge 
                      variant="default" 
                      className="bg-gold hover:bg-gold/80 cursor-pointer"
                      onClick={() => markAsRead(notification.id)}
                    >
                      خوانده نشده
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {formatDate(notification.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">اعلانی وجود ندارد</h3>
          <p className="text-muted-foreground mt-2">در حال حاضر هیچ اعلانی برای شما وجود ندارد</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
