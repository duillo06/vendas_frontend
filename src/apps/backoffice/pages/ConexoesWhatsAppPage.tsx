import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Can } from "@/features/auth";
import { WhatsAppConnectWizard } from "@/features/conexoes/components/WhatsAppConnectWizard";
import { WhatsAppPanel } from "@/features/conexoes/components/WhatsAppPanel";
import { conexoesApi } from "@/features/conexoes";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ConexoesWhatsAppPage() {
  const [forceWizard, setForceWizard] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "comms", "whatsapp"],
    queryFn: () => conexoesApi.getWhatsApp(),
  });

  const status = data?.status ?? "none";
  const showPanel =
    !forceWizard && (status === "connected" || status === "disconnected");

  return (
    <div className="space-y-6">
      <BackLink to="/conexoes" label="Voltar para Conexões" />
      <PageHeader
        title="WhatsApp"
        subtitle="Conecte seu número e avise os clientes automaticamente."
      />

      <Can permission="connections.manage">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : showPanel ? (
          <WhatsAppPanel onReconnect={() => setForceWizard(true)} />
        ) : (
          <WhatsAppConnectWizard
            onFinished={() => {
              setForceWizard(false);
              void refetch();
            }}
          />
        )}
      </Can>
    </div>
  );
}
