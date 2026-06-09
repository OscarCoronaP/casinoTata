"use client";

import { motion } from "framer-motion";

export function StatCardMundial({
  title,
  value,
  hint,
  accent = "gold",
}: {
  title: string;
  value: string;
  hint: string;
  accent?: "gold" | "sky" | "red";
}) {
  const accentColor =
    accent === "gold" ? "var(--wc-gold)"
    : accent === "sky" ? "var(--wc-sky)"
    : "var(--wc-crimson)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl p-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>
        {title}
      </p>
      <p
        className="mt-3 leading-none"
        style={{
          fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
          fontSize: "2.25rem",
          letterSpacing: "0.04em",
          color: accentColor,
        }}
      >
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-snug" style={{ color: "var(--muted-2)" }}>
        {hint}
      </p>
    </motion.div>
  );
}
