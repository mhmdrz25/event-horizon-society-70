
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/common/Logo';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Logo size="sm" showText={false} className="cursor-pointer" onClick={() => navigate('/')} />
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">انجمن علمی افق رویداد</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ModeToggle />
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {profile?.name || user.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                خروج
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/login')}>
                ورود
              </Button>
              <Button onClick={() => navigate('/signup')}>
                ثبت نام
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
