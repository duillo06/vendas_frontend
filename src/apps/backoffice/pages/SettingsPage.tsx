import {
  Building2,
  Clock3,
  KeyRound,
  Palette,
  Printer,
  Settings,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "react-router";

import { ChangePasswordCard } from "@/features/auth";
import {
  SettingsForm,
  type SettingsFormSection,
} from "@/features/settings/components/SettingsForm";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";

type SettingsHubId = SettingsFormSection | "senha";

const HUB_ITEMS: Array<{
  id: SettingsHubId;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "empresa",
    title: "Empresa",
    description: adminCopy.settings.sections.company,
    icon: Building2,
  },
  {
    id: "operacao",
    title: "Operação",
    description: adminCopy.settings.sections.operation,
    icon: Store,
  },
  {
    id: "horarios",
    title: "Horários",
    description: adminCopy.settings.sections.hours,
    icon: Clock3,
  },
  {
    id: "impressao",
    title: "Impressão da comanda",
    description: adminCopy.settings.sections.print,
    icon: Printer,
  },
  {
    id: "aparencia",
    title: "Aparência",
    description: adminCopy.settings.sections.appearance,
    icon: Palette,
  },
  {
    id: "senha",
    title: "Senha de acesso",
    description: adminCopy.settings.sections.password,
    icon: KeyRound,
  },
];

function isHubId(value: string | null): value is SettingsHubId {
  return HUB_ITEMS.some((item) => item.id === value);
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get("secao");
  const section = isHubId(raw) ? raw : null;
  const active = section ? HUB_ITEMS.find((item) => item.id === section) : null;

  function openSection(id: SettingsHubId) {
    setSearchParams({ secao: id });
  }

  return (
    <div className="space-y-6">
      <BackLink
        to={section ? "/configuracoes" : "/"}
        label={section ? "Todas as configurações" : "Dashboard"}
      />

      <PageHeader
        title={active?.title ?? "Configurações"}
        subtitle={
          active
            ? active.description
            : adminCopy.settings.hubSubtitle
        }
        icon={active?.icon ?? Settings}
      />

      {!section ? (
        <>
          <UiHint icon={Sparkles} tone="warm">
            {adminCopy.settings.hubGuidance}
          </UiHint>

          <div className="grid gap-3 sm:grid-cols-2">
            {HUB_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openSection(item.id)}
                  className={cn(
                    "group flex min-h-[5.5rem] items-start gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left shadow-[var(--shadow-xs)]",
                    "transition-[transform,border-color,box-shadow,background-color] duration-200",
                    "hover:border-[hsl(var(--primary)/0.35)] hover:bg-[hsl(var(--muted))]/40 hover:shadow-[var(--shadow-sm)]",
                    "active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.35)]",
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] text-brand transition-colors group-hover:bg-[hsl(var(--primary)/0.18)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[hsl(var(--foreground))]">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : section === "senha" ? (
        <ChangePasswordCard />
      ) : (
        <SettingsForm section={section} />
      )}
    </div>
  );
}
