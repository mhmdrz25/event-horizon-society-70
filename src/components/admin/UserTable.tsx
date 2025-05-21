
import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserRole } from '@/contexts/AuthContext';
import { Shield, User as UserIcon } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
  handleUpdateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
}

const UserTable: React.FC<UserTableProps> = ({ users, isLoading, formatDate, handleUpdateUserRole }) => {
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

  return (
    <DataTable 
      columns={userColumns} 
      data={users} 
      searchKey="email"
      searchPlaceholder="جستجو بر اساس ایمیل..."
    />
  );
};

export default UserTable;
