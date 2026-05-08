"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

type Me = {
  id: string;
  phone: string;
  name: string;
  nickname: string | null;
  stats: {
    totalPoints: number;
    exactMatches: number;
    winnerHits: number;
    currentStreak: number;
    bestStreak: number;
  } | null;
  globalRank: number;
};

export default function ProfilePage() {
  const { authReady, token, user } = useAuth();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<Me>("/api/v1/users/me", { token });
        if (!cancelled) setMe(data);
      } catch {
        if (!cancelled) setMe(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!authReady) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="glass-panel mx-auto max-w-lg space-y-4 p-8 text-center">
        <p className="text-sm text-zinc-400">
          Inicia sesión para ver tu perfil y estadísticas.
        </p>
        <Link
          href="/register"
          className="inline-flex rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-zinc-950"
        >
          Ir a registro
        </Link>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const stats = me.stats;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
            Perfil
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {me.nickname || me.name}
          </h1>
          <p className="text-sm text-zinc-400">{me.phone}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-center">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
            Posición global
          </p>
          <p className="text-3xl font-semibold text-emerald-300">
            #{me.globalRank}
          </p>
        </div>
      </motion.div>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Puntos totales" value={stats?.totalPoints ?? 0} />
        <Stat label="Marcadores exactos" value={stats?.exactMatches ?? 0} />
        <Stat label="Aciertos de resultado" value={stats?.winnerHits ?? 0} />
        <Stat label="Racha actual" value={stats?.currentStreak ?? 0} />
        <Stat label="Mejor racha" value={stats?.bestStreak ?? 0} />
      </section>

      <section className="glass-panel p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">
            Historial de predicciones
          </h2>
          <Link href="/predictions" className="text-xs text-emerald-300">
            Ir a jornada →
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          Consulta tus marcadores en la vista de predicciones; aquí mostramos tu
          posición agregada para mantener el perfil liviano.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
