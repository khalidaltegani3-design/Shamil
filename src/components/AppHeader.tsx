import React from 'react';
import Logo from './Logo';
import HeaderWithImage from './HeaderWithImage';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  logoSize?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
  showHeaderImage?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showLogo = true,
  logoSize = 'md',
  className = '',
  children,
  showHeaderImage = false
}) => {
  return (
    <>
      {showHeaderImage && <HeaderWithImage />}
      <header className={`flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 ${className}`}>
        <div className="flex items-center gap-4">
          {title && (
            <h1 className="text-lg font-semibold">{title}</h1>
          )}
        </div>
        
        {showLogo && (
          <div className="flex items-center justify-center">
            <Logo size={logoSize} />
          </div>
        )}
        
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </header>
    </>
  );
};

export default AppHeader;
