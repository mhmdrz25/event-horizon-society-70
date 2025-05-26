
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CommentSection from '@/components/common/CommentSection';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Mock data - will be replaced with actual data from the events list
const mockEvents = {
  '1': {
    id: '1',
    title: 'نمایشگاه علمی سالانه انجمن افق رویداد',
    description: `انجمن علمی افق رویداد با افتخار برگزار می‌کند:

**نمایشگاه علمی سالانه ۱۴۰۴**
"نوآوری در علوم پایه و کاربردی"

🎯 **هدف نمایشگاه:**
ارائه و معرفی پروژه‌های تحقیقاتی برتر دانشجویان، فراهم کردن بستری برای تبادل تجربیات علمی و ایجاد فرصت‌های همکاری میان پژوهشگران جوان.

🏆 **جوایز ویژه:**
- جایزه اول: ۵ میلیون تومان + تندیس طلایی
- جایزه دوم: ۳ میلیون تومان + تندیس نقره‌ای  
- جایزه سوم: ۲ میلیون تومان + تندیس برنزی
- جایزه بهترین ارائه: ۱ میلیون تومان
- جایزه محبوب‌ترین پروژه (نظرسنجی بازدیدکنندگان)

📋 **بخش‌های نمایشگاه:**
🔬 علوم پایه (فیزیک، شیمی، ریاضی، زیست‌شناسی)
💻 علوم کامپیوتر و IT
🌱 محیط زیست و منابع طبیعی
⚕️ علوم پزشکی و سلامت
🔧 مهندسی و فناوری

👥 **داوران مدعو:**
- اساتید برجسته دانشگاه‌های سراسری
- محققان مراکز تحقیقاتی معتبر
- نمایندگان شرکت‌های دانش‌بنیان

**برنامه زمانی:**
📅 روز اول: ارائه پوستر و نمایش پروژه‌ها
📅 روز دوم: ارائه‌های شفاهی و مناظره علمی
📅 روز سوم: اعلام نتایج و اهدای جوایز

**مزایای شرکت:**
✅ دریافت گواهی‌نامه معتبر شرکت
✅ فرصت شبکه‌سازی با اساتید و محققان
✅ ثبت در رزومه علمی
✅ امکان انتشار خلاصه مقاله در مجموعه مقالات نمایشگاه
✅ بازدید از آزمایشگاه‌های پیشرفته

**نحوه شرکت:** ثبت‌نام از طریق سایت انجمن تا ۲۵ خردادماه

این نمایشگاه فرصتی بی‌نظیر برای ارائه دستاوردهای علمی و کسب تجربه ارزشمند است!`,
    date: '۳۰ خرداد ۱۴۰۴',
    time: '۰۹:۰۰',
    location: 'سالن اصلی دانشگاه - ساختمان مرکزی',
    capacity: 100,
    registered: 65,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    organizer: {
      name: 'انجمن علمی افق رویداد',
      email: 'info@horizon-society.ac.ir'
    }
  },
  '2': {
    id: '2',
    title: 'کارگاه تخصصی نگارش علمی و انتشار مقاله',
    description: `انجمن علمی افق رویداد برگزار می‌کند:

**کارگاه جامع نگارش علمی و انتشار مقاله**
"از ایده تا انتشار در ژورنال‌های معتبر"

👨‍🏫 **مدرس کارگاه:**
دکتر محمد رضایی - استاد دانشگاه تهران
نویسنده بیش از ۸۰ مقاله ISI و سردبیر مجله علمی

📚 **محتوای آموزشی:**

**بخش اول: مبانی نگارش علمی**
- اصول و قواعد نگارش علمی
- ساختار استاندارد مقالات تحقیقاتی
- تکنیک‌های جستجوی منابع معتبر
- استفاده از نرم‌افزارهای مرجع‌نویسی

**بخش دوم: نگارش بخش‌های مختلف مقاله**
- چکیده مؤثر و کلیدواژه‌های مناسب
- مقدمه جذاب و بیان مسئله
- روش‌شناسی دقیق و قابل تکرار
- ارائه نتایج و تحلیل داده‌ها
- بحث و نتیجه‌گیری قدرتمند

**بخش سوم: فرآیند انتشار**
- انتخاب ژورنال مناسب
- نگارش Cover Letter
- پاسخ به نظرات داوران
- مراحل ویرایش و اصلاح

**بخش عملی:**
- تمرین نگارش روی نمونه مقاله
- بازخورد فردی از مدرس
- شبیه‌سازی فرآیند داوری

**مواد ارائه‌ای:**
📖 کتابچه راهنمای کامل نگارش علمی
💻 نرم‌افزارهای تخصصی
📋 چک‌لیست کنترل کیفیت مقاله
🔗 لیست ژورنال‌های معتبر در حوزه‌های مختلف

**ویژگی‌های کارگاه:**
✅ محدود به ۳۰ نفر برای تعامل بهتر
✅ اهدای گواهی‌نامه رسمی شرکت
✅ پیگیری ۳ ماهه مقالات شرکت‌کنندگان
✅ تخفیف ویژه ویرایش زبان مقالات

**هزینه شرکت:** ۲۰۰ هزار تومان (شامل تمام مواد)
**ظرفیت:** ۳۰ نفر
**مهلت ثبت‌نام:** تا تکمیل ظرفیت`,
    date: '۲۵ خرداد ۱۴۰۴',
    time: '۰۸:۰۰',
    location: 'ساختمان علوم، کلاس ۳۰۵',
    capacity: 30,
    registered: 25,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    organizer: {
      name: 'دکتر علی محمدی',
      email: 'a.mohammadi@university.ac.ir'
    }
  }
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      if (id && mockEvents[id as keyof typeof mockEvents]) {
        setEvent(mockEvents[id as keyof typeof mockEvents]);
        // Randomly set registration status for demo
        setIsRegistered(Math.random() > 0.5);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleRegistration = async () => {
    setIsRegistering(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isRegistered) {
        setIsRegistered(false);
        setEvent((prev: any) => ({
          ...prev,
          registered: Math.max(0, prev.registered - 1)
        }));
        toast({
          title: 'ثبت‌نام لغو شد',
          description: 'ثبت‌نام شما برای این رویداد با موفقیت لغو شد',
        });
      } else {
        if (event && event.registered >= event.capacity) {
          toast({
            title: 'ظرفیت تکمیل است',
            description: 'متأسفانه ظرفیت این رویداد تکمیل شده است',
            variant: 'destructive',
          });
        } else {
          setIsRegistered(true);
          setEvent((prev: any) => ({
            ...prev,
            registered: prev.registered + 1
          }));
          toast({
            title: 'ثبت‌نام انجام شد',
            description: 'ثبت‌نام شما برای این رویداد با موفقیت انجام شد',
          });
        }
      }
      setIsRegistering(false);
    }, 1000);
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

  const registrationPercentage = (event.registered / event.capacity) * 100;
  const isFull = event.registered >= event.capacity;
  const isPast = false; // For demo purposes, we'll assume events are in the future

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
            {event.date}
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
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line text-right">
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
                    <p className="text-sm text-muted-foreground">{event.date} - ساعت {event.time}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 ml-2 text-gold" />
                  <div>
                    <p className="font-medium">مکان رویداد</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="h-5 w-5 ml-2 text-gold" />
                  <div>
                    <p className="font-medium">ظرفیت</p>
                    <p className="text-sm text-muted-foreground">
                      {event.registered} از {event.capacity} نفر ثبت‌نام کرده‌اند
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>پیشرفت ثبت‌نام</span>
                  <span>
                    {event.registered}/{event.capacity}
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
                <User className="h-8 w-8 ml-3 text-gold" />
                <div>
                  <p className="font-medium">{event.organizer?.name}</p>
                  <p className="text-sm text-muted-foreground">{event.organizer?.email}</p>
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
