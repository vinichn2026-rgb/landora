"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserRole } from "@/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  city?: string | null;
  profile?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  savedIds: string[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    phoneNumber?: string;
    role: UserRole;
    password: string;
    city?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleSaveProperty: (propertyId: string) => Promise<{ isSaved: boolean; count: number }>;
  isSaved: (propertyId: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Load initial session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          localStorage.setItem("landora_user", JSON.stringify(data.user));

          // Load saved properties
          const savedRes = await fetch("/api/user/saved-properties");
          const savedData = await savedRes.json();
          if (savedData.success && savedData.savedIds) {
            setSavedIds(savedData.savedIds);
          }
        } else {
          // Check local storage fallback for demo
          const stored = localStorage.getItem("landora_user");
          if (stored) {
            try {
              setUser(JSON.parse(stored));
            } catch {
              localStorage.removeItem("landora_user");
            }
          }
        }
      } catch (err) {
        console.warn("[AUTH WARNING] Could not fetch server session:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("landora_user", JSON.stringify(data.user));

        // Fetch saved IDs for this user
        const savedRes = await fetch("/api/user/saved-properties");
        const savedData = await savedRes.json();
        if (savedData.success && savedData.savedIds) {
          setSavedIds(savedData.savedIds);
        }

        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch {
      return { success: false, error: "Network error during login. Please try again." };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phoneNumber?: string;
    role: UserRole;
    password: string;
    city?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();

      if (resData.success && resData.user) {
        setUser(resData.user);
        localStorage.setItem("landora_user", JSON.stringify(resData.user));
        return { success: true };
      } else {
        return { success: false, error: resData.error || "Registration failed" };
      }
    } catch {
      return { success: false, error: "Network error during registration." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    } finally {
      setUser(null);
      setSavedIds([]);
      localStorage.removeItem("landora_user");
      window.location.href = "/login";
    }
  };

  const toggleSaveProperty = async (propertyId: string) => {
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return { isSaved: false, count: savedIds.length };
    }

    try {
      const res = await fetch("/api/user/saved-properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.isSaved) {
          setSavedIds(prev => [...prev, propertyId]);
        } else {
          setSavedIds(prev => prev.filter(id => id !== propertyId));
        }
        return { isSaved: data.isSaved, count: data.count };
      }
    } catch {
      // Fallback optimistic update
    }

    const isCurrentlySaved = savedIds.includes(propertyId);
    const updated = isCurrentlySaved ? savedIds.filter(id => id !== propertyId) : [...savedIds, propertyId];
    setSavedIds(updated);
    return { isSaved: !isCurrentlySaved, count: updated.length };
  };

  const isSaved = (propertyId: string) => savedIds.includes(propertyId);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        localStorage.setItem("landora_user", JSON.stringify(data.user));
      }
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        savedIds,
        login,
        register,
        logout,
        toggleSaveProperty,
        isSaved,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
