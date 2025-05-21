
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CommentSection from '@/components/common/CommentSection';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  created_at: string;
  capacity: number;
  location: string;
  created_by: string;
  image?: string;
  registrations: {
    count: number;
    user_registered: boolean;
  };
  organizer: {
    name: string;
    email: string;
  };
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);

  useEffect(() => {
    fetchEvent();

    // Set up realtime subscription for registrations
    if (id) {
      const channel = supabase
        .channel(`event-registrations-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_registrations',
            filter: `event_id=eq.${id}`
          },
          () => {
            fetchEvent();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    
    return () => {};
  }, [id, user]);

  const fetchEvent = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // Get event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          organizer:users(name, email)
        `)
        .eq('id', id)
        .single();

      if (eventError) throw eventError;

      // Count registrations
      const { count, error: countError } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      if (countError) throw countError;

      // Check if user is registered
      let userRegistered = false;
      if (user) {
        const { data: registrationData, error: registrationError } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .single();
        
        if (registrationError && registrationError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error, which is expected if user is not registered
          throw registrationError;
        }

        userRegistered = !!registrationData;
      }
      
      setEvent({
        ...eventData,
        registrations: {
          count: count || 0,
          user_registered: userRegistered
        }
      } as Event);
      setIsRegistered(userRegistered);
      setRegistrationCount(count || 0);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: 'خطا در بارگذاری رویداد',
        description: 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async () => {
    if (!user) {
      toast({
        title: 'ثبت‌نام نیاز به ورود دارد',
        description: 'لطفا ابتدا وارد حساب کاربری خود شوید',
      });
      navigate('/login');
      return;
    }

    if (!event) return;

    setIsRegistering(true);
    try {
      if (isRegistered) {
        // Cancel registration
        const { error } = await supabase
          .from('event_registrations')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsRegistered(false);
        setRegistrationCount(prev => Math.max(0, prev - 1));
        toast({
          title: 'ثبت‌نام لغو شد',
          description: 'ثبت‌نام شما برای این رویداد با موفقیت لغو شد',
        });
      } else {
        // Register for event
        if (registrationCount >= event.capacity) {
          toast({
            title: 'ظرفیت تکمیل است',
            description: 'متأسفانه ظرفیت این رویداد تکمیل شده است',
            variant: 'destructive',
          });
          return;
        }

        const { error } = await supabase
          .from('event_registrations')
          .insert({
            event_id: event.id,
            user_id: user.id,
          });

        if (error) throw error;

        setIsRegistered(true);
        setRegistrationCount(prev => prev + 1);
        toast({
          title: 'ثبت‌نام انجام شد',
          description: 'ثبت‌نام شما برای این رویداد با موفقیت انجام شد',
        });
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast({
        title: 'خطا',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-2/3 mb-2" />
          <Skeleton className="h-5 w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-5 w-2/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4 text-navy dark:text-white">رویداد یافت نشد</h1>
        <p className="mb-6 text-muted-foreground">رویداد مورد نظر یافت نشد یا ممکن است حذف شده باشد.</p>
        <Link to="/events">
          <Button>بازگشت به لیست رویدادها</Button>
        </Link>
      </div>
    );
  }

  // Format date for display
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const registrationPercentage = (registrationCount / event.capacity) * 100;
  const isFull = registrationCount >= event.capacity;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="container py-8 px-4">
      <div className="mb-6">
        <Link to="/events" className="flex items-center text-gold hover:underline mb-4">
          <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
          بازگشت به لیست رویدادها
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">{event.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {isPast ? (
            <Badge variant="secondary">برگزار شده</Badge>
          ) : isFull ? (
            <Badge variant="destructive">ظرفیت تکمیل</Badge>
          ) : (
            <Badge variant="default" className="bg-gold text-black">ثبت‌نام فعال</Badge>
          )}
          <Badge variant="outline" className="text-muted-foreground">
            <Calendar className="ml-1 h-3 w-3" />
            {formattedDate}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Event Image */}
          {event.image && (
            <div className="w-full overflow-hidden rounded-lg">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-60 object-cover"
              />
            </div>
          )}

          {/* Event Description */}
          <Card>
            <CardHeader>
              <CardTitle>درباره این رویداد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line">
                {event.description}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentSection contentType="event" contentId={event.id} />
        </div>

        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>ثبت‌نام در رویداد</CardTitle>
              <CardDescription>
                {isPast ? 'این رویداد به پایان رسیده است' : 'در این رویداد شرکت کنید'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 ml-2 text-gold" />
                  <div>
                    <p className="font-medium">تاریخ و زمان</p>
                    <p className="text-sm text-muted-foreground">{formattedDate} - ساعت {formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 ml-2 text-gold" />
                  <div>
                    <p className="font-medium">مکان رویداد</p>
                    <p className="text-sm text-muted-foreground">{event.location || 'مشخص نشده'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="h-5 w-5 ml-2 text-gold" />
                  <div>
                    <p className="font-medium">ظرفیت</p>
                    <p className="text-sm text-muted-foreground">
                      {registrationCount} از {event.capacity} نفر ثبت‌نام کرده‌اند
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>پیشرفت ثبت‌نام</span>
                  <span>
                    {registrationCount}/{event.capacity}
                  </span>
                </div>
                <Progress value={registrationPercentage} className="h-2" />
              </div>

              <Button 
                className={`w-full ${isRegistered ? 'bg-destructive hover:bg-destructive/90' : 'bg-gold text-black hover:bg-gold/90'}`}
                onClick={handleRegistration}
                disabled={isRegistering || isPast || (!isRegistered && isFull)}
              >
                {isRegistering ? 'در حال پردازش...' : 
                  isRegistered ? 'لغو ثبت‌نام' : 
                  isFull ? 'ظرفیت تکمیل شده' : 
                  isPast ? 'رویداد به پایان رسیده' : 
                  'ثبت‌نام در رویداد'}
              </Button>
            </CardContent>
          </Card>

          {/* Organizer Card */}
          <Card>
            <CardHeader>
              <CardTitle>برگزار کننده</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="font-medium">{event.organizer?.name || 'انجمن علمی'}</p>
                  <p className="text-sm text-muted-foreground">{event.organizer?.email || 'مشخص نشده'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
