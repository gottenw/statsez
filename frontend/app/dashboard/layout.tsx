"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Key, 
  Terminal, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { usePathname } from "next/navigation";

const menuItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "keys", label: "API Keys", icon: Key, href: "/dashboard/keys" },
  { id: "explorer", label: "API Explorer", icon: Terminal, href: "/dashboard/explorer" },
  { id: "billing", label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
  { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border flex flex-col bg-background z-20">
        <div className="p-8 border-b border-border flex items-center justify-between">
          <a href="/" className="font-sans text-xl font-medium tracking-tight">SE <span className="text-muted">API</span></a>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center justify-between p-3 transition-all duration-300 group ${
                  isActive 
                    ? "bg-foreground text-background" 
                    : "hover:bg-foreground/[0.03] text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
                    {item.label}
                  </span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center gap-3 p-3 text-muted-foreground hover:text-red-500 transition-colors font-mono text-[10px] uppercase tracking-widest font-bold">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="data-label opacity-50">STATUS</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Live Production</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase font-bold leading-none">User_Account</p>
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Pro_License</p>
            </div>
            <div className="w-8 h-8 border border-border bg-foreground/[0.05]" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
