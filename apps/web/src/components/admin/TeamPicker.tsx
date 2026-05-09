"use client";

import { useMemo, useState } from "react";
import type { Team } from "@/types/team";
import { TeamCrest } from "@/components/team/TeamCrest";
import { cn } from "@/lib/utils";

export function TeamPicker({
  label,
  teams,
  value,
  onChange,
  excludeId,
}: {
  label: string;
  teams: Team[];
  value: string | null;
  onChange: (id: string) => void;
  excludeId?: string | null;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return teams.filter((t) => {
      if (excludeId && t.id === excludeId) return false;
      if (!s) return true;
      return (
        t.name.toLowerCase().includes(s) ||
        t.shortName.toLowerCase().includes(s) ||
        t.slug.includes(s)
      );
    });
  }, [teams, q, excludeId]);

  const selected = teams.find((t) => t.id === value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </label>
        {selected && (
          <span className="truncate text-xs text-emerald-300">{selected.name}</span>
        )}
      </div>
      <input
        type="search"
        placeholder="Buscar equipo…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/40"
      />
      <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-2 sm:grid-cols-3">
        {filtered.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition",
                active
                  ? "border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_24px_-12px_rgba(52,211,153,0.8)]"
                  : "border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]",
              )}
            >
              <TeamCrest
                name={t.name}
                logoUrl={t.logoUrl}
                primaryColor={t.primaryColor}
                secondaryColor={t.secondaryColor}
                size="sm"
              />
              <span className="line-clamp-2 text-[11px] font-medium text-zinc-200">
                {t.shortName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
