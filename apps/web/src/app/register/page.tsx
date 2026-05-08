"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { AuthUser } from "@/context/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRegister() {
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>(
        "/api/v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            phone,
            name,
            nickname: nickname.trim() || null,
          }),
        },
      );
      setSession(res.token, res.user);
      toast.success("Cuenta creada");
      router.push("/");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin() {
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ phone }),
        },
      );
      setSession(res.token, res.user);
      toast.success("Sesión iniciada");
      router.push("/");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Entrada</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Teléfono en formato internacional{" "}
          <span className="font-mono text-emerald-300">+52...</span>. El número y
          el nickname (si lo usas) son únicos en la app.
        </p>
      </div>

      <div className="flex rounded-xl border border-white/10 bg-black/30 p-1 text-xs font-semibold">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 transition ${
            mode === "register"
              ? "bg-emerald-500 text-zinc-950"
              : "text-zinc-400 hover:text-white"
          }`}
          onClick={() => setMode("register")}
        >
          Registro
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 transition ${
            mode === "login"
              ? "bg-emerald-500 text-zinc-950"
              : "text-zinc-400 hover:text-white"
          }`}
          onClick={() => setMode("login")}
        >
          Ya tengo cuenta
        </button>
      </div>

      <motion.div layout className="glass-panel space-y-5 p-6">
        <label className="block space-y-2 text-sm">
          <span className="text-zinc-400">Teléfono</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-emerald-400/40 focus:ring-2"
            placeholder="+528331234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value.trim())}
          />
        </label>

        {mode === "register" && (
          <>
            <label className="block space-y-2 text-sm">
              <span className="text-zinc-400">Nombre</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-emerald-400/40 focus:ring-2"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="text-zinc-400">Nickname (opcional, único)</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-emerald-400/40 focus:ring-2"
                placeholder="tu_apodo"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </label>
            <p className="text-[11px] text-zinc-500">
              Cualquiera que conozca tu número puede entrar como tú; úsalo sólo
              en entornos de confianza o añade controles extra después.
            </p>
          </>
        )}

        <Button
          type="button"
          disabled={
            loading ||
            phone.length < 10 ||
            (mode === "register" && name.trim().length < 2)
          }
          className="w-full"
          onClick={() =>
            void (mode === "register" ? submitRegister() : submitLogin())
          }
        >
          {loading
            ? "..."
            : mode === "register"
              ? "Crear cuenta"
              : "Entrar"}
        </Button>

        <p className="text-center text-[11px] text-zinc-500">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">
            Volver al inicio
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
