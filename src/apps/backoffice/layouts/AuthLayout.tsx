import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--muted))]/30 p-4">
      <div className="w-full max-w-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
