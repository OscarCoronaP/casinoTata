"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function AdminUsuariosPage() {
  const { token } = useAuth();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ user: { id: string; phone: string; name: string } }>(
        "/api/v1/admin/users",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            phone: phone.trim(),
            name: name.trim(),
            nickname: nickname.trim() || null,
            role,
          }),
        },
      );
      toast.success(`Usuario creado: ${res.user.name} (${res.user.phone})`);
      setPhone("");
      setName("");
      setNickname("");
      setRole("USER");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Usuarios</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Alta manual. La contraseña inicial se toma de{" "}
          <code className="rounded bg-black/50 px-1 text-emerald-300/90">
            DEFAULT_USER_PASSWORD
          </code>{" "}
          en el servidor (archivo <code className="text-zinc-500">.env</code> de la API). El
          usuario debe iniciar sesión con esa clave (o cambiarla si más adelante agregas ese
          flujo).
        </p>
      </div>

      <div className="glass-panel space-y-5 p-6">
        <label className="block space-y-2 text-sm">
          <span className="text-zinc-400">Teléfono (E.164)</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-emerald-400/40 focus:ring-2"
            placeholder="+528331234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value.trim())}
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-zinc-400">Nombre</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-emerald-400/40 focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-zinc-400">Nickname (opcional)</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-emerald-400/40 focus:ring-2"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-zinc-400">Rol</span>
          <select
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-emerald-400/40 focus:ring-2"
            value={role}
            onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
          >
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </label>

        <Button
          type="button"
          className="w-full"
          disabled={loading || phone.length < 10 || name.trim().length < 2}
          onClick={() => void submit()}
        >
          {loading ? "…" : "Crear usuario"}
        </Button>
      </div>
    </div>
  );
}
