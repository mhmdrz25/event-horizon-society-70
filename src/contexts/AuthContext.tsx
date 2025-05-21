
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'student' | 'member' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Initialize session and user
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log('Auth state changed:', event);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (event === 'SIGNED_OUT') {
              setProfile(null);
            }
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              // Fetch user profile when signed in or token refreshed
              setTimeout(() => {
                if (currentSession?.user) {
                  fetchUserProfile(currentSession.user.id);
                }
              }, 0);
            }
          }
        );

        // THEN check for existing session
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user.id);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        const message = error.message.includes('unique constraint') 
          ? 'این ایمیل قبلاً ثبت شده است'
          : error.message;
        
        toast({
          title: 'ثبت نام ناموفق',
          description: message,
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        toast({
          title: 'ثبت نام موفقیت آمیز',
          description: 'لطفا ایمیل خود را برای تأیید بررسی کنید.',
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Unexpected error during sign up:', error);
      toast({
        title: 'خطا در ثبت نام',
        description: 'خطای غیرمنتظره رخ داده است. لطفاً دوباره تلاش کنید.',
        variant: 'destructive',
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Translate common error messages to Persian
        let persianErrorMessage = '';
        if (error.message.includes('Invalid login credentials')) {
          persianErrorMessage = 'ایمیل یا رمز عبور نامعتبر است';
        } else if (error.message.includes('Email not confirmed')) {
          persianErrorMessage = 'ایمیل شما هنوز تأیید نشده است. لطفا ایمیل خود را بررسی کنید.';
        } else {
          persianErrorMessage = error.message;
        }
        
        toast({
          title: 'ورود ناموفق',
          description: persianErrorMessage,
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        toast({
          title: 'ورود موفقیت آمیز',
          description: 'خوش آمدید!',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      toast({
        title: 'خطا در ورود',
        description: 'خطای غیرمنتظره رخ داده است. لطفاً دوباره تلاش کنید.',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'خروج موفقیت آمیز',
        description: 'شما با موفقیت از سیستم خارج شدید.',
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast({
        title: 'خطا در خروج',
        description: 'خطای غیرمنتظره رخ داده است. لطفاً دوباره تلاش کنید.',
        variant: 'destructive',
      });
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (error) {
        toast({
          title: 'به‌روزرسانی ناموفق',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      // Update local state with new data
      setProfile(prev => prev ? { ...prev, ...data } : null);

      toast({
        title: 'پروفایل به‌روزرسانی شد',
        description: 'پروفایل شما با موفقیت به‌روزرسانی شد.',
      });
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      toast({
        title: 'خطا در به‌روزرسانی',
        description: 'خطای غیرمنتظره رخ داده است. لطفاً دوباره تلاش کنید.',
        variant: 'destructive',
      });
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
