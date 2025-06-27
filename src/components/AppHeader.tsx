
'use client';
import { Button } from '@/components/ui/button';
import { UserCircle, Bell, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import ScolaTimeLogo from './ScolaTimeLogo';

const navItems = [
  { href: '/', label: 'Tableau de Bord' },
  { href: '/wizard', label: 'Générateur' },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium mt-8">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                <ScolaTimeLogo className="h-8 w-auto text-primary" />
                <span>ShudWelcome</span>
              </Link>
              {navItems.map((item) => (
                 <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
                   {item.label}
                 </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserCircle className="h-6 w-6" />
          <span className="sr-only">Menu Utilisateur</span>
        </Button>
      </div>
    </header>
  );
}
