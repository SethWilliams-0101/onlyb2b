import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Audit from "./pages/Audit";
import UserHistory from "./pages/UserHistory";
import Admin from "./pages/Admin";
import Duplicates from "./pages/Duplicates";
import UploadReport from "./pages/UploadReport";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin", "auditor"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute roles={["admin", "auditor"]}>
                <Audit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit/user/:username"
            element={
              <ProtectedRoute roles={["admin", "auditor"]}>
                <UserHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload-report/:id"
            element={
              <ProtectedRoute>
                <UploadReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/duplicates"
            element={
              <ProtectedRoute roles={["admin", "auditor"]}>
                <Duplicates />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
