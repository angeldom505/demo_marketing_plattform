import { DashboardShell } from "@/components/shell/dashboard-shell";

// DEMO MODE: no auth check
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell userEmail="demo@hogaresunion.mx">{children}</DashboardShell>;
}
