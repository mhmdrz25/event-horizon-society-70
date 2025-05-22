
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Password validation schema with customized error messages in Persian
export const passwordSchema = z
  .string()
  .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
  .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
  .regex(/[a-z]/, 'رمز عبور باید حداقل یک حرف کوچک داشته باشد')
  .regex(/[0-9]/, 'رمز عبور باید حداقل یک رقم داشته باشد')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'رمز عبور باید حداقل یک کاراکتر خاص داشته باشد');

export const usePasswordSecurity = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isCompromised, setIsCompromised] = useState(false);
  const [occurrences, setOccurrences] = useState(0);

  // Check if password is strong enough
  const validatePasswordStrength = (password: string) => {
    try {
      passwordSchema.parse(password);
      return { valid: true, error: '' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0].message };
      }
      return { valid: false, error: 'رمز عبور نامعتبر است' };
    }
  };

  // Check if password has been leaked
  const checkLeakedPassword = async (password: string) => {
    if (!password) return false;
    
    try {
      setIsChecking(true);
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/check-leaked-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Anonymous access is enough since this doesn't need authentication
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        throw new Error('خطا در بررسی امنیت رمز عبور');
      }
      
      const data = await response.json();
      
      setIsCompromised(data.isCompromised);
      setOccurrences(data.occurrences);
      
      return data.isCompromised;
    } catch (error) {
      console.error('Error checking leaked password:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Calculate password strength score (0-4)
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    
    // Length check
    const lengthScore = Math.min(Math.floor(password.length / 3), 2);
    
    // Character variety check
    let varietyScore = 0;
    if (/[A-Z]/.test(password)) varietyScore += 1;
    if (/[a-z]/.test(password)) varietyScore += 1;
    if (/[0-9]/.test(password)) varietyScore += 1;
    if (/[^A-Za-z0-9]/.test(password)) varietyScore += 1;
    
    const totalScore = Math.min(lengthScore + varietyScore, 4);
    
    return totalScore;
  };

  // Get strength level text
  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0: return 'بسیار ضعیف';
      case 1: return 'ضعیف';
      case 2: return 'متوسط';
      case 3: return 'قوی';
      case 4: return 'بسیار قوی';
      default: return '';
    }
  };

  // Get color for password strength indicator
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-400';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  return {
    isChecking,
    isCompromised,
    occurrences,
    validatePasswordStrength,
    checkLeakedPassword,
    getPasswordStrength,
    getStrengthLabel,
    getStrengthColor,
  };
};
