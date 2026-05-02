"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export function AdminLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }
  return (
    <button type="button" onClick={logout} disabled={loading} className="btn-ghost text-xs">
      {loading ? "..." : "Logout"}
    </button>
  );
}
