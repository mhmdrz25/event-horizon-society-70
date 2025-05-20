
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AnnouncementCard from '@/components/common/AnnouncementCard';
import Search from '@/components/ui/search';

// Mock data (will be replaced with Supabase data)
const allAnnouncements = [
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
    category: 'بودجه',
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
    category: 'سمینار',
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
    category: 'فرصت',
  },
  {
    id: '4',
    title: 'کارگاه اخلاق پژوهشی',
    content: 'کمیته اخلاق پژوهشی کارگاهی درباره ملاحظات اخلاقی در تحقیقات علمی برگزار خواهد کرد.',
    date: '۸ اردیبهشت ۱۴۰۴',
    author: {
      name: 'دکتر مایکل براون',
      avatar: '',
    },
    commentCount: 2,
    category: 'کارگاه',
  },
  {
    id: '5',
    title: 'تجهیزات جدید برای آزمایشگاه شیمی',
    content: 'گروه شیمی تجهیزات جدیدی برای تحلیل‌های شیمیایی پیشرفته خریداری کرده است. جلسات آموزشی بزودی اعلام خواهد شد.',
    date: '۲۵ فروردین ۱۴۰۴',
    author: {
      name: 'پروفسور لیزا آدامز',
      avatar: '',
    },
    commentCount: 4,
    category: 'منابع',
  },
  {
    id: '6',
    title: 'طرح تحقیقاتی میان‌رشته‌ای',
    content: 'اعلام یک طرح جدید برای ترویج پروژه‌های پژوهشی میان‌رشته‌ای در میان گروه‌های مختلف.',
    date: '۲۰ فروردین ۱۴۰۴',
    author: {
      name: 'دکتر داوود پارک',
      avatar: '',
    },
    commentCount: 8,
    category: 'طرح',
  },
];

const AnnouncementsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('همه');

  const categories = ['همه', 'بودجه', 'سمینار', 'فرصت', 'کارگاه', 'منابع', 'طرح'];
  
  const filteredAnnouncements = allAnnouncements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'همه' || announcement.category === category;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">اطلاعیه‌ها</h1>
        <p className="text-muted-foreground">با آخرین اخبار و اطلاعات از جامعه علمی ما به روز بمانید</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="w-full md:w-2/3">
          <Search placeholder="جستجوی اطلاعیه‌ها..." onSearch={handleSearch} />
        </div>
        <div className="w-full md:w-1/3 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className={category === cat ? "bg-gold text-black hover:bg-gold/90" : ""}
              onClick={() => setCategory(cat)}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((announcement) => (
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
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">هیچ اطلاعیه‌ای یافت نشد</h3>
          <p className="text-muted-foreground mb-4">معیارهای جستجو یا فیلتر خود را تنظیم کنید</p>
          <Button 
            variant="outline" 
            onClick={() => { setSearchQuery(''); setCategory('همه'); }}
          >
            پاک کردن فیلترها
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
