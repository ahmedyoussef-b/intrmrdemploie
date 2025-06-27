
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ScolaTimeLogo from './ScolaTimeLogo';
import { Home, Sparkles, Settings, Puzzle, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
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

export function AppSidebar() {
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
      const isParentActive = item.subItems.some(sub => sub.href && pathname.startsWith(sub.href));
      const isOpen = openSubMenus[item.label];

      return (
        <div>
          <Button
            variant={isParentActive && !isOpen ? 'secondary' : 'ghost'}
            className="w-full justify-between"
            onClick={() => toggleSubMenu(item.label)}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </div>
            <ChevronRight className={cn('transition-transform duration-200', isOpen && 'rotate-90')} />
          </Button>
          {isOpen && (
            <div className="pl-6 mt-1 space-y-1">
              {item.subItems.map(subItem => <NavItem key={subItem.label} item={subItem} />)}
            </div>
          )}
        </div>
      );
    }
    
    const isActive = pathname === item.href;
    return (
      <Link href={item.href!} passHref>
        <Button variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start">
          <item.icon className="mr-3 h-5 w-5" />
          {item.label}
        </Button>
      </Link>
    );
  };

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-card">
      <div className="h-16 flex items-center justify-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <ScolaTimeLogo className="h-8 w-auto text-primary" />
          <span className="font-bold text-xl text-primary">ShudWelcome</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => <NavItem key={item.label} item={item} />)}
      </nav>
    </div>
  );
}
