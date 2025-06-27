
'use client';
import { Button } from '@/components/ui/button';
import { UserCircle, Bell, Menu, Home, Sparkles, Settings, Puzzle, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import ScolaTimeLogo from './ScolaTimeLogo';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { href: '/', label: 'Tableau de Bord', icon: Home },
  { href: '/wizard', label: 'Générateur', icon: Sparkles },
  {
    label: 'Administration',
    icon: Settings,
    subItems: [
      { href: '/admin', label: 'Panneau Admin', icon: Settings },
      { href: '/admin/constraints', label: 'Contraintes', icon: Puzzle },
    ],
  },
];

function MobileNav() {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const activeSubMenu = navItems.find(item => 
      item.subItems?.some(sub => sub.href && pathname.startsWith(sub.href))
    );
    if (activeSubMenu) {
      setOpenSubMenus(prev => ({ ...prev, [activeSubMenu.label]: true }));
    }
  }, [pathname]);
  
  const toggleSubMenu = (label: string) => {
    setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const NavItem = ({ item }: { item: NavItem }) => {
    if (item.subItems) {
      const isOpen = openSubMenus[item.label];
      return (
        <div>
          <button
            onClick={() => toggleSubMenu(item.label)}
            className="flex w-full items-center justify-between text-lg font-semibold"
          >
            <span className="flex items-center gap-2"><item.icon className="h-5 w-5" />{item.label}</span>
            <ChevronRight className={cn('h-5 w-5 transition-transform', isOpen && 'rotate-90')} />
          </button>
          {isOpen && (
            <div className="pl-4 mt-2 space-y-2">
              {item.subItems.map(subItem => (
                <Link key={subItem.label} href={subItem.href!} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <subItem.icon className="h-5 w-5" />
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <Link href={item.href!} className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground">
        <item.icon className="h-5 w-5" />
        {item.label}
      </Link>
    );
  };

  return (
     <nav className="grid gap-6 text-lg font-medium mt-8">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
        <ScolaTimeLogo className="h-8 w-auto text-primary" />
        <span>ShudWelcome</span>
      </Link>
      {navItems.map(item => <NavItem key={item.label} item={item} />)}
    </nav>
  )
}

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
            <MobileNav />
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
