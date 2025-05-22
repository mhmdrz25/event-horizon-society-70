
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch latest announcements
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select(`
            *,
            author:users(name)
          `)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (announcementsError) throw announcementsError;
        setAnnouncements(announcementsData || []);

        // Fetch upcoming events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            organizer:users(name),
            registrations_count:event_registrations(count)
          `)
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(3);
        
        if (eventsError) throw eventsError;
        
        const eventsWithRegistrationCount = eventsData?.map(event => ({
          ...event,
          registrations_count: event.registrations_count?.length || 0
        })) || [];
        
        setEvents(eventsWithRegistrationCount);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'خطا در بارگذاری اطلاعات',
          description: 'لطفا دوباره تلاش کنید',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // If user is not logged in, show welcome page
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="text-center max-w-3xl px-4">
          <h1 className="text-4xl font-bold mb-4 text-navy">انجمن علمی افق رویداد</h1>
          <p className="text-xl text-gray-700 mb-8">
            به انجمن علمی افق رویداد دانشگاه خواجه نصیر خوش آمدید
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => navigate('/login')}
              size="lg" 
              className="bg-navy hover:bg-navy/90 text-white"
            >
              ورود
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              size="lg" 
              variant="outline" 
              className="border-navy text-navy hover:bg-navy/10"
            >
              ثبت نام
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 px-4">
      {/* Welcome message with user's name */}
      {profile && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {profile.name}، خوش آمدید!
          </h1>
          <p className="text-gray-600">
            به سامانه‌ی انجمن علمی افق رویداد خوش آمدید.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column - Announcements */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">آخرین اطلاعیه‌ها</h2>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/announcements')}
                className="text-navy hover:text-navy/90"
              >
                مشاهده همه
              </Button>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-16 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-16 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.id}
                    onClick={() => navigate(`/announcements/${announcement.id}`)}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <h3 className="font-medium mb-1">{announcement.title}</h3>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{announcement.author?.name}</span>
                      <span>{formatDate(announcement.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">هیچ اطلاعیه‌ای یافت نشد</p>
            )}
          </div>
        </div>
        
        {/* Right column - Events */}
        <div className="md:col-span-5">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">رویدادهای آینده</h2>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/events')}
                className="text-navy hover:text-navy/90"
              >
                مشاهده همه
              </Button>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-24 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-24 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div 
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <h3 className="font-medium mb-1">{event.title}</h3>
                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 ml-1" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 ml-1" />
                        <span>
                          {event.registrations_count} / {event.capacity} نفر
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-500">
                        {event.organizer?.name}
                      </span>
                      <Badge variant="outline" className="bg-gold/10 text-black border-gold">
                        {new Date(event.date) > new Date() ? 'ثبت‌نام باز' : 'ثبت‌نام بسته'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">هیچ رویداد آتی‌ای یافت نشد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
