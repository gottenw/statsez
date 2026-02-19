"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("User_Account_88294");
  const [email, setEmail] = useState("user@statsez.com");

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-16">
      <header className="border-b border-border pb-12">
        <span className="text-sm font-mono font-bold tracking-[0.2em] text-foreground/50 uppercase">PREFERENCES_&_CONTROL</span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">System_Settings</h1>
      </header>

      <div className="grid grid-cols-12 gap-16">
        {/* Profile Settings */}
        <div className="col-span-12 lg:col-span-7 space-y-12">
          <section className="space-y-8">
            <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest block">01_USER_PROFILE</span>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold text-foreground/60 uppercase tracking-widest">Public_Display_Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border border-border p-5 font-mono text-sm focus:border-foreground outline-none transition-all uppercase font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold text-foreground/60 uppercase tracking-widest">Email_Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border border-border p-5 font-mono text-sm focus:border-foreground outline-none transition-all font-bold"
                />
              </div>
            </div>

            <button className="font-mono text-[10px] font-bold bg-foreground text-background px-10 py-5 uppercase tracking-[0.2em] hover:bg-foreground/90 transition-all">
              SAVE_CHANGES
            </button>
          </section>

          <section className="space-y-8 pt-8 border-t border-border">
            <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest block">02_SECURITY</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button className="border border-border p-6 text-left hover:bg-foreground/[0.02] transition-all group">
                <p className="font-mono text-[10px] font-bold text-foreground mb-2 tracking-widest uppercase">Password_Update</p>
                <p className="text-xs text-muted-foreground uppercase leading-relaxed">Change your current access credentials.</p>
              </button>
              <button className="border border-border p-6 text-left hover:bg-foreground/[0.02] transition-all group">
                <p className="font-mono text-[10px] font-bold text-foreground mb-2 tracking-widest uppercase">Two_Factor_Auth</p>
                <p className="text-xs text-muted-foreground uppercase leading-relaxed text-blue-600">Currently Disabled [Enable]</p>
              </button>
            </div>
          </section>
        </div>

        {/* Account Info Sidebar */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="p-10 border border-border bg-foreground/[0.01] space-y-10">
            <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest block">ACCOUNT_METADATA</span>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Customer_ID</p>
                <p className="font-mono text-sm font-bold text-foreground uppercase mt-1">UID_88294_PRD</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Creation_Date</p>
                <p className="font-mono text-sm font-bold text-foreground uppercase mt-1">Feb 18, 2026</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Region</p>
                <p className="font-mono text-sm font-bold text-foreground uppercase mt-1">Brazil [SA-EAST-1]</p>
              </div>
            </div>
          </div>

          <div className="p-10 border border-red-500/30 bg-red-500/[0.02] space-y-6">
            <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-widest block">DANGER_ZONE</span>
            <p className="text-xs text-muted-foreground uppercase leading-loose font-bold">
              Permanently delete your account and all associated data. This action is irreversible.
            </p>
            <button className="font-mono text-[10px] font-bold border border-red-500 text-red-600 px-8 py-4 uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
              DELETE_ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
