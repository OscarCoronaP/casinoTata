"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/auth-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "!bg-zinc-900 !text-zinc-100 !border !border-white/10 !shadow-xl",
          duration: 3800,
        }}
      />
    </AuthProvider>
  );
}
