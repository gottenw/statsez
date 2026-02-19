"use client";

import { usePathname } from "next/navigation";

const menuItems = [
  { id: "overview", label: "01 OVERVIEW", href: "/dashboard" },
  { id: "keys", label: "02 API KEYS", href: "/dashboard/keys" },
  { id: "explorer", label: "03 EXPLORER", href: "/dashboard/explorer" },
  { id: "billing", label: "04 BILLING", href: "/dashboard/billing" },
  { id: "settings", label: "05 SETTINGS", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-foreground selection:bg-foreground selection:text-background">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-border flex flex-col bg-background z-20">
        <div className="p-10 border-b border-border">
          <a href="/" className="font-sans text-2xl font-medium tracking-tight uppercase">
            Statsez <span className="text-muted opacity-30">API</span>
          </a>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`block p-4 transition-all duration-300 ${
                  isActive 
                    ? "bg-foreground text-background font-bold" 
                    : "hover:bg-foreground/[0.04] text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="font-mono text-xs uppercase tracking-[0.2em]">
                  {item.label}
                </span>
              </a>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border">
          <button className="w-full text-left p-4 text-muted-foreground hover:text-red-500 transition-colors font-mono text-xs uppercase tracking-[0.2em] font-bold">
            [ TERMINATE_SESSION ]
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-border flex items-center justify-between px-10 bg-background">
          <div className="flex items-center gap-6">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-foreground/30">NODE_STATUS</span>
            <div className="flex items-center gap-3 bg-blue-500/5 px-3 py-1.5 border border-blue-500/20">
              <div className="w-2 h-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="font-mono text-[10px] uppercase tracking-widest font-extrabold text-blue-600">Secure_Connection_Live</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="font-mono text-[11px] uppercase font-extrabold text-foreground tracking-wider">UID_88294_PRD</p>
              <p className="font-mono text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Tier: Professional_License</p>
            </div>
            <div className="w-10 h-10 border border-border bg-foreground/[0.03]" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
