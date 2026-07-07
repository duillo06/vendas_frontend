import { Outlet } from "react-router";

export function BackofficeLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4 md:block">
        <p className="font-semibold text-[hsl(var(--primary))]">Food Service</p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Backoffice</p>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
