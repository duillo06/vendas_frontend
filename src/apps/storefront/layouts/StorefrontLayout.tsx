import { Outlet } from "react-router";

export function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))] px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-semibold text-[hsl(var(--primary))]">Food Service</span>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Storefront</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
