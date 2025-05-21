
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserTable from './UserTable';
import AnnouncementTable from './AnnouncementTable';
import EventTable from './EventTable';
import SubmissionTable from './SubmissionTable';
import { UserRole } from '@/contexts/AuthContext';

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

interface TabContentProps {
  tab: 'users' | 'announcements' | 'events' | 'submissions';
  isLoading: boolean;
  users: User[];
  announcements: Announcement[];
  events: Event[];
  submissions: Submission[];
  formatDate: (dateString: string) => string;
  handleUpdateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  handleUpdateSubmissionStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

const TabContent: React.FC<TabContentProps> = ({
  tab,
  isLoading,
  users,
  announcements,
  events,
  submissions,
  formatDate,
  handleUpdateUserRole,
  handleUpdateSubmissionStatus
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  switch (tab) {
    case 'users':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex justify-between items-center">
              <span>مدیریت کاربران</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserTable
              users={users}
              isLoading={isLoading}
              formatDate={formatDate}
              handleUpdateUserRole={handleUpdateUserRole}
            />
          </CardContent>
        </Card>
      );

    case 'announcements':
      return (
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
            <AnnouncementTable
              announcements={announcements}
              isLoading={isLoading}
              formatDate={formatDate}
            />
          </CardContent>
        </Card>
      );

    case 'events':
      return (
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
            <EventTable
              events={events}
              isLoading={isLoading}
              formatDate={formatDate}
            />
          </CardContent>
        </Card>
      );

    case 'submissions':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">مدیریت مقالات ارسالی</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionTable
              submissions={submissions}
              isLoading={isLoading}
              formatDate={formatDate}
              handleUpdateSubmissionStatus={handleUpdateSubmissionStatus}
            />
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};

export default TabContent;
