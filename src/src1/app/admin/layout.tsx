
// This layout applies to all routes under /admin
// For now, it will just render children, relying on the root layout's AppShell
// to provide sidebar and header. AppShell will detect '/admin' path for nav items.
// If more specific admin layout structure is needed, it can be built here.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
