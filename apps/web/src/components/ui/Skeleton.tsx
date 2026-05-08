import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-zinc-800/80 via-zinc-700/60 to-zinc-800/80 bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}
