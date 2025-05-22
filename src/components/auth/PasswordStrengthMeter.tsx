
import React from 'react';
import { usePasswordSecurity } from '@/hooks/use-password-security';
import { AlertCircle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  isCompromised?: boolean;
  occurrences?: number;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  isCompromised,
  occurrences
}) => {
  const { getPasswordStrength, getStrengthLabel, getStrengthColor } = usePasswordSecurity();
  
  const strength = getPasswordStrength(password);
  const label = getStrengthLabel(strength);
  const color = getStrengthColor(strength);
  
  if (!password) {
    return null;
  }
  
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs">{label}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
        {[...Array(5)].map((_, index) => (
          <div 
            key={index}
            className={`h-full flex-1 ${index < strength ? color : 'bg-gray-200'} ${index > 0 ? 'ml-0.5' : ''}`}
          />
        ))}
      </div>
      
      {isCompromised && (
        <div className="flex items-center text-red-500 mt-2">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">
            این رمز عبور در {occurrences?.toLocaleString('fa-IR')} نشت داده مشاهده شده است. لطفا رمز دیگری انتخاب کنید.
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
