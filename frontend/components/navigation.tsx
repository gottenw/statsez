"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "../lib/auth-context";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("nav");
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: t("capabilities"), href: "#capabilities" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("coverage"), href: "#coverage" },
    { label: t("docs"), href: "/docs" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border"
      >
        <div className="section-padding py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo.svg" alt="Statsez" className="h-5 invert" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="font-mono text-xs uppercase tracking-widest bg-foreground text-background px-6 py-3 hover:bg-data-primary transition-all duration-300"
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/auth/register"
                className="font-mono text-xs uppercase tracking-widest bg-foreground text-background px-6 py-3 hover:bg-data-primary transition-all duration-300"
              >
                {t("getStarted")}
              </a>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-background pt-20"
          >
            <div className="section-padding flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground py-4 border-b border-border transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4">
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
