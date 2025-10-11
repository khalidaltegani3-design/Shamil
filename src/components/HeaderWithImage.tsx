import React from 'react';
import Image from 'next/image';

interface HeaderWithImageProps {
  className?: string;
  showText?: boolean;
}

const HeaderWithImage: React.FC<HeaderWithImageProps> = ({ 
  className = '',
  showText = true
}) => {
  return (
    <header className={`w-full ${className}`}>
      <div className="relative w-full h-32 md:h-40 lg:h-48">
        <Image
          src="/head.png.PNG"
          alt="هوية بلدية الريان"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
      {showText && (
        <div className="w-full bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-2">
            <p className="text-center text-sm md:text-base text-muted-foreground font-medium">
              بلدية الريان - نظام البلاغات الداخلية
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderWithImage;
