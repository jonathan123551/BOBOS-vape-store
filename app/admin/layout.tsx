// Admin section uses its own minimal layout — no global navbar/footer needed
// because the parent root layout already provides global providers.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[rgb(var(--bg))]">{children}</div>;
}
