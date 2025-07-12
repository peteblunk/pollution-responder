"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useGameState } from "@/hooks/use-game-state";
import { Button } from "@/components/ui/button";
import { Logo, CgMotorLifeBoat } from "@/components/icons";
import { Home, User, FileText, Edit3, Ship, LifeBuoy, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/character", icon: User, label: "Character Sheet" },
  { href: "/ics-201", icon: FileText, label: "ICS-201 Form" },
  { href: "/whiteboard", icon: Edit3, label: "Whiteboard" },
  { href: "/about", icon: LifeBuoy, label: "About" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state: { character } } = useGameState();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-2">
          <SidebarHeader className="p-0">
            <div className="flex items-center gap-2 p-2">
              <Logo className="w-8 h-8 text-primary" />
              <span className="font-headline text-lg font-semibold text-primary">
                Diesel Dilemma
              </span>
            </div>
          </SidebarHeader>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 border-t">
             <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person avatar" />
                <AvatarFallback>CG</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
                <span className="font-semibold">MST1 Responder</span>
                <span className="text-muted-foreground">Active Duty</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
                <LogOut className="w-4 h-4"/>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold font-headline">
                {character.unitName ? `${character.unitName} Pollution Response Exercise` : navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <CgMotorLifeBoat className="w-10 h-10 text-uscg-blue" />
              <span className="font-bold text-uscg-red hidden sm:inline">U.S. COAST GUARD</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
