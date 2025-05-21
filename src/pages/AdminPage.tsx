
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/contexts/AuthContext';
import {
  Eye, 
  Edit, 
  Trash, 
  Check, 
  X, 
  Loader2, 
  Shield, 
  User as UserIcon
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  author?: {
    name: string;
  };
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  created_at: string;
  created_by: string;
  organizer?: {
    name: string;
  };
  registrations_count: number;
}

interface Submission {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  user_id: string;
  user?: {
    name: string;
    email: string;
  };
}

const AdminPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    // Check if user is admin
    if (profile && profile.role !== 'admin') {
      toast({
        title: 'دسترسی محدود',
        description: 'شما اجازه دسترسی به این بخش را ندارید',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    fetchData(activeTab);
  }, [profile, activeTab, navigate]);

  const fetchData = async (tab: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      switch (tab) {
        case 'users':
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (userError) throw userError;
          setUsers(userData as User[]);
          break;

        case 'announcements':
          const { data: announcementData, error: announcementError } = await supabase
            .from('announcements')
            .select(`
              *,
              author:users(name)
            `)
            .order('created_at', { ascending: false });
          
          if (announcementError) throw announcementError;
          setAnnouncements(announcementData as Announcement[]);
          break;

        case 'events':
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select(`
              *,
              organizer:users(name),
              registrations_count:event_registrations(count)
            `)
            .order('date', { ascending: true });
          
          if (eventError) throw eventError;
          
          const eventsWithRegistrationCount = eventData.map(event => ({
            ...event,
            registrations_count: event.registrations_count?.length || 0
          }));
          
          setEvents(eventsWithRegistrationCount as Event[]);
          break;

        case 'submissions':
          const { data: submissionData, error: submissionError } = await supabase
            .from('submissions')
            .select(`
              *,
              user:users(name, email)
            `)
            .order('submitted_at', { ascending: false });
          
          if (submissionError) throw submissionError;
          setSubmissions(submissionData as Submission[]);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      toast({
        title: 'خطا در بارگذاری اطلاعات',
        description: 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: 'نقش کاربر بروزرسانی شد',
        description: `نقش کاربر با موفقیت به ${newRole} تغییر یافت`,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'خطا در بروزرسانی نقش کاربر',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;

      // Update local state
      setSubmissions(submissions.map(submission => 
        submission.id === id ? { ...submission, status } : submission
      ));

      toast({
        title: 'وضعیت مقاله بروزرسانی شد',
        description: `مقاله با موفقیت ${status === 'approved' ? 'تایید' : 'رد'} شد`,
      });
    } catch (error: any) {
      console.error('Error updating submission status:', error);
      toast({
        title: 'خطا در بروزرسانی وضعیت مقاله',
        description: error.message || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const userColumns = [
    {
      header: 'نام',
      cell: ({ row }: { row: any }) => <div>{row.name || 'بدون نام'}</div>
    },
    {
      header: 'ایمیل',
      cell: ({ row }: { row: any }) => <div>{row.email}</div>
    },
    {
      header: 'نقش',
      cell: ({ row }: { row: any }) => (
        <Badge 
          variant={
            row.role === 'admin' ? 'destructive' :
            row.role === 'member' ? 'default' : 'secondary'
          }
        >
          {row.role === 'admin' ? 'مدیر' :
           row.role === 'member' ? 'عضو' : 'دانشجو'}
        </Badge>
      )
    },
    {
      header: 'تاریخ ثبت‌نام',
      cell: ({ row }: { row: any }) => <div>{formatDate(row.created_at)}</div>
    },
    {
      header: 'عملیات',
      cell: ({ row }: { row: any }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleUpdateUserRole(row.id, 'student')}>
              <UserIcon className="ml-2 h-4 w-4" />
              تغییر به دانشجو
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateUserRole(row.id, 'member')}>
              <Shield className="ml-2 h-4 w-4" />
              تغییر به عضو انجمن
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateUserRole(row.id, 'admin')}>
              <Shield className="ml-2 h-4 w-4" />
              تغییر به مدیر
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const announcementColumns = [
    {
      header: 'عنوان',
      cell: ({ row }: { row: any }) => <div className="font-medium">{row.title}</div>
    },
    {
      header: 'نویسنده',
      cell: ({ row }: { row: any }) => <div>{row.author?.name || 'ناشناس'}</div>
    },
    {
      header: 'تاریخ انتشار',
      cell: ({ row }: { row: any }) => <div>{formatDate(row.created_at)}</div>
    },
    {
      header: 'عملیات',
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/announcements/${row.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/admin/announcements/edit/${row.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              // Delete functionality would go here
              alert('حذف اطلاعیه: ' + row.id);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const eventColumns = [
    {
      header: 'عنوان',
      cell: ({ row }: { row: any }) => <div className="font-medium">{row.title}</div>
    },
    {
      header: 'تاریخ برگزاری',
      cell: ({ row }: { row: any }) => <div>{formatDate(row.date)}</div>
    },
    {
      header: 'ثبت‌نام / ظرفیت',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Progress 
            value={(row.registrations_count / row.capacity) * 100} 
            className="h-2 w-24" 
          />
          <span className="text-sm">
            {row.registrations_count} / {row.capacity}
          </span>
        </div>
      )
    },
    {
      header: 'برگزارکننده',
      cell: ({ row }: { row: any }) => <div>{row.organizer?.name || 'ناشناس'}</div>
    },
    {
      header: 'عملیات',
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/events/${row.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/admin/events/edit/${row.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              // Delete functionality would go here
              alert('حذف رویداد: ' + row.id);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const submissionColumns = [
    {
      header: 'عنوان',
      cell: ({ row }: { row: any }) => <div className="font-medium">{row.title}</div>
    },
    {
      header: 'نویسنده',
      cell: ({ row }: { row: any }) => <div>{row.user?.name || row.user?.email || 'ناشناس'}</div>
    },
    {
      header: 'تاریخ ارسال',
      cell: ({ row }: { row: any }) => <div>{formatDate(row.submitted_at)}</div>
    },
    {
      header: 'وضعیت',
      cell: ({ row }: { row: any }) => (
        <Badge 
          variant={
            row.status === 'approved' ? 'default' :
            row.status === 'rejected' ? 'destructive' : 'secondary'
          }
        >
          {row.status === 'approved' ? 'تایید شده' :
           row.status === 'rejected' ? 'رد شده' : 'در انتظار بررسی'}
        </Badge>
      )
    },
    {
      header: 'عملیات',
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              // View functionality would go here
              alert('مشاهده مقاله: ' + row.id);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-green-600"
            onClick={() => handleUpdateSubmissionStatus(row.id, 'approved')}
            disabled={row.status === 'approved'}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-red-600"
            onClick={() => handleUpdateSubmissionStatus(row.id, 'rejected')}
            disabled={row.status === 'rejected'}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">پنل مدیریت</h1>
        <p className="text-muted-foreground">مدیریت کاربران، اطلاعیه‌ها، رویدادها و مقالات</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users">کاربران</TabsTrigger>
          <TabsTrigger value="announcements">اطلاعیه‌ها</TabsTrigger>
          <TabsTrigger value="events">رویدادها</TabsTrigger>
          <TabsTrigger value="submissions">مقالات</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex justify-between items-center">
                <span>مدیریت کاربران</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-navy" />
                </div>
              ) : (
                <DataTable 
                  columns={userColumns} 
                  data={users} 
                  searchKey="email"
                  searchPlaceholder="جستجو بر اساس ایمیل..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex justify-between items-center">
                <span>مدیریت اطلاعیه‌ها</span>
                <Button 
                  className="bg-gold text-black hover:bg-gold/90"
                  onClick={() => navigate('/admin/announcements/new')}
                >
                  اطلاعیه جدید
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-navy" />
                </div>
              ) : (
                <DataTable 
                  columns={announcementColumns} 
                  data={announcements} 
                  searchKey="title"
                  searchPlaceholder="جستجو بر اساس عنوان..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex justify-between items-center">
                <span>مدیریت رویدادها</span>
                <Button 
                  className="bg-gold text-black hover:bg-gold/90"
                  onClick={() => navigate('/admin/events/new')}
                >
                  رویداد جدید
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-navy" />
                </div>
              ) : (
                <DataTable 
                  columns={eventColumns} 
                  data={events} 
                  searchKey="title"
                  searchPlaceholder="جستجو بر اساس عنوان..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">مدیریت مقالات ارسالی</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-navy" />
                </div>
              ) : (
                <DataTable 
                  columns={submissionColumns} 
                  data={submissions} 
                  searchKey="title"
                  searchPlaceholder="جستجو بر اساس عنوان..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
