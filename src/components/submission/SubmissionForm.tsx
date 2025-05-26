
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { z } from 'zod';

// Validation schema
const submissionSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  content: z.string().min(10, 'محتوا باید حداقل ۱۰ کاراکتر باشد'),
});

interface SubmissionFormProps {
  onSubmit: (title: string, content: string) => Promise<void>;
  isSubmitting: boolean;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      submissionSchema.parse({ title, content });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(title, content);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>فرم ارسال درخواست</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان درخواست</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-red-500" : ""}
              required
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">متن درخواست</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`min-h-[200px] resize-y ${errors.content ? "border-red-500" : ""}`}
              required
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              پس از ارسال درخواست، می‌توانید مقاله خود را به صورت PDF ضمیمه کنید.
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال ارسال...
              </>
            ) : (
              <>
                <Send className="ml-2 h-4 w-4" />
                ارسال درخواست
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
