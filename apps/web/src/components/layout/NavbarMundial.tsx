"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",            label: "Inicio" },
  { href: "/predictions", label: "Predicciones" },
  //{ href: "/live",        label: "En Vivo" },
  { href: "/ranking",     label: "Ranking" },
  //{ href: "/standings",   label: "Equipos" },
];

export function NavbarMundial() {
  const pathname = usePathname();
  //const { token, user, clearSession } = useAuth();
  const { authReady, user, logout } = useAuth();
  return (
    <header
      className="wc-navbar-band relative z-40 border-b"
      style={{
        background: "rgba(0, 13, 36, 0.85)",
        borderColor: "rgba(79, 163, 224, 0.18)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-6">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link href="/" className="group flex items-center gap-2.5 select-none">
          {/* Escudo pequeño con los tres colores */}
          <span
            aria-hidden="true"
            className="flex h-8 w-6 flex-col overflow-hidden rounded-[3px] shadow-md"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <span className="flex-1" style={{ background: "var(--wc-crimson)" }} />
            <span className="flex-1" style={{ background: "var(--wc-gold)" }} />
            <span className="flex-1" style={{ background: "var(--wc-sky)" }} />
          </span>

          <span className="flex flex-col leading-none">
            <span
              className="font-display text-xl tracking-widest text-white"
              style={{ fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif" }}
            >
              TATANIELA
            </span>
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--wc-sky)" }}
            >
              Mundial 2026
            </span>
          </span>
        </Link>

        {/* ── Nav principal ─────────────────────────────────────────────────── */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "text-white"
                    : "text-[var(--muted)] hover:text-white",
                )}
              >
                {active && (
                  <span
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "rgba(79, 163, 224, 0.1)",
                      border: "1px solid rgba(79, 163, 224, 0.2)",
                    }}
                  />
                )}
                <span className="relative">{label}</span>
                {/* Subrayado activo crimson */}
                {active && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ background: "var(--wc-crimson)" }}
                  />
                )}
              </Link>
            );
          })}

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={cn(
                "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                pathname.startsWith("/admin")
                  ? "text-white"
                  : "text-[var(--muted)] hover:text-white",
              )}
            >
              {pathname.startsWith("/admin") && (
                <span
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "rgba(245, 166, 35, 0.1)",
                    border: "1px solid rgba(245, 166, 35, 0.25)",
                  }}
                />
              )}
              <span className="relative" style={{ color: "var(--wc-gold)" }}>
                Admin
              </span>
            </Link>
          )}
        </nav>

        {/* ── Auth ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {authReady && user ? (
            <>
              <Link
                href="/profile"
                className="hidden text-sm font-medium transition-colors hover:text-white md:block"
                style={{ color: "var(--muted)" }}
              >
                {user.nickname ?? user.name}
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/register"
              className="btn-wc-primary rounded-xl px-4 py-1.5 text-xs font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, var(--wc-crimson), #a00d24)",
                boxShadow: "0 2px 12px rgba(200,16,46,0.35)",
              }}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* ── Móvil: nav horizontal scrollable ────────────────────────────────── */}
      <div
        className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden"
        style={{ borderTop: "1px solid rgba(79,163,224,0.08)" }}
      >
        {[...NAV_LINKS, ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : [])].map(
          ({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "text-white"
                    : "text-[var(--muted)]",
                )}
                style={
                  active
                    ? {
                        background: "rgba(79,163,224,0.1)",
                        borderBottom: "2px solid var(--wc-crimson)",
                      }
                    : {}
                }
              >
                {label}
              </Link>
            );
          },
        )}
      </div>
    </header>
  );
}
