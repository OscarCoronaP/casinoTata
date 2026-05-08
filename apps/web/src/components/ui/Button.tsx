import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
}) {
  const variants = {
    primary:
      "bg-emerald-500/90 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_40px_-12px_rgba(16,185,129,0.65)]",
    ghost: "bg-transparent hover:bg-white/5 text-zinc-100",
    outline: "border border-white/15 hover:border-emerald-400/40 bg-transparent",
  } as const;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
