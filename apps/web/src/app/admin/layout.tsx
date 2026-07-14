"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

const nav = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/jornadas", label: "Jornadas" },
  { href: "/admin/partidos", label: "Partidos" },
  { href: "/admin/resultados", label: "Resultados" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authReady, token, user, refreshProfile } = useAuth();

  useEffect(() => {
    if (!authReady || !token) return;
    void refreshProfile();
  }, [authReady, token, refreshProfile]);

  useEffect(() => {
    if (!authReady) return;
    if (!token || user?.role !== "ADMIN") router.replace("/");
  }, [authReady, token, user, router]);

  if (!authReady || !token || user?.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-6">
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col gap-0 md:flex-row">
      <aside className="border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl md:w-56 md:border-b-0 md:border-r lg:w-64">
        <div className="p-5 md:sticky md:top-16">
          <p className="text-[10px] uppercase tracking-[0.35em] text-amber-400/90">
            Administración
          </p>
          <h2 className="mt-1 font-semibold text-white">Quiniela Liga MX</h2>
          <nav className="mt-6 flex flex-row gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition md:whitespace-normal",
                  pathname === item.href
                    ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/35"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
