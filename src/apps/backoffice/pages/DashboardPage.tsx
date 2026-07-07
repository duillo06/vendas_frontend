import { LayoutDashboard } from "lucide-react";

import { useAuth } from "@/features/auth";
import { EmptyState } from "@/shared/components/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function DashboardPage() {
  const { user, tenant } = useAuth();
  const firstName = user?.first_name ?? "usuário";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Bom dia, {firstName}! {tenant ? `— ${tenant.trade_name}` : null}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos hoje</CardTitle>
            <CardDescription>Em breve na Sprint 8</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Faturamento</CardTitle>
            <CardDescription>Em breve na Sprint 8</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket médio</CardTitle>
            <CardDescription>Em breve na Sprint 8</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">—</CardContent>
        </Card>
      </div>

      <EmptyState
        icon={LayoutDashboard}
        title="KPIs chegam na Sprint 8"
        description="Por enquanto o dashboard só confirma que o login e a navegação estão ok."
      />
    </div>
  );
}
