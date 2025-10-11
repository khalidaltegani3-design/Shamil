import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  inline?: boolean; // للاستخدام في نفس سطر النص
  hideText?: boolean; // لإخفاء النص تماماً
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = false,
  inline = false,
  hideText = false
}) => {
  const sizeClasses = {
    sm: 'h-6 w-16',
    md: 'h-8 w-20',
    lg: 'h-12 w-28',
    xl: 'h-16 w-36'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <div className={`relative inline-block ${sizeClasses[size]}`}>
          <Image
            src="/Logo.png.PNG"
            alt="شعار بلدية الريان"
            fill
            className="object-contain"
            priority
          />
        </div>
        {showText && !hideText && (
          <span className={`${textSizeClasses[size]} font-semibold text-muted-foreground`}>
            بلدية الريان
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <Image
          src="/Logo.png.PNG"
          alt="شعار بلدية الريان"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && !hideText && (
        <div className="hidden md:block mr-2">
          <p className={`${textSizeClasses[size]} text-muted-foreground font-medium`}>
            بلدية الريان
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
