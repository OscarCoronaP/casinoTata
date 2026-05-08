import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";

function userPayload(user: {
  id: string;
  phone: string;
  name: string;
  nickname: string | null;
  role: string;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    nickname: user.nickname,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

/** Si el teléfono coincide con ADMIN_BOOTSTRAP_PHONE, sube a ADMIN (cuentas ya creadas antes de configurar el .env). */
export async function promoteBootstrapAdminIfNeeded(
  userId: string,
): Promise<void> {
  const bootstrap = env.ADMIN_BOOTSTRAP_PHONE;
  if (!bootstrap) return;

  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true, role: true },
  });
  if (!u || u.role === "ADMIN" || u.phone !== bootstrap) return;

  await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  });
}

export function issueJwt(user: {
  id: string;
  phone: string;
  role: UserRole;
}) {
  return jwt.sign(
    { sub: user.id, phone: user.phone, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "30d" },
  );
}

export async function registerUser(params: {
  phone: string;
  name: string;
  nickname?: string | null;
}): Promise<{ token: string; user: ReturnType<typeof userPayload> }> {
  const name = params.name.trim();
  if (name.length < 2) {
    throw new HttpError(400, "Nombre inválido");
  }

  let nickname: string | null =
    params.nickname?.trim() || null;
  if (nickname !== null && nickname.length < 2) {
    nickname = null;
  }

  const existingPhone = await prisma.user.findUnique({
    where: { phone: params.phone },
  });
  if (existingPhone) {
    throw new HttpError(409, "Ya existe una cuenta con ese teléfono");
  }

  if (nickname) {
    const nickTaken = await prisma.user.findUnique({
      where: { nickname },
    });
    if (nickTaken) {
      throw new HttpError(409, "Ese nickname ya está en uso");
    }
  }

  const bootstrap = env.ADMIN_BOOTSTRAP_PHONE;
  const role: UserRole =
    bootstrap && params.phone === bootstrap ? "ADMIN" : "USER";

  try {
    const user = await prisma.user.create({
      data: {
        phone: params.phone,
        name,
        nickname,
        role,
        stats: { create: {} },
      },
    });

    const token = issueJwt(user);
    return { token, user: userPayload(user) };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const target = e.meta?.target;
      const fields = Array.isArray(target)
        ? target
        : typeof target === "string"
          ? [target]
          : [];
      if (fields.includes("nickname")) {
        throw new HttpError(409, "Ese nickname ya está en uso");
      }
      throw new HttpError(409, "Teléfono o nickname duplicado");
    }
    throw e;
  }
}

export async function loginUser(params: {
  phone: string;
}): Promise<{ token: string; user: ReturnType<typeof userPayload> }> {
  const user = await prisma.user.findUnique({
    where: { phone: params.phone },
  });
  if (!user) {
    throw new HttpError(404, "No hay cuenta con ese teléfono; regístrate primero");
  }

  await promoteBootstrapAdminIfNeeded(user.id);
  const updated = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
  });

  const token = issueJwt(updated);
  return { token, user: userPayload(updated) };
}
