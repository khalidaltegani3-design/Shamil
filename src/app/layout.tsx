import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Zoliapp Lite',
  description: 'An intuitive chat interface for seamless messaging.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet" />
      </head>
      <body className="font-doodle antialiased">
        <div className="flex h-screen w-full max-w-md mx-auto flex-col relative">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
