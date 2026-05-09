import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** BD/API pueden seguir devolviendo `.svg` tras pasar escudos a PNG. */
export function normalizeTeamLogoSrc(url: string): string {
  return url.replace(/\.svg$/i, ".png");
}
