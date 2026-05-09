"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/predictions", label: "Predicciones" },
  // En vivo / Equipos ocultos por ahora (rutas /live y /standings siguen existiendo).
  { href: "/ranking", label: "Ranking" },
  { href: "/profile", label: "Perfil" },
];

export function Navbar() {
  const { authReady, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <motion.span
            layoutId="brand-dot"
            className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]"
          />
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-400/90">
              Liga MX
            </p>
            <p className="text-sm font-semibold text-white">Quiniela Cherios</p>
          </div>
        </Link>

        <nav className="hidden flex-1 flex-wrap items-center justify-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white",
              )}
            >
              {l.label}
            </Link>
          ))}
          {authReady && user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-1.5 text-sm text-amber-300/90 transition hover:bg-amber-500/10"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {authReady && !user && (
            <Link href="/register">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 md:text-sm"
              >
                Entrar
              </motion.span>
            </Link>
          )}
          {authReady && user && (
            <>
              <span className="hidden max-w-[140px] truncate text-xs text-zinc-400 md:inline">
                {user.nickname || user.name}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
              >
                Salir
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-full bg-white/5 px-3 py-1 text-[11px] text-zinc-200"
          >
            {l.label}
          </Link>
        ))}
        {authReady && user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="whitespace-nowrap rounded-full bg-amber-500/15 px-3 py-1 text-[11px] text-amber-200"
          >
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
