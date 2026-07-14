import { Settings, Sparkles } from "lucide-react";

import { SettingsForm } from "@/features/settings/components/SettingsForm";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { adminCopy } from "@/shared/copy/admin";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <BackLink to="/" label="Dashboard" />

      <PageHeader
        title="Configurações"
        subtitle={adminCopy.settings.subtitle}
        icon={Settings}
      />

      <UiHint icon={Sparkles} tone="warm">
        {adminCopy.settings.guidance}
      </UiHint>

      <SettingsForm />
    </div>
  );
}
