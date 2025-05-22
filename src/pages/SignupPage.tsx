
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { usePasswordSecurity } from '@/hooks/use-password-security';

// Validation schema
const nameSchema = z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد');
const emailSchema = z.string().email('ایمیل وارد شده معتبر نیست');
const passwordSchema = z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد');

const SignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordCompromised, setIsPasswordCompromised] = useState(false);
  const [occurrences, setOccurrences] = useState(0);
  
  const { signUp, user } = useAuth();
  const { checkLeakedPassword, getPasswordStrength } = usePasswordSecurity();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    let isValid = true;

    // Validate first name
    try {
      nameSchema.parse(firstName);
      setFirstNameError('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFirstNameError(error.errors[0].message);
        isValid = false;
      }
    }

    // Validate last name
    try {
      nameSchema.parse(lastName);
      setLastNameError('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setLastNameError(error.errors[0].message);
        isValid = false;
      }
    }

    // Validate email
    try {
      emailSchema.parse(email);
      setEmailError('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
        isValid = false;
      }
    }

    // Validate password
    try {
      passwordSchema.parse(password);
      setPasswordError('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
        isValid = false;
      }
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setConfirmPasswordError('رمزهای عبور مطابقت ندارند');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handlePasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (newPassword.length >= 8) {
      const compromised = await checkLeakedPassword(newPassword);
      setIsPasswordCompromised(compromised);
    }
    
    if (passwordError || confirmPasswordError) validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Reject weak passwords
    if (getPasswordStrength(password) < 3) {
      setPasswordError('لطفا از یک رمز عبور قوی‌تر استفاده کنید');
      return;
    }
    
    // Reject compromised passwords
    if (isPasswordCompromised) {
      setPasswordError('این رمز عبور در نشت‌های داده یافت شده است. لطفا رمز دیگری انتخاب کنید');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await signUp(email, password, fullName);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">ایجاد حساب کاربری</CardTitle>
            <CardDescription className="text-center">
              اطلاعات خود را برای ایجاد حساب کاربری وارد کنید
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">نام</Label>
                  <Input 
                    id="firstName" 
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (firstNameError) validateForm();
                    }}
                    className={firstNameError ? "border-red-500" : ""}
                    required 
                  />
                  {firstNameError && (
                    <p className="text-sm text-red-500">{firstNameError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">نام خانوادگی</Label>
                  <Input 
                    id="lastName" 
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (lastNameError) validateForm();
                    }}
                    className={lastNameError ? "border-red-500" : ""}
                    required 
                  />
                  {lastNameError && (
                    <p className="text-sm text-red-500">{lastNameError}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateForm();
                  }}
                  className={emailError ? "border-red-500" : ""}
                  required 
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={handlePasswordChange}
                  className={passwordError ? "border-red-500" : ""}
                  required 
                />
                {password && password.length >= 6 && (
                  <PasswordStrengthMeter 
                    password={password}
                    isCompromised={isPasswordCompromised}
                    occurrences={occurrences}
                  />
                )}
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأیید رمز عبور</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) validateForm();
                  }}
                  className={confirmPasswordError ? "border-red-500" : ""}
                  required 
                />
                {confirmPasswordError && (
                  <p className="text-sm text-red-500">{confirmPasswordError}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-navy hover:bg-navy/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    در حال ایجاد حساب...
                  </>
                ) : 'ایجاد حساب'}
              </Button>
              <div className="text-center text-sm">
                قبلاً حساب کاربری ایجاد کرده‌اید؟{" "}
                <Link to="/login" className="text-gold hover:underline">
                  ورود
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
