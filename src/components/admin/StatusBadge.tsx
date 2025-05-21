
import React from 'react';
import { CustomBadge } from '@/components/ui/custom-badge';

type Status = 'pending' | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeMap: Record<Status, { variant: "default" | "success" | "destructive", label: string }> = {
    pending: { variant: "default", label: "در انتظار بررسی" },
    approved: { variant: "success", label: "تایید شده" },
    rejected: { variant: "destructive", label: "رد شده" }
  };

  const { variant, label } = badgeMap[status];

  return (
    <CustomBadge variant={variant}>
      {label}
    </CustomBadge>
  );
};

export default StatusBadge;
