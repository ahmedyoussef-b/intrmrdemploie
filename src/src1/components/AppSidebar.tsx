
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import ScolaTimeLogo from "./ScolaTimeLogo";


export interface NavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  disabled?: boolean;
  external?: boolean;
}

interface AppSidebarProps {
  navItems: NavItem[];
}

export function AppSidebar({ navItems }: AppSidebarProps) {
  const pathname = usePathname();

  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>(() => {
    const activeSubmenus: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.subItems) {
        if (item.subItems.some(subItem => subItem.href && pathname.startsWith(subItem.href))) {
          activeSubmenus[item.label] = true;
        }
      }
    });
    return activeSubmenus;
  });

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
  React.useEffect(() => {
    const activeSubmenus: Record<string, boolean> = {};
    let submenuOpened = false;
    navItems.forEach(item => {
      if (item.subItems) {
        if (item.subItems.some(subItem => subItem.href && pathname.startsWith(subItem.href))) {
          activeSubmenus[item.label] = true;
          submenuOpened = true;
        } else {
           activeSubmenus[item.label] = openSubmenus[item.label] || false; 
        }
      }
    });
    // Only update if there's a change based on path, otherwise keep user preference
    if (submenuOpened && JSON.stringify(activeSubmenus) !== JSON.stringify(openSubmenus) ) {
       setOpenSubmenus(activeSubmenus);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, navItems]);


  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = item.href ? pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) : false;
    const Icon = item.icon;
    const isSubmenuOpen = item.subItems && openSubmenus[item.label];

    const buttonClass = cn(
      "w-full justify-start",
      isActive && !isSubItem && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
      isActive && isSubItem && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
      !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      isSubItem && "text-sm h-9 pl-6",
      !isSubItem && "text-base h-10"
    );
    
    const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;

    if (item.subItems) {
      return (
        <SidebarMenuItem key={item.label} className="w-full">
           <Button
            variant="ghost"
            className={cn(buttonClass, "flex justify-between items-center")}
            onClick={() => toggleSubmenu(item.label)}
            aria-expanded={isSubmenuOpen}
            tooltip={item.label}
          >
            <div className="flex items-center">
              <Icon className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "" : "text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground")} />
              <span className="truncate">{item.label}</span>
            </div>
            {isSubmenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          {isSubmenuOpen && (
            <SidebarMenuSub>
              {item.subItems.map(subItem => (
                <SidebarMenuSubItem key={subItem.label}>
                  {renderNavItem(subItem, true)}
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }

    const navLinkContent = (
      <ButtonComponent
        asChild={!item.disabled && !!item.href}
        className={buttonClass}
        isActive={isActive}
        disabled={item.disabled}
        tooltip={item.label}
      >
        {item.href && !item.disabled ? (
          <Link href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}>
            <Icon className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "" : "text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground")} />
            <span className="truncate">{item.label}</span>
          </Link>
        ) : (
          <>
            <Icon className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "" : "text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground")} />
            <span className="truncate">{item.label}</span>
          </>
        )}
      </ButtonComponent>
    );
    
    return isSubItem ? navLinkContent : <SidebarMenuItem key={item.label} className="w-full">{navLinkContent}</SidebarMenuItem>;
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border shadow-md">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <ScolaTimeLogo className="h-8 w-auto text-sidebar-primary transition-all duration-300 group-data-[collapsible=icon]:h-7" />
          <span className="font-headline text-xl font-semibold text-sidebar-foreground transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
            ScolaTime
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map(item => renderNavItem(item))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {/* Footer content if needed, e.g. user profile quick view */}
      </SidebarFooter>
    </Sidebar>
  );
}

