"use client";

import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Navigation } from "../../../components/navigation";
import { useAuth } from "../../../lib/auth-context";

export default function RegisterPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [isChecking, setIsChecking] = useState(true);
  const { login, isLoggedIn } = useAuth();

  // Verifica se já está logado ao carregar a página
  useEffect(() => {
    // Pequeno delay para garantir que o AuthContext inicializou
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        console.log("[Register] Usuário já logado, redirecionando...");
        window.location.href = "/dashboard";
      } else {
        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setStatus("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.data, data.data.token);
        setStatus("success");
        
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setStatus("error");
    }
  };

  // Mostra loading enquanto verifica auth
  if (isChecking) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 animate-pulse" />
          <span className="font-mono text-xs uppercase text-muted-foreground">
            Verificando sessão...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <section className="min-h-screen w-full flex items-center justify-center p-4 grid-system">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-background border border-border p-12 shadow-2xl space-y-12"
        >
          <header className="text-center space-y-4">
            <span className="data-label text-foreground/50">IDENTITY_GATEWAY_v1</span>
            <h1 className="display-text text-4xl uppercase">Sign In</h1>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
              Access the production environment. No password required via Google identity provider.
            </p>
          </header>

          <div className="flex flex-col items-center gap-8">
            <div className="w-full flex justify-center border border-border py-8 bg-foreground/[0.02]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setStatus("error")}
                useOneTap={false}
                theme="outline"
                shape="square"
                size="large"
                width="280"
              />
            </div>

            {status === "loading" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 animate-pulse" />
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-blue-500">
                  Verifying_Credentials...
                </span>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-center gap-2 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest">
                  Authentication_Successful
                </span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 text-red-500">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest">
                  Authentication_Failed
                </span>
              </div>
            )}
          </div>

          <footer className="pt-8 border-t border-border">
            <p className="font-mono text-[9px] text-muted-foreground uppercase text-center leading-loose">
              By continuing, you agree to our Protocol Terms and Data Processing Agreements.
            </p>
          </footer>
        </motion.div>
      </section>
    </main>
  );
}
