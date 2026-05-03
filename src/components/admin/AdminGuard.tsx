import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthed, loading } = useAdminAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center opacity-70">Loading…</div>
    );
  }
  if (!isAuthed) {
    return (
      <Navigate to="/admin/login" replace state={{ from: pathname }} />
    );
  }
  return <>{children}</>;
}
