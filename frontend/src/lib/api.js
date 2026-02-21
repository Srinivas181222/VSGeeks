const rawBase = import.meta.env.VITE_API_URL;
export const API_BASE = rawBase && rawBase.length ? rawBase : "";
export const SESSION_EXPIRED_MESSAGE = "Session expired. Please log in again.";

const sanitizeToken = (rawToken) => {
  let value = typeof rawToken === "string" ? rawToken.trim() : "";
  if (!value || value === "null" || value === "undefined") return "";

  // Support legacy storage values like `"token"` or `'token'`.
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  // Support legacy storage values like `Bearer <token>`.
  if (/^Bearer\s+/i.test(value)) {
    value = value.replace(/^Bearer\s+/i, "").trim();
  }

  // JWT shape guard: header.payload.signature
  if (value.split(".").length !== 3) return "";
  return value;
};

export const readAuthToken = () => sanitizeToken(localStorage.getItem("token"));

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  window.location.href = "/login";
};

export const getAuthHeaders = () => {
  const token = readAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const isAuthEndpoint = (path) => /^\/api\/auth\//.test(path);

const resolveErrorMessage = (payload, fallback = "Request failed") => {
  if (!payload || typeof payload !== "object") return fallback;
  return payload.error || payload.message || fallback;
};

export const apiRequest = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = resolveErrorMessage(data);
    if (res.status === 401 && !isAuthEndpoint(path)) {
      clearAuthSession();
      redirectToLogin();
      throw new Error(SESSION_EXPIRED_MESSAGE);
    }
    throw new Error(message);
  }
  return data;
};
