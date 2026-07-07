import { SettingsForm } from "@/features/settings/components/SettingsForm";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Empresa, horários, taxas e aparência do cardápio
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
