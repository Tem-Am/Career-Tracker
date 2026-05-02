// ─── Error types ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super("Network request failed");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

export interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
}

export async function apiFetch<T>(
  path: string,
  opts: FetchOptions = {},
): Promise<T> {
  const { body, token, ...rest } = opts;

  const headers = new Headers(rest.headers);

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path), {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new NetworkError(err);
  }

  const data = await parseResponse(res);

  if (!res.ok) {
    const message = extractErrorMessage(data) ?? `${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

type WithToken = { token?: string };

export const api = {
  get: <T>(path: string, opts?: WithToken) =>
    apiFetch<T>(path, { method: "GET", ...opts }),

  post: <T>(path: string, body: unknown, opts?: WithToken) =>
    apiFetch<T>(path, { method: "POST", body, ...opts }),

  patch: <T>(path: string, body: unknown, opts?: WithToken) =>
    apiFetch<T>(path, { method: "PATCH", body, ...opts }),

  delete: <T = void>(path: string, opts?: WithToken) =>
    apiFetch<T>(path, { method: "DELETE", ...opts }),
};

// ─── Client / server split ────────────────────────────────────────────────────

/** Use in client components — reads token from localStorage automatically. */
export const clientApi = {
  get: <T>(path: string) => api.get<T>(path, { token: readToken() }),
  post: <T>(path: string, body: unknown) => api.post<T>(path, body, { token: readToken() }),
  patch: <T>(path: string, body: unknown) => api.patch<T>(path, body, { token: readToken() }),
  delete: <T = void>(path: string) => api.delete<T>(path, { token: readToken() }),
};

/** Use in server components / Route Handlers — token passed explicitly. */
export const serverApi = {
  get: <T>(path: string, token: string) => api.get<T>(path, { token }),
  post: <T>(path: string, body: unknown, token: string) => api.post<T>(path, body, { token }),
  patch: <T>(path: string, body: unknown, token: string) => api.patch<T>(path, body, { token }),
  delete: <T = void>(path: string, token: string) => api.delete<T>(path, { token }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(data: unknown): string | undefined {
  if (data && typeof data === "object" && "error" in data) {
    const val = (data as Record<string, unknown>).error;
    if (typeof val === "string") return val;
  }
}

function readToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("jt-token") ?? undefined;
}