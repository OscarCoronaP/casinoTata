"use client";

import Image from "next/image";
import { cn, normalizeTeamLogoSrc } from "@/lib/utils";

export function TeamCrest({
  name,
  logoUrl,
  primaryColor = "#27272a",
  secondaryColor = "#18181b",
  size = "md",
  className,
}: {
  name: string;
  logoUrl: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dim =
    size === "xl"
      ? "h-20 w-20 md:h-24 md:w-24"
      : size === "lg"
        ? "h-16 w-16 md:h-[72px] md:w-[72px]"
        : size === "sm"
          ? "h-10 w-10"
          : "h-14 w-14";

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  /** Disco claro + inset para escudos negros (Potrace) y SVG con lienzo blanco (Illustrator). */
  if (logoUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ring-2 ring-zinc-300/70 dark:ring-white/20",
          dim,
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-[11%]">
          <div className="relative h-full w-full">
            <Image
              src={normalizeTeamLogoSrc(logoUrl)}
              alt={name}
              fill
              className="object-contain"
              sizes="96px"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold uppercase tracking-tight text-white shadow-lg ring-2 ring-white/10",
        dim,
        size === "xl" ? "text-lg md:text-xl" : size === "lg" ? "text-sm" : "text-[10px]",
        className,
      )}
      style={{
        background: `linear-gradient(145deg, ${primaryColor}, ${secondaryColor})`,
      }}
    >
      {initials}
    </div>
  );
}
