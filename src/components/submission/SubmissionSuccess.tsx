
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FileUploadForm from '@/components/submission/FileUploadForm';

interface SubmissionSuccessProps {
  submissionId: string;
}

const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ submissionId }) => {
  return (
    <div className="container py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium">درخواست شما با موفقیت ارسال شد</h3>
            <p className="text-gray-600">
              درخواست شما در انتظار بررسی است. می‌توانید مقاله خود را به صورت PDF ضمیمه کنید.
            </p>
            
            {/* File Upload Section */}
            <div className="pt-4">
              <FileUploadForm submissionId={submissionId} />
            </div>
            
            <div className="pt-4">
              <Button onClick={() => window.location.href = '/'}>
                بازگشت به صفحه اصلی
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionSuccess;
