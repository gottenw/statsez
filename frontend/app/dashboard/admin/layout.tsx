"use client";

import { useAuth } from "../../../lib/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      router.replace("/dashboard");
    } else if (!isLoggedIn) {
      router.replace("/auth/register");
    }
  }, [isLoggedIn, isAdmin, router]);

  if (!isAdmin) {
    return (
      <div className="section-padding py-24 flex items-center justify-center">
        <div className="font-mono text-sm text-muted-foreground animate-pulse">
          VERIFYING_ACCESS_LEVEL...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
