"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function AdminLoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(fd.get("username") || ""),
          password: String(fd.get("password") || ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }
      toast.success("Welcome back");
      router.push("/admin");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold text-center glow-text">Admin login</h1>
      <label className="block">
        <span className="text-sm opacity-80">Username</span>
        <input name="username" required className="input mt-1" autoComplete="username" defaultValue="admin" />
      </label>
      <label className="block">
        <span className="text-sm opacity-80">Password</span>
        <input
          name="password"
          required
          type="password"
          className="input mt-1"
          autoComplete="current-password"
        />
      </label>
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-xs opacity-60 text-center">
        Configure credentials via <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD</code> env vars.
      </p>
    </form>
  );
}
