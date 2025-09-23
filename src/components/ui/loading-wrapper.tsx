"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface LoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
  className?: string;
}

export function LoadingWrapper({ 
  isLoading, 
  children, 
  loadingText = "جارٍ التحميل...",
  className = ""
}: LoadingWrapperProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}