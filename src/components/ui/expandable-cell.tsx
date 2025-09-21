"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpandableCellProps {
  content: string;
  maxWidth?: string;
  className?: string;
  showCopyButton?: boolean;
  label?: string;
}

export function ExpandableCell({ 
  content, 
  maxWidth = "200px", 
  className = "", 
  showCopyButton = true,
  label = "المحتوى الكامل"
}: ExpandableCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ",
        description: "تم نسخ النص إلى الحافظة",
        duration: 2000,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ في النسخ",
        description: "لم نتمكن من نسخ النص",
        duration: 2000,
      });
    }
  };

  return (
    <div className={`${className}`} style={{ maxWidth }}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div 
            className="truncate cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            title="انقر لعرض النص كاملاً"
          >
            {content}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm leading-relaxed break-all select-all">
                {content}
              </p>
            </div>
            {showCopyButton && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(content)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  نسخ
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  إغلاق
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}