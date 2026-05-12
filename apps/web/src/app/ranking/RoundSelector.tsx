"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type RoundOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export function RoundSelector({
  rounds,
  selectedId,
}: {
  rounds: RoundOption[];
  selectedId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  if (rounds.length === 0) return null;

  return (
    <select
      value={selectedId}
      disabled={pending}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("roundId", event.target.value);
        startTransition(() => {
          router.push(`/ranking?${params.toString()}`);
          router.refresh();
        });
      }}
      className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none disabled:opacity-60"
    >
      {rounds.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}
