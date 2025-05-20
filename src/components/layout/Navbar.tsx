
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, Sun, Moon, Globe } from 'lucide-react';

const Navbar: React.FC = () => {
  const { theme, direction, toggleTheme, toggleDirection } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'Events', path: '/events' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-navy dark:text-gold font-serif">ScienceHub</span>
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
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDirection} 
              aria-label="Toggle text direction"
            >
              <Globe size={18} />
            </Button>
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gold text-black hover:bg-gold/90" size="sm">Sign Up</Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label="Toggle menu"
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
                <Globe size={16} className="mr-2" />
                {direction === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'}
              </Button>
              <div className="flex gap-2 mt-2">
                <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gold text-black hover:bg-gold/90">Sign Up</Button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
