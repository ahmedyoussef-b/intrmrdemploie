
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import StoreProvider from './StoreProvider';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'ShudWelcome - Emploi du Temps',
  description: 'Application de gestion d\'emploi du temps, construite avec Next.js et Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <StoreProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
