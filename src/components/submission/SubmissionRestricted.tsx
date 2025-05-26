
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SubmissionRestricted: React.FC = () => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">شما در حال حاضر یک درخواست در انتظار بررسی دارید</h3>
          <p className="text-gray-600">
            پس از بررسی درخواست فعلی، می‌توانید درخواست جدیدی ارسال کنید.
          </p>
          <div className="pt-4">
            <Button onClick={() => window.location.href = '/'}>
              بازگشت به صفحه اصلی
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionRestricted;
