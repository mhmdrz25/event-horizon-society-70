
import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface AnnouncementTableProps {
  announcements: Announcement[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
}

const AnnouncementTable: React.FC<AnnouncementTableProps> = ({ announcements, isLoading, formatDate }) => {
  const navigate = useNavigate();

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

  return (
    <DataTable 
      columns={announcementColumns} 
      data={announcements} 
      searchKey="title"
      searchPlaceholder="جستجو بر اساس عنوان..."
    />
  );
};

export default AnnouncementTable;
