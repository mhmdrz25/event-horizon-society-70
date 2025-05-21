
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, Sun, Moon, Globe, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const { theme, direction, toggleTheme, toggleDirection } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'صفحه اصلی', path: '/' },
    { name: 'اطلاعیه‌ها', path: '/announcements' },
    { name: 'رویدادها', path: '/events' },
    { name: 'ارسال مقاله', path: '/submission' },
  ];

  // Only show profile link if logged in
  if (user) {
    navLinks.push({ name: 'پروفایل', path: '/profile' });
  }

  // Add admin link if user is admin
  if (profile?.role === 'admin') {
    navLinks.push({ name: 'پنل مدیریت', path: '/admin' });
  }

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-navy dark:text-gold font-serif">انجمن علمی</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <ul className="flex gap-6">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-gold
                    ${location.pathname === link.path ? 'text-gold' : 'text-foreground'}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              aria-label="تغییر تم"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDirection} 
              aria-label="تغییر جهت متن"
            >
              <Globe size={18} />
            </Button>

            {/* Notifications icon - only show if logged in */}
            {user && (
              <Link to="/notifications">
                <Button variant="ghost" size="icon" aria-label="اعلان‌ها">
                  <Bell size={18} />
                </Button>
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User size={16} />
                    {profile?.name?.split(' ')[0] || 'کاربر'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{profile?.name || 'کاربر'}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    پروفایل
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      پنل مدیریت
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut size={16} className="ml-2" />
                    خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">ورود</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gold text-black hover:bg-gold/90" size="sm">ثبت نام</Button>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <Link to="/notifications">
              <Button variant="ghost" size="icon" aria-label="اعلان‌ها">
                <Bell size={18} />
              </Button>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            aria-label="تغییر تم"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label="منو"
          >
            <Menu size={18} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-background border-b animate-fade-in">
          <nav className="container py-4">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`block py-2 text-sm font-medium transition-colors hover:text-gold
                      ${location.pathname === link.path ? 'text-gold' : 'text-foreground'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDirection} 
                className="justify-start"
              >
                <Globe size={16} className="ml-2" />
                {direction === 'ltr' ? 'تغییر به راست به چپ' : 'تغییر به چپ به راست'}
              </Button>
              {user ? (
                <Button 
                  variant="outline" 
                  className="flex justify-start mt-2 text-red-500"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="ml-2" />
                  خروج
                </Button>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">ورود</Button>
                  </Link>
                  <Link to="/signup" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gold text-black hover:bg-gold/90">ثبت نام</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
