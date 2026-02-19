"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: User | null;
    isLoggedIn: boolean;
    isReady: boolean;
  }>({
    user: null,
    isLoggedIn: false,
    isReady: false,
  });

  // Função para carregar usuário do localStorage
  const loadUserFromStorage = () => {
    if (typeof window === "undefined") return;

    try {
      const storedUser = localStorage.getItem("statsez_user");
      const storedToken = localStorage.getItem("statsez_token");
      
      console.log("[Auth] Verificando localStorage...", { 
        hasUser: !!storedUser, 
        hasToken: !!storedToken,
        userPreview: storedUser ? JSON.parse(storedUser).email : null
      });
      
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setAuthState({
          user: parsedUser,
          isLoggedIn: true,
          isReady: true,
        });
        console.log("[Auth] Sessão restaurada:", parsedUser.email);
      } else {
        setAuthState({ user: null, isLoggedIn: false, isReady: true });
        console.log("[Auth] Nenhuma sessão encontrada");
      }
    } catch (e) {
      console.error("[Auth] Erro ao ler localStorage:", e);
      setAuthState({ user: null, isLoggedIn: false, isReady: true });
    }
  };

  useEffect(() => {
    loadUserFromStorage();

    // Listener para mudanças no localStorage (outras abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "statsez_user" || e.key === "statsez_token") {
        console.log("[Auth] Storage change detectado, recarregando...");
        loadUserFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData: User, token: string) => {
    console.log("[Auth] Login:", userData.email);
    if (typeof window !== "undefined") {
      localStorage.setItem("statsez_user", JSON.stringify(userData));
      localStorage.setItem("statsez_token", token);
    }
    setAuthState({
      user: userData,
      isLoggedIn: true,
      isReady: true,
    });
  };

  const logout = () => {
    console.log("[Auth] Logout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("statsez_user");
      localStorage.removeItem("statsez_token");
    }
    setAuthState({
      user: null,
      isLoggedIn: false,
      isReady: true,
    });
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ 
      user: authState.user, 
      isLoggedIn: authState.isLoggedIn, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
