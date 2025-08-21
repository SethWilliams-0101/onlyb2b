import axios from "axios";

/**
 * On Render, set VITE_API_URL to your backend URL, e.g.:
 *   https://your-api.onrender.com/api
 * For local dev, this falls back to http://localhost:5000/api
 */
const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const api = axios.create({ baseURL: `${raw}/api` });

// Attach JWT + audit header
api.interceptors.request.use((config) => {
  // Persist login across refreshes in prod
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Keep audit code short-lived (session only)
  const auditCode = sessionStorage.getItem("AUDIT_CODE");
  if (auditCode) config.headers["X-Audit-Code"] = auditCode;

  return config;
});

// Redirect to /login on 401 (except auth/health calls)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || "";
    const isAuth = url.includes("/auth/");
    const isHealth = url.includes("/health");

    if (status === 401 && !isAuth && !isHealth) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // keep AUDIT_CODE in sessionStorage; it’s separate
      if (location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
