// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function isTokenValid() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true; // opaque token -> assume ok
    const payload = JSON.parse(atob(parts[1]));
    if (payload?.exp && Date.now() >= payload.exp * 1000) return false; // expired
    return true;
  } catch {
    return true;
  }
}

export default function ProtectedRoute({ children, roles }) {
  if (!isTokenValid()) return <Navigate to="/login" replace />;

  if (roles?.length) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.role || !roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
}
