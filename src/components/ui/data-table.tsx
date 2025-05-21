
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DataTableProps {
  columns: {
    header: string;
    cell: React.FC<{ row: any }>;
  }[];
  data: any[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'جستجو...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = searchKey
    ? data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data;

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 w-full md:max-w-sm"
          />
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="text-right">{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  داده‌ای یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell({ row })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// No need for these exports as we now import them directly
// export { Badge } from '@/components/ui/badge';
// export { Progress } from '@/components/ui/progress';
