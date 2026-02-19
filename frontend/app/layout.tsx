import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../lib/auth-context";
import { UserAvatar } from "../components/user-avatar";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Statsez API — Dados de Futebol",
    description: "Dados históricos de futebol de 500+ ligas mundiais. Resultados, estatísticas e classificações de partidas finalizadas.",
    icons: {
      icon: "/favicon.jpg",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="pt" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <NextIntlClientProvider messages={messages}>
              {/* Avatar do usuário flutuante - só aparece quando logado */}
              <UserAvatar />
              {children}
            </NextIntlClientProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
