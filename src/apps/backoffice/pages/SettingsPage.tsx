import { Settings } from "lucide-react";

import { EmptyState } from "@/shared/components/EmptyState";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Empresa, horários e taxas — Sprint 10</p>
      </div>

      <EmptyState
        icon={Settings}
        title="Configurações em breve"
        description="Logo, horário de funcionamento e taxa de entrega entram na Sprint 10."
      />
    </div>
  );
}
