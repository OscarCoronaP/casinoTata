"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";

export function AnimatedHeroMundial() {
  const { authReady, user } = useAuth();

  return (
    <section
      className="relative overflow-hidden rounded-3xl px-6 py-10 md:px-10 md:py-14"
      style={{
        background: "linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 60%, #0a1e38 100%)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Blob crimson top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-6 hidden h-56 w-56 rounded-full md:block"
        style={{ background: "radial-gradient(circle, rgba(200,16,46,0.22) 0%, transparent 70%)" }}
      />
      {/* Blob sky bottom-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-10 hidden h-48 w-48 rounded-full md:block"
        style={{ background: "radial-gradient(circle, rgba(79,163,224,0.14) 0%, transparent 70%)" }}
      />
      {/* Banda tricolor inferior */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, #C8102E 33%, #F5A623 33%, #F5A623 66%, #4FA3E0 66%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 max-w-xl space-y-5"
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.35em]"
          style={{ color: "var(--wc-sky)" }}
        >
          Mundial 2026 · USA · México · Canadá
        </p>

        <h1
          className="text-balance leading-none"
          style={{
            fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            letterSpacing: "0.04em",
            color: "#EDF4FF",
          }}
        >
          Tu quiniela del{" "}
          <span style={{ color: "var(--wc-crimson)" }}>Mundial:</span>{" "}
          puntos reales,{" "}
          <span style={{ color: "var(--wc-gold)" }}>pegale a tu predicción</span>.
        </h1>

        <p className="text-sm leading-relaxed md:text-base" style={{ color: "var(--muted)" }}>
          Regístrate con tu número único, pronostica cada jornada y escala el
          ranking. Partidos oficiales del Mundial 2026 gestionados en tiempo real.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          {authReady && !user && (
            <Link
              href="/register"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, var(--wc-crimson), #a00d24)",
                boxShadow: "0 8px 32px -8px rgba(200,16,46,0.5)",
              }}
            >
              Crear cuenta
            </Link>
          )}
          <Link
            href="/predictions"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:text-white"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            Ver jornada
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
