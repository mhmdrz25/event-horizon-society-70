
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/common/EventCard';
import Search from '@/components/ui/search';

// Mock data (will be replaced with Supabase data)
const allEvents = [
  {
    id: '1',
    title: 'نمایشگاه علمی سالانه',
    description: 'پروژه‌های تحقیقاتی خود را به نمایش بگذارید و برای جوایز در نمایشگاه علمی سالانه ما رقابت کنید.',
    date: '۳۰ خرداد ۱۴۰۴',
    location: 'سالن اصلی دانشگاه',
    capacity: 100,
    registered: 65,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'نمایشگاه',
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
    category: 'کارگاه',
  },
  {
    id: '3',
    title: 'سخنرانی ویژه: آینده بیوتکنولوژی',
    description: 'استاد برجسته از دانشگاه هاروارد درباره آینده بیوتکنولوژی صحبت خواهد کرد.',
    date: '۲۲ خرداد ۱۴۰۴',
    location: 'رویداد مجازی (زوم)',
    capacity: 200,
    registered: 98,
    image: 'https://images.unsplash.com/photo-1579427421635-a0015b804b2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    category: 'سخنرانی',
  },
  {
    id: '4',
    title: 'گردهمایی شبکه‌سازی دانشجویان علوم',
    description: 'با دیگر دانشجویان و اساتید علوم در محیطی غیررسمی ارتباط برقرار کنید.',
    date: '۱۵ خرداد ۱۴۰۴',
    location: 'ساختمان اتحادیه دانشجویی',
    capacity: 50,
    registered: 32,
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'شبکه‌سازی',
  },
  {
    id: '5',
    title: 'سمپوزیوم تحقیقاتی',
    description: 'سمپوزیوم سالانه نمایش پروژه‌های تحقیقاتی در حال انجام از گروه‌های مختلف.',
    date: '۷ خرداد ۱۴۰۴',
    location: 'مرکز همایش‌ها',
    capacity: 150,
    registered: 120,
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'سمپوزیوم',
  },
  {
    id: '6',
    title: 'روز تجربه عملی آزمایشگاه',
    description: 'تکنیک‌های آزمایشگاهی پیشرفته را با راهنمایی محققان ارشد تجربه کنید.',
    date: '۳۰ اردیبهشت ۱۴۰۴',
    location: 'آزمایشگاه‌های تحقیقاتی، ساختمان C',
    capacity: 20,
    registered: 18,
    image: 'https://images.unsplash.com/photo-1532094349884-543019f6a73c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'عملی',
  },
];

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('همه');

  const categories = ['همه', 'نمایشگاه', 'کارگاه', 'سخنرانی', 'شبکه‌سازی', 'سمپوزیوم', 'عملی'];
  
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'همه' || event.category === category;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">رویدادها</h1>
        <p className="text-muted-foreground">رویدادهای علمی آینده را کشف کنید و در آنها ثبت‌نام کنید</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="w-full md:w-2/3">
          <Search placeholder="جستجوی رویدادها..." onSearch={handleSearch} />
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

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
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
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">هیچ رویدادی یافت نشد</h3>
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

export default EventsPage;
