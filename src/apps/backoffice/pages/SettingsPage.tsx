import { Settings, Sparkles } from "lucide-react";

import { SettingsForm } from "@/features/settings/components/SettingsForm";
import { UiHint } from "@/shared/components/UiHint";
import { PageHeader } from "@/shared/components/visual";
import { adminCopy } from "@/shared/copy/admin";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        subtitle={adminCopy.settings.subtitle}
        icon={Settings}
        accent="chart-3"
      />

      <UiHint icon={Sparkles} tone="warm">
        {adminCopy.settings.guidance}
      </UiHint>

      <SettingsForm />
    </div>
  );
}
