
import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

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

interface EventTableProps {
  events: Event[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
}

const EventTable: React.FC<EventTableProps> = ({ events, isLoading, formatDate }) => {
  const navigate = useNavigate();

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

  return (
    <DataTable 
      columns={eventColumns} 
      data={events} 
      searchKey="title"
      searchPlaceholder="جستجو بر اساس عنوان..."
    />
  );
};

export default EventTable;
