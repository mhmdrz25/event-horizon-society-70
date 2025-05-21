
import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface SubmissionTableProps {
  submissions: Submission[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
  handleUpdateSubmissionStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

const SubmissionTable: React.FC<SubmissionTableProps> = ({ 
  submissions, 
  isLoading, 
  formatDate, 
  handleUpdateSubmissionStatus 
}) => {
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
    <DataTable 
      columns={submissionColumns} 
      data={submissions} 
      searchKey="title"
      searchPlaceholder="جستجو بر اساس عنوان..."
    />
  );
};

export default SubmissionTable;
