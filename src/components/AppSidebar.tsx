
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ScolaTimeLogo from './ScolaTimeLogo';
import { Home, Sparkles, Settings, Puzzle } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Tableau de Bord', icon: Home },
  { href: '/wizard', label: 'Générateur', icon: Sparkles },
  { href: '/admin/constraints', label: 'Contraintes', icon: Puzzle },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-card">
      <div className="h-16 flex items-center justify-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <ScolaTimeLogo className="h-8 w-auto text-primary" />
          <span className="font-bold text-xl text-primary">ShudWelcome</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} passHref>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 border-t">
        <Link href="/admin">
         <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-3 h-5 w-5" />
            Administration
         </Button>
        </Link>
      </div>
    </div>
  );
}
