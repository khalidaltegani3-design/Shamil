import type { Metadata } from 'next';
import { Inter, Amiri } from 'next/font/google'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
});

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
      <body className={`${inter.variable} ${amiri.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
