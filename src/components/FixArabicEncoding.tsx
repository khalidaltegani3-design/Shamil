"use client";

import { useEffect } from 'react';

export function FixArabicEncoding() {
  useEffect(() => {
    // إضافة meta tag للتشفير إذا لم تكن موجودة
    const existingCharset = document.querySelector('meta[charset]');
    if (!existingCharset) {
      const charsetMeta = document.createElement('meta');
      charsetMeta.setAttribute('charset', 'utf-8');
      document.head.insertBefore(charsetMeta, document.head.firstChild);
    }

    // إضافة Content-Type meta
    const existingContentType = document.querySelector('meta[http-equiv="Content-Type"]');
    if (!existingContentType) {
      const contentTypeMeta = document.createElement('meta');
      contentTypeMeta.setAttribute('http-equiv', 'Content-Type');
      contentTypeMeta.setAttribute('content', 'text/html; charset=utf-8');
      document.head.appendChild(contentTypeMeta);
    }

    // تأكد من إعداد lang و dir للصفحة
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');

    // مسح cache للخطوط والنصوص
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }

    // إجبار إعادة تحميل الخطوط
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap';
    fontLink.as = 'style';
    fontLink.onload = function() {
      this.onload = null;
      (this as HTMLLinkElement).rel = 'stylesheet';
    };
    document.head.appendChild(fontLink);
  }, []);

  return null;
}