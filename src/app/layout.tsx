import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import Header from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";
import DynamicYear from '@/components/layout/dynamic-year';

export const metadata: Metadata = {
  title: 'VoteCast - Real-Time Polling',
  description: 'Create polls, vote, and see live results with VoteCast.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="py-4 text-center text-sm text-muted-foreground">
            © <DynamicYear /> VoteCast. All rights reserved.
          </footer>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
