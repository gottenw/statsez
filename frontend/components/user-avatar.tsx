"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/auth-context";

export function UserAvatar() {
  const { user, isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!isLoggedIn || !user) return null;

  const initials = user.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  const firstName = user.name 
    ? user.name.split(" ")[0] 
    : user.email.split("@")[0];

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-background border border-border px-3 py-2 
                     hover:border-foreground transition-all shadow-lg"
        >
          <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center 
                          text-base font-bold uppercase tracking-wider">
            {initials}
          </div>
          <span className="hidden sm:block text-base uppercase text-foreground">
            {firstName}
          </span>
          <span className={`text-base transition-transform ${isOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full right-0 mt-2 w-56 bg-background border border-border shadow-xl"
            >
              <div className="p-3 border-b border-border bg-foreground/[0.02]">
                <p className="text-base uppercase text-muted-foreground">Conectado como</p>
                <p className="text-base truncate">{user.email}</p>
              </div>

              <div className="p-1">
                <a
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base hover:bg-foreground/5"
                >
                  [Painel]
                </a>
                <button
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-base text-red-500 hover:bg-red-500/10"
                >
                  [Desconectar]
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isOpen && (
          <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
        )}
      </motion.div>
    </div>
  );
}
