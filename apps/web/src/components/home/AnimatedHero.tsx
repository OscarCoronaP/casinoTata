"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";

export function AnimatedHero() {
  const { authReady, user } = useAuth();

  return (
    <section className="glass-panel relative overflow-hidden px-6 py-10 md:px-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 max-w-xl space-y-5"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/90">
          Liga MX · sólo predicciones
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
          Tu quiniela cherios: puntos reales,{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            pegale a tu predicción para ganar
          </span>
          .
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400 md:text-base">
          Regístrate con tu número único, pronostica cada jornada y escala el ranking.
          Momios ficticios, estadísticas en vivo y tabla oficial sincronizada.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          {authReady && !user && (
            <Link
              href="/register"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_18px_60px_-24px_rgba(52,211,153,0.9)] transition hover:bg-emerald-400"
            >
              Crear cuenta
            </Link>
          )}
          <Link
            href="/predictions"
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-white/5"
          >
            Ver jornada
          </Link>
        </div>
      </motion.div>
      <div className="pointer-events-none absolute -right-10 top-6 hidden h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl md:block" />
    </section>
  );
}
