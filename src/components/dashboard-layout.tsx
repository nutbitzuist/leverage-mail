"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Layout, 
  Mail, 
  Zap, 
  Settings,
  LogOut,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function SidebarItem({ href, icon, label }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        isActive 
          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" 
          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[hsl(var(--border))] flex flex-col glass">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
              <Zap className="text-[hsl(var(--primary-foreground))] w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">LeverageMail</span>
          </div>

          <nav className="space-y-1">
            <SidebarItem href="/dashboard" icon={<BarChart3 />} label="Dashboard" />
            <SidebarItem href="/dashboard/leads" icon={<Users />} label="Audience" />
            <SidebarItem href="/dashboard/forms" icon={<Layout />} label="Landing Pages" />
            <SidebarItem href="/dashboard/broadcasts" icon={<Mail />} label="Broadcasts" />
            <SidebarItem href="/dashboard/automations" icon={<Zap />} label="Automations" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-[hsl(var(--border))] space-y-4">
          <SidebarItem href="/dashboard/settings" icon={<Settings />} label="Settings" />
          <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto text-[hsl(var(--muted-foreground))]">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-[hsl(var(--border))] flex items-center justify-between px-8 glass sticky top-0 z-10">
          <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Welcome back, Admin</h2>
          <div className="flex items-center gap-4">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </Button>
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
