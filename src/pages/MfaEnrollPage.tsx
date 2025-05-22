
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, QrCode, Phone, Check, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

// Component for OTP Input
const OTPInput = ({ value, onChange, disabled = false }) => {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="justify-center"
      render={({ slots }) => (
        <InputOTPGroup className="gap-2">
          {slots.map((slot, index) => (
            <InputOTPSlot key={index} {...slot} index={index} className="w-11 h-12 text-lg" />
          ))}
        </InputOTPGroup>
      )}
    />
  );
};

const MfaEnrollPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('totp');
  const [isLoading, setIsLoading] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [smsFactorId, setSmsFactorId] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  // If no user, redirect to login
  useEffect(() => {
    if (!user) {
      toast({
        title: 'دسترسی محدود',
        description: 'برای فعال‌سازی احراز هویت دو مرحله‌ای، ابتدا وارد سیستم شوید',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [user, navigate]);

  // Generate TOTP secret
  useEffect(() => {
    const generateTotpSecret = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
        });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setTotpSecret(data.totp.secret);
          setTotpUri(data.totp.uri);
          setFactorId(data.id);
        }
      } catch (error: any) {
        toast({
          title: 'خطا در تنظیم احراز هویت دو مرحله‌ای',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && activeTab === 'totp') {
      generateTotpSecret();
    }
  }, [user, activeTab]);

  const handleVerifyTotp = async () => {
    if (!user || !factorId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: factorId,
      });
      
      if (error) {
        throw error;
      }
      
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: data!.id,
        code: verificationCode,
      });
      
      if (verifyError) {
        throw verifyError;
      }
      
      toast({
        title: 'احراز هویت دو مرحله‌ای فعال شد',
        description: 'احراز هویت دو مرحله‌ای با موفقیت فعال شد',
      });
      
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'خطا در تأیید کد',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!user || !phoneNumber) return;
    
    try {
      setIsLoading(true);
      setOtpSending(true);
      
      // 1. Enroll the phone factor with Supabase
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'phone',
        phone: phoneNumber,
      });
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('خطا در دریافت اطلاعات فاکتور');
      }
      
      setSmsFactorId(data.id);
      
      // 2. Generate a 6-digit code
      // Supabase already generates this code internally, but we need to send it via our service
      // This would typically be generated on the server, but for demo we'll create it here
      // In production, you should use the edge function to generate this
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 3. Send the code via our custom edge function (Kavenegar)
      const sendResponse = await fetch(`${supabase.supabaseUrl}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code,
          factorId: data.id
        })
      });
      
      if (!sendResponse.ok) {
        const errorData = await sendResponse.json();
        throw new Error(errorData.error || 'خطا در ارسال کد تأیید');
      }
      
      setSmsSent(true);
      
      toast({
        title: 'کد تأیید ارسال شد',
        description: 'کد تأیید به شماره تلفن شما ارسال شد',
      });
      
    } catch (error: any) {
      toast({
        title: 'خطا در ارسال کد تأیید',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setOtpSending(false);
    }
  };

  const handleVerifySms = async () => {
    if (!user || !smsCode || !smsFactorId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: smsFactorId,
      });
      
      if (error) {
        throw error;
      }
      
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: smsFactorId,
        challengeId: data!.id,
        code: smsCode,
      });
      
      if (verifyError) {
        throw verifyError;
      }
      
      toast({
        title: 'احراز هویت دو مرحله‌ای فعال شد',
        description: 'احراز هویت دو مرحله‌ای با موفقیت فعال شد',
      });
      
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'خطا در تأیید کد',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret);
      toast({
        title: 'کد کپی شد',
        description: 'کد مخفی در کلیپ‌بورد کپی شد',
      });
    }
  };

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">احراز هویت دو مرحله‌ای</h1>
        <p className="text-muted-foreground">با فعال‌سازی احراز هویت دو مرحله‌ای، امنیت حساب کاربری خود را افزایش دهید</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>فعال‌سازی احراز هویت دو مرحله‌ای</CardTitle>
          <CardDescription>
            یکی از روش‌های زیر را برای فعال‌سازی احراز هویت دو مرحله‌ای انتخاب کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="totp">اپلیکیشن احراز هویت</TabsTrigger>
              <TabsTrigger value="sms">پیامک</TabsTrigger>
            </TabsList>

            <TabsContent value="totp" className="space-y-4 mt-4">
              {isLoading && !totpUri ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-2 text-center">
                    <p>برای اسکن کد QR از اپلیکیشن‌های احراز هویت مانند Google Authenticator یا Microsoft Authenticator استفاده کنید</p>
                    
                    {totpUri && (
                      <div className="flex justify-center my-4">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                          alt="QR Code"
                          className="border rounded-md p-2 bg-white"
                          width={200}
                          height={200}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center space-x-2 space-x-reverse mt-2">
                      <Label>کد مخفی:</Label>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{totpSecret}</code>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={copyToClipboard} 
                        title="کپی کد"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <div className="text-center">
                      <Label htmlFor="verificationCode" className="mb-2 block">کد تأیید</Label>
                      <OTPInput 
                        value={verificationCode} 
                        onChange={setVerificationCode}
                        disabled={isLoading}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        کد 6 رقمی نمایش داده شده در اپلیکیشن را وارد کنید
                      </p>
                    </div>
                    <Button 
                      className="w-full mt-4"
                      onClick={handleVerifyTotp}
                      disabled={isLoading || verificationCode.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          در حال بررسی...
                        </>
                      ) : (
                        <>
                          <Check className="ml-2 h-4 w-4" />
                          تأیید و فعال‌سازی
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="sms" className="space-y-4 mt-4">
              {!smsSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">شماره تلفن همراه</Label>
                    <div className="flex space-x-2 space-x-reverse">
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="09123456789"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 text-left"
                        dir="ltr"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      شماره تلفن همراه خود را با فرمت 09XXXXXXXXX وارد کنید
                    </p>
                  </div>

                  <Button 
                    className="w-full mt-4"
                    onClick={handleSendSms}
                    disabled={isLoading || phoneNumber.length !== 11}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        <Phone className="ml-2 h-4 w-4" />
                        ارسال کد تأیید
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="text-center">
                      <Label htmlFor="smsCode" className="mb-2 block">کد تأیید</Label>
                      <OTPInput 
                        value={smsCode} 
                        onChange={setSmsCode}
                        disabled={isLoading}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        کد تأیید ارسال شده به شماره {phoneNumber} را وارد کنید
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2 space-x-reverse mt-6">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSmsSent(false)}
                      disabled={isLoading}
                    >
                      تغییر شماره
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleVerifySms}
                      disabled={isLoading || smsCode.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          در حال بررسی...
                        </>
                      ) : (
                        <>
                          <Check className="ml-2 h-4 w-4" />
                          تأیید و فعال‌سازی
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          احراز هویت دو مرحله‌ای باعث افزایش امنیت حساب کاربری شما می‌شود
        </CardFooter>
      </Card>
    </div>
  );
};

export default MfaEnrollPage;
