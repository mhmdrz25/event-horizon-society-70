
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white pt-12 pb-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">انجمن علمی</h3>
            <p className="text-navy-foreground">
              سامانه انجمن علمی دانشگاه برای اشتراک گذاری دانش،
              اعلام رویدادها و ارتباط با دیگر دانشمندان.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-gold">لینک‌های سریع</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-gold transition-colors">صفحه اصلی</Link></li>
              <li><Link to="/announcements" className="hover:text-gold transition-colors">اطلاعیه‌ها</Link></li>
              <li><Link to="/events" className="hover:text-gold transition-colors">رویدادها</Link></li>
              <li><Link to="/submission" className="hover:text-gold transition-colors">ارسال مقاله</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-gold">تماس با ما</h4>
            <address className="not-italic">
              <p>گروه علمی دانشگاه</p>
              <p>ایمیل: contact@sciencehub.edu</p>
              <p>تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</p>
            </address>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-navy-foreground/80">
          <p>© {new Date().getFullYear()} انجمن علمی. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
