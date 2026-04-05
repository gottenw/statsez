"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isReady: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  isReady: false,
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

  const loadUserFromStorage = () => {
    if (typeof window === "undefined") return;
    try {
      const storedUser = localStorage.getItem("statsez_user");
      if (storedUser) {
        setAuthState({ user: JSON.parse(storedUser), isLoggedIn: true, isReady: true });
      } else {
        setAuthState({ user: null, isLoggedIn: false, isReady: true });
      }
    } catch {
      setAuthState({ user: null, isLoggedIn: false, isReady: true });
    }
  };

  useEffect(() => {
    loadUserFromStorage();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "statsez_user") loadUserFromStorage();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("statsez_user", JSON.stringify(userData));
    }
    setAuthState({ user: userData, isLoggedIn: true, isReady: true });
  };

  const logout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.statsez.com";
      await fetch(`${apiUrl}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("statsez_user");
    }
    setAuthState({ user: null, isLoggedIn: false, isReady: true });
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      isLoggedIn: authState.isLoggedIn,
      isAdmin: authState.user?.role === 'ADMIN',
      isReady: authState.isReady,
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
