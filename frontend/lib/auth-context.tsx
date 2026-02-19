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

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedUser = localStorage.getItem("statsez_user");
      const storedToken = localStorage.getItem("statsez_token");
      
      console.log("[Auth] Restaurando sessão...", { hasUser: !!storedUser, hasToken: !!storedToken });
      
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        console.log("[Auth] Sessão restaurada:", parsedUser.email);
        setAuthState({
          user: parsedUser,
          isLoggedIn: true,
          isReady: true,
        });
      } else {
        setAuthState(prev => ({ ...prev, isReady: true }));
      }
    } catch (e) {
      console.error("[Auth] Erro:", e);
      setAuthState(prev => ({ ...prev, isReady: true }));
    }
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
