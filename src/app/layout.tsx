import type { Metadata } from 'next';
import { Inter, Amiri } from 'next/font/google'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ConnectionWrapper } from "@/components/connection-wrapper";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FixArabicEncoding } from "@/components/FixArabicEncoding";
import AppFooter from "@/components/app-footer";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
});

export const metadata: Metadata = {
  title: 'بلدية الريان - نظام البلاغات الداخلية',
  description: 'نظام إدارة ومتابعة البلاغات في بلدية الريان.',
  metadataBase: new URL('http://localhost:3000'),
  other: {
    'Content-Type': 'text/html; charset=utf-8',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} ${amiri.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <FixArabicEncoding />
        <LanguageProvider>
          <ConnectionWrapper />
          <main className="flex-1">
            {children}
          </main>
          <AppFooter />
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
