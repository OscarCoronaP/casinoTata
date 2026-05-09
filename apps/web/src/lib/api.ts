/** Base absoluta para fetch en servidor/build; si la env viene vacía, mejor localhost fallido que URL relativa. */
export function getApiBase(): string {
  const trimmed = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  const normalized = trimmed.replace(/\/$/, "");
  if (!normalized) return "http://127.0.0.1:4000";
  return normalized;
}

export function getApiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBase()}${p}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(getApiUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}
