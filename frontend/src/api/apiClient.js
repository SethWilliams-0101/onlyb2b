// frontend/src/api/apiClient.js
import axios from "axios";

const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const base = /\/api$/.test(raw) ? raw : `${raw}/api`;
const api = axios.create({ baseURL: base });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const auditCode = sessionStorage.getItem("AUDIT_CODE");
  if (auditCode) config.headers["X-Audit-Code"] = auditCode;

  return config;
});

// Only force logout for /auth/* failures.
// Let other 401s bubble so components can show "Not authorized" instead of nuking the session.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || "";

    const isAuth = url.includes("/auth/");
    const isHealth = url.includes("/health");

    if (status === 401 && isAuth) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (location.pathname !== "/login") window.location.href = "/login";
      return; // stop
    }

    // For everything else, don't redirect here—let the caller handle it.
    return Promise.reject(err);
  }
);

export default api;
