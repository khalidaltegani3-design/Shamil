import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a placeholder for a proper Arabic/English font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// If the ministry has a specific font, we can add it here.
// For now, Inter is a good, clean, and versatile choice.
const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'منصة البلاغات الداخلية - وزارة البلدية',
  description: 'نظام داخلي لإدارة ومتابعة البلاغات بين موظفي الوزارة.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${font.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}