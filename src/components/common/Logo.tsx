
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Event Horizon Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            fill="none"
          />
          
          {/* Inner Black Hole */}
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="currentColor"
            className="text-primary"
          />
          
          {/* Accretion Disk */}
          <ellipse
            cx="50"
            cy="50"
            rx="35"
            ry="8"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary opacity-70"
            fill="none"
          />
          
          {/* Scientific Elements - Orbiting Particles */}
          <circle cx="20" cy="50" r="2" fill="currentColor" className="text-primary opacity-80">
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="10s"
              repeatCount="indefinite"
            />
          </circle>
          
          <circle cx="80" cy="50" r="2" fill="currentColor" className="text-primary opacity-80">
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="180 50 50"
              to="540 50 50"
              dur="10s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* Knowledge Book Symbol */}
          <rect
            x="42"
            y="15"
            width="16"
            height="12"
            rx="1"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary"
            fill="none"
          />
          <line x1="45" y1="18" x2="55" y2="18" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
          <line x1="45" y1="21" x2="55" y2="21" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
          <line x1="45" y1="24" x2="52" y2="24" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold ${textSizeClasses[size]} text-foreground leading-tight`}>
            Event Horizon Society
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            انجمن علمی افق رویداد
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
