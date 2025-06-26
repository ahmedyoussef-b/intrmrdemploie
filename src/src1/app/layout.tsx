
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'ScolaTime - Gestion d\'Emplois du Temps Scolaire',
  description: 'Gérez et générez efficacement les emplois du temps scolaires avec ScolaTime.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppShell>
          {children}
        </AppShell>
        <Toaster />
      </body>
    </html>
  );
}
