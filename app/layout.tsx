import './globals.css';
import '@/styles/main.scss';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Institute Service Portal',
  description: 'Complete Institute Service Portal with role-based authentication',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
