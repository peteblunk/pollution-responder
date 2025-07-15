"use client";
import { PlayerStatusCard } from "@/components/player-status-card";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Home, User, FileText, Edit3, Ship, LifeBuoy, LogOut, ShieldAlert } from "lucide-react";
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
  const router = useRouter();
  const { state: { character }, dispatch } = useGameState();

  const handleLogout = () => {
    // This is a simple "logout" that resets the state and sends the user
    // back to the landing page to start over.
    if (typeof window !== 'undefined') {
        localStorage.removeItem('dieselDilemmaGameState');
    }
    router.push('/');
    // A full reload might be needed to clear all state if context isn't enough
    window.location.reload();
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-2">
          <SidebarHeader className="p-0">
            <div className="flex items-center gap-2 p-2">
              <ShieldAlert className="w-8 h-8 text-primary" />
              <span className="font-headline text-lg font-semibold text-primary">
                Diesel Dilemma
              </span>
            </div>
          </SidebarHeader>
          <div className="p-2">
            <PlayerStatusCard />
          </div>
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
                <AvatarFallback>{character.name.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm truncate">
                <span className="font-semibold truncate">{character.name}</span>
                <span className="text-muted-foreground truncate">{character.rank}</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout} title="Logout and Reset">
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
              <h1 className="text-xl font-semibold font-headline truncate">
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
