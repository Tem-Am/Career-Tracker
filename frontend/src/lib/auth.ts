const TOKEN_KEY = "jt-token";
const USER_KEY = "jt-user";

export type AuthedUser = { id: string; email: string };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthedUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthedUser;
  } catch {
    return null;
  }
}

export function setAuth(input: { token: string; user: AuthedUser }) {
  window.localStorage.setItem(TOKEN_KEY, input.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(input.user));
}

export function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
