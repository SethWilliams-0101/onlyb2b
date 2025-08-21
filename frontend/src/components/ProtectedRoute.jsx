import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles }) {
  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  if (roles?.length) {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (!roles.includes(user?.role)) return <Navigate to="/" replace />;
    } catch {
      return <Navigate to="/login" replace />;
    }
  }
  return children;
}
