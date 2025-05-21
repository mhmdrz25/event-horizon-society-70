
import React, { ReactNode } from 'react';

interface RTLProviderProps {
  children: ReactNode;
}

const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  return (
    <div dir="rtl" className="font-vazir">
      {children}
    </div>
  );
};

export default RTLProvider;
