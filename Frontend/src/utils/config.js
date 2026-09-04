const rawApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? "http://localhost:8001" : "");

// Strip trailing slashes to prevent //api/... malformed paths
export const API_BASE = typeof rawApiBase === "string" ? rawApiBase.trim().replace(/\/+$/, "") : "";
