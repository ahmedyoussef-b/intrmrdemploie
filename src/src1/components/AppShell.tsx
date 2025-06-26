
"use client";

import type * as React from 'react';
import { AppSidebar, type NavItem } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, CalendarPlus, Settings, School, CalendarDays, History, Puzzle, FileText } from 'lucide-react';

const mainNavItems: NavItem[] = [
  { href: "/", label: "Tableau de Bord", icon: LayoutDashboard },
  { 
    label: "Emplois du Temps", 
    icon: CalendarDays,
    subItems: [
      { href: "/admin/timetable/generate", label: "Générer Nouveau", icon: CalendarPlus },
      { href: "/timetables/view/class", label: "Voir (Classe)", icon: Users },
      { href: "/timetables/view/teacher", label: "Voir (Enseignant)", icon: Users },
    ]
  },
  { href: "/admin", label: "Panneau Admin", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Tableau de Bord Admin", icon: LayoutDashboard },
  { 
    label: "Données de Base", 
    icon: School,
    subItems: [
      { href: "/admin/schools", label: "Établissements", icon: School },
      { href: "/admin/academic-years", label: "Années Académiques", icon: CalendarDays },
      { href: "/admin/terms", label: "Périodes", icon: History },
    ]
  },
  { 
    label: "Entités", 
    icon: Users,
    subItems: [
      { href: "/admin/classes", label: "Classes", icon: Users },
      { href: "/admin/teachers", label: "Enseignants", icon: Users },
      { href: "/admin/students", label: "Élèves", icon: Users },
      { href: "/admin/subjects", label: "Matières", icon: BookOpen },
      { href: "/admin/rooms", label: "Salles", icon: LayoutDashboard }, 
    ]
  },
  { 
    label: "Planification", 
    icon: CalendarPlus,
    subItems: [
      { href: "/admin/timetable/generate", label: "Générer Emploi du Temps", icon: CalendarPlus },
      { href: "/admin/constraints", label: "Contraintes", icon: Puzzle },
    ]
  },
  { href: "/", label: "Retour à l'App Principale", icon: FileText },
];


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminSection = pathname.startsWith('/admin');
  const navItems = isAdminSection ? adminNavItems : mainNavItems;

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar navItems={navItems} />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
