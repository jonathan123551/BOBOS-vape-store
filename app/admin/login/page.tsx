import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  if (getAdminFromCookies()) redirect("/admin");
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card neon-border p-8 w-full max-w-md space-y-5">
        <div className="flex justify-center">
          <Logo size={48} />
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
