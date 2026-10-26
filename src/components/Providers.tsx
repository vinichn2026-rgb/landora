"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AuthModal from "@/components/auth/AuthModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}
        <AuthModal />
      </AuthProvider>
    </LanguageProvider>
  );
}
