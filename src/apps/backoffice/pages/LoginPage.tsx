import { AuthLayout } from "@/apps/backoffice/layouts/AuthLayout";

export function LoginPage() {
  return (
    <AuthLayout>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Login do backoffice — Sprint 4 conecta à API.
        </p>
      </div>
    </AuthLayout>
  );
}
