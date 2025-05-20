
import React from 'react';
import { Button } from '@/components/ui/button';
import AnnouncementCard from '@/components/common/AnnouncementCard';
import EventCard from '@/components/common/EventCard';
import { Link } from 'react-router-dom';

// Mock data (will be replaced with Supabase data)
const announcements = [
  {
    id: '1',
    title: 'فرصت‌های پژوهشی جدید برای دانشجویان فیزیک',
    content: 'گروه فیزیک با افتخار اعلام می‌کند که فرصت‌های پژوهشی جدیدی برای دانشجویان کارشناسی و تحصیلات تکمیلی فراهم شده است. قبل از موعد مقرر برای دریافت بودجه اقدام کنید.',
    date: '۲۵ اردیبهشت ۱۴۰۴',
    author: {
      name: 'دکتر سارا چن',
      avatar: '',
    },
    commentCount: 5,
  },
  {
    id: '2',
    title: 'سمینار گروه: پیشرفت‌های محاسبات کوانتومی',
    content: 'در سمینار ما درباره آخرین پیشرفت‌های محاسبات کوانتومی، با سخنرانی دکتر جیمز میلر از آزمایشگاه‌های کوانتوم شرکت کنید.',
    date: '۲۰ اردیبهشت ۱۴۰۴',
    author: {
      name: 'پروفسور علی جانسون',
      avatar: '',
    },
    commentCount: 3,
  },
  {
    id: '3',
    title: 'ثبت نام برنامه پژوهشی تابستان آغاز شد',
    content: 'ثبت نام برای برنامه پژوهشی تابستان اکنون باز است. این فرصت بسیار خوبی برای دانشجویان است تا تجربه عملی پژوهش کسب کنند.',
    date: '۱۵ اردیبهشت ۱۴۰۴',
    author: {
      name: 'دکتر امیلی ونگ',
      avatar: '',
    },
    commentCount: 7,
  },
];

const events = [
  {
    id: '1',
    title: 'نمایشگاه علمی سالانه',
    description: 'پروژه‌های تحقیقاتی خود را به نمایش بگذارید و برای جوایز در نمایشگاه علمی سالانه ما رقابت کنید.',
    date: '۳۰ خرداد ۱۴۰۴',
    location: 'سالن اصلی دانشگاه',
    capacity: 100,
    registered: 65,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '2',
    title: 'کارگاه نگارش علمی',
    description: 'یاد بگیرید چگونه مقالات علمی و پروپوزال‌های پژوهشی مؤثر بنویسید.',
    date: '۲۵ خرداد ۱۴۰۴',
    location: 'ساختمان علوم، اتاق 305',
    capacity: 30,
    registered: 25,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-up">
            انجمن علمی دانشگاه
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            با دانشمندان دیگر ارتباط برقرار کنید، فرصت‌های پژوهشی را کشف کنید و از آخرین رویدادها و اعلانات علمی مطلع شوید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup">
              <Button className="bg-gold text-black hover:bg-gold/90 text-lg px-8 py-6">
                به جامعه ما بپیوندید
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8 py-6">
                مشاهده رویدادها
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-navy dark:text-white">آخرین اطلاعیه‌ها</h2>
            <Link to="/announcements">
              <Button variant="ghost" className="text-gold hover:text-gold hover:bg-gold/10">
                مشاهده همه
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                id={announcement.id}
                title={announcement.title}
                content={announcement.content}
                date={announcement.date}
                author={announcement.author}
                commentCount={announcement.commentCount}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-navy dark:text-white">رویدادهای پیش رو</h2>
            <Link to="/events">
              <Button variant="ghost" className="text-gold hover:text-gold hover:bg-gold/10">
                مشاهده همه
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                location={event.location}
                capacity={event.capacity}
                registered={event.registered}
                image={event.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">آماده مشارکت هستید؟</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
            پژوهش، ایده‌ها یا مقالات خود را با جامعه علمی ما به اشتراک بگذارید
          </p>
          <Link to="/submission">
            <Button className="bg-gold text-black hover:bg-gold/90 text-lg px-8 py-6">
              ارسال اثر شما
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
