"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ScorePickerMundial({
  matchId,
  disabled,
}: {
  matchId: string;
  disabled?: boolean;
}) {
  const { token, authReady } = useAuth();
  const needsLogin = authReady && !token;
  const effectiveDisabled = disabled || !authReady || needsLogin;

  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [saving, setSaving] = useState(false);

  const summary = useMemo(() => {
    if (home === away) return "Empate";
    return home > away ? `Local ${home}-${away}` : `Visitante ${home}-${away}`;
  }, [home, away]);

  async function save() {
    if (!token || !authReady) {
      toast.error("Inicia sesión para guardar tu predicción");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/v1/predictions", {
        method: "POST",
        token,
        body: JSON.stringify({ matchId, predHome: home, predAway: away }),
      });
      toast.success("Predicción guardada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl transition-colors", effectiveDisabled && "opacity-75")}>
      <div className="flex items-center justify-center gap-4">
        <CounterMundial label="Local"   value={home} onChange={setHome} disabled={effectiveDisabled} />
        <span className="text-xl font-semibold" style={{ color: "var(--muted-2)" }}>:</span>
        <CounterMundial label="Visita"  value={away} onChange={setAway} disabled={effectiveDisabled} />
      </div>

      <p className="text-center text-[11px]" style={{ color: "var(--muted)" }}>{summary}</p>

      {needsLogin && !disabled && (
        <p className="text-center text-[10px]" style={{ color: "var(--wc-gold)" }}>
          Debes iniciar sesión para guardar tu pronóstico.
        </p>
      )}
      {disabled && (
        <p className="text-center text-[10px]" style={{ color: "var(--muted-2)" }}>
          Cierre 2 min antes del partido o partido ya en curso / finalizado.
        </p>
      )}

      <motion.div layout className="flex justify-center">
        <Button
          type="button"
          disabled={effectiveDisabled || saving}
          variant={effectiveDisabled ? "outline" : "primary"}
          onClick={() => void save()}
          className={cn(
            "w-full max-w-xs text-xs md:text-sm",
            effectiveDisabled
              ? "!cursor-not-allowed !border-[rgba(79,163,224,0.15)] !bg-[var(--surface-2)] !text-[var(--muted-2)] !opacity-100 shadow-none"
              : "!border-[var(--wc-crimson)] !bg-[var(--wc-crimson)] !text-white hover:!brightness-110",
          )}
        >
          {!authReady
            ? "…"
            : needsLogin
              ? "Inicia sesión"
              : disabled
                ? "No disponible"
                : saving
                  ? "Guardando..."
                  : "Guardar predicción"}
        </Button>
      </motion.div>
    </div>
  );
}

function CounterMundial({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--muted-2)" }}>
        {label}
      </span>
      <div
        className="flex items-center gap-2 rounded-2xl p-2"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        <button
          type="button"
          disabled={disabled}
          className="h-8 w-8 rounded-lg text-lg leading-none transition-colors disabled:opacity-30"
          style={{
            background: "rgba(79,163,224,0.08)",
            color: "var(--wc-sky)",
          }}
          onMouseEnter={(e) => !disabled && ((e.currentTarget as HTMLButtonElement).style.background = "rgba(79,163,224,0.18)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(79,163,224,0.08)")}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <span
          className="w-8 text-center text-xl font-semibold"
          style={{ color: "#EDF4FF" }}
        >
          {value}
        </span>
        <button
          type="button"
          disabled={disabled}
          className="h-8 w-8 rounded-lg text-lg leading-none transition-colors disabled:opacity-30"
          style={{
            background: "rgba(79,163,224,0.08)",
            color: "var(--wc-sky)",
          }}
          onMouseEnter={(e) => !disabled && ((e.currentTarget as HTMLButtonElement).style.background = "rgba(79,163,224,0.18)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(79,163,224,0.08)")}
          onClick={() => onChange(Math.min(12, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
