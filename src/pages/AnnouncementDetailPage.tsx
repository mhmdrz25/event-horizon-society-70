
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, Calendar, User } from 'lucide-react';
import CommentSection from '@/components/common/CommentSection';

// Mock data - will be replaced with actual data from the announcements list
const mockAnnouncements = {
  '1': {
    id: '1',
    title: 'فرصت‌های پژوهشی جدید برای دانشجویان فیزیک',
    content: `گروه فیزیک دانشکده علوم پایه با افتخار اعلام می‌کند که فرصت‌های پژوهشی جدید و هیجان‌انگیزی برای دانشجویان کارشناسی و تحصیلات تکمیلی فراهم شده است.

این فرصت‌ها شامل موارد زیر می‌باشد:

🔬 **پروژه‌های تحقیقاتی در حوزه فیزیک کوانتوم**
- همکاری با اساتید برجسته بین‌المللی
- دسترسی به آزمایشگاه‌های مجهز و پیشرفته
- امکان انتشار مقاله در ژورنال‌های معتبر

💰 **بودجه و حمایت مالی**
- کمک هزینه ماهانه برای دانشجویان پژوهشگر
- تامین هزینه مواد و تجهیزات آزمایشگاهی
- حمایت از شرکت در کنفرانس‌های علمی

📚 **آموزش و توسعه مهارت‌ها**
- کارگاه‌های تخصصی روش‌های تحقیق
- آموزش نرم‌افزارهای شبیه‌سازی علمی
- راهنمایی در نگارش مقالات علمی

**شرایط شرکت:**
- حداقل معدل 16 برای دانشجویان کارشناسی
- حداقل معدل 17 برای دانشجویان تحصیلات تکمیلی
- تعهد به همکاری حداقل یک سال

**مهلت ثبت‌نام:** تا پایان ماه جاری

لطفاً قبل از موعد مقرر برای دریافت بودجه و شروع پروژه‌های تحقیقاتی اقدام کنید. برای کسب اطلاعات بیشتر با دفتر گروه فیزیک تماس بگیرید.`,
    date: '۲۵ اردیبهشت ۱۴۰۴',
    author: {
      name: 'دکتر سارا چن',
      email: 'sara.chen@university.ac.ir'
    },
    commentCount: 5,
  },
  '2': {
    id: '2',
    title: 'سمینار گروه: پیشرفت‌های محاسبات کوانتومی',
    content: `انجمن علمی افق رویداد و گروه فیزیک دانشکده علوم پایه با مباهات دعوت می‌کنند از سمینار علمی "پیشرفت‌های نوین در محاسبات کوانتومی و کاربردهای آن".

**سخنران:** دکتر جیمز میلر
استاد دانشگاه MIT و محقق ارشد آزمایشگاه‌های کوانتوم IBM

**موضوعات ارائه:**
🔹 مروری بر تکنولوژی‌های جدید کوانتومی
🔹 الگوریتم‌های کوانتومی و کاربردهای عملی
🔹 چالش‌ها و فرصت‌های آینده
🔹 نقش محاسبات کوانتومی در هوش مصنوعی

**جزئیات سمینار:**
📅 تاریخ: پنج‌شنبه ۲۰ اردیبهشت ۱۴۰۴
🕐 ساعت: ۱۰:۰۰ تا ۱۲:۰۰
📍 مکان: آمفی‌تئاتر دانشکده علوم پایه
🎫 ورود: رایگان (با ثبت‌نام قبلی)

**ویژگی‌های سمینار:**
- ارائه به زبان انگلیسی با ترجمه همزمان
- اهدای گواهی شرکت
- فرصت پرسش و پاسخ مستقیم با سخنران
- پذیرایی در پایان جلسه

این سمینار فرصت بی‌نظیری برای آشنایی با آخرین دستاوردها در حوزه محاسبات کوانتومی و تعامل با یکی از پیشگامان این حوزه می‌باشد.

**ثبت‌نام:** از طریق سایت انجمن یا حضور در دفتر انجمن`,
    date: '۲۰ اردیبهشت ۱۴۰۴',
    author: {
      name: 'پروفسور علی جانسون',
      email: 'a.johnson@university.ac.ir'
    },
    commentCount: 3,
  },
  '3': {
    id: '3',
    title: 'ثبت نام برنامه پژوهشی تابستان آغاز شد',
    content: `انجمن علمی افق رویداد اعلام می‌کند که ثبت‌نام برای برنامه پژوهشی تابستان ۱۴۰۴ رسماً آغاز شده است.

**درباره برنامه:**
برنامه پژوهشی تابستان فرصتی استثنایی برای دانشجویان علاقه‌مند به تحقیق است تا در محیطی علمی و حرفه‌ای، تجربه عملی پژوهش کسب کنند.

**حوزه‌های تحقیقاتی:**
🧪 شیمی تجزیه و آلی
🔬 فیزیک نظری و تجربی  
🧬 زیست‌شناسی مولکولی
🌱 علوم محیط زیست
💻 بیوانفورماتیک

**مزایای شرکت:**
✅ همکاری مستقیم با اساتید مجرب
✅ دسترسی به آزمایشگاه‌های پیشرفته
✅ کمک هزینه ماهانه
✅ اهدای گواهی‌نامه معتبر
✅ امکان ادامه همکاری در سال تحصیلی
✅ راهنمایی در انتخاب رشته تحصیلات تکمیلی

**شرایط پذیرش:**
- دانشجوی مقاطع کارشناسی یا کارشناسی ارشد
- حداقل معدل ۱۶
- گذراندن موفقیت‌آمیز دروس پایه مرتبط
- ارائه نامه توصیه از استاد راهنما

**مدت برنامه:** ۱۰ هفته (از اول تیرماه)
**مهلت ثبت‌نام:** تا ۱۵ خردادماه

**نحوه ثبت‌نام:**
لطفاً فرم درخواست را از وب‌سایت انجمن دانلود کرده و همراه با مدارک مورد نیاز به دفتر انجمن تحویل دهید.

این فرصت طلایی را از دست ندهید!`,
    date: '۱۵ اردیبهشت ۱۴۰۴',
    author: {
      name: 'دکتر امیلی ونگ',
      email: 'e.wong@university.ac.ir'
    },
    commentCount: 7,
  },
};

const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      if (id && mockAnnouncements[id as keyof typeof mockAnnouncements]) {
        setAnnouncement(mockAnnouncements[id as keyof typeof mockAnnouncements]);
      }
      setIsLoading(false);
    }, 500);
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
              <AvatarFallback>{announcement.author?.name?.charAt(0) || 'ن'}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{announcement.author?.name}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 ml-1" />
            {announcement.date}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="prose dark:prose-invert max-w-none whitespace-pre-line text-right">
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
