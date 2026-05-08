"use client";

import { motion } from "framer-motion";

export function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="glass-panel p-5"
    >
      <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-[11px] leading-snug text-zinc-500">{hint}</p>
    </motion.div>
  );
}
