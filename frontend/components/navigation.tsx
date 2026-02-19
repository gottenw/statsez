"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "../lib/auth-context";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations("nav");
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
      setIsVisible(scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: t("capabilities"), href: "#capabilities" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("coverage"), href: "#coverage" },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : ""
          }`}
        >
          <div className="section-padding py-4 flex justify-between items-center">
            <a href="/" className="flex items-center">
              <img src="/logo.svg" alt="Statsez" className="h-5 invert" />
            </a>

            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-base uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/docs"
                className="text-base uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {t("docs")}
              </a>
            </div>

            <div className="flex items-center gap-6">
              <LanguageSwitcher />
              
              {isLoggedIn ? (
                <a
                  href="/dashboard"
                  className="text-base uppercase tracking-widest border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  [Dashboard]
                </a>
              ) : (
                <a
                  href="/auth/register"
                  className="text-base uppercase tracking-widest border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  {t("getStarted")}
                </a>
              )}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
