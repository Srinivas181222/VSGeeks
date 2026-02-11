const rawBase = import.meta.env.VITE_API_URL;
export const API_BASE = rawBase && rawBase.length ? rawBase : "";

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error || data.message || "Request failed";
    throw new Error(message);
  }
  return data;
};
