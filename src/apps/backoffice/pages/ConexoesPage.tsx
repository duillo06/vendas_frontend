import { Link } from "react-router";
import { MessageCircle, Plug } from "lucide-react";

import { Can } from "@/features/auth";
import { UiHint } from "@/shared/components/UiHint";
import { PageHeader } from "@/shared/components/visual";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

const channels = [
  {
    to: "/conexoes/whatsapp",
    title: "WhatsApp",
    benefit: "Enviar mensagens automáticas aos clientes",
    status: "active" as const,
    icon: MessageCircle,
  },
  {
    title: "Email",
    benefit: "Recibos e campanhas por e-mail",
    status: "soon" as const,
    icon: Plug,
  },
  {
    title: "SMS",
    benefit: "Alertas rápidos por mensagem de texto",
    status: "soon" as const,
    icon: Plug,
  },
];

export function ConexoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Conexões"
        subtitle="Ligue os serviços que seu restaurante já usa — o sistema cuida do resto."
      />
      <UiHint>
        Comece pelo WhatsApp. Outros serviços aparecem aqui assim que estiverem prontos.
      </UiHint>

      <Can permission="connections.manage">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Comunicação</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((ch) => {
              const Icon = ch.icon;
              const inner = (
                <Card
                  className={cn(
                    "h-full border-0 shadow-sm transition",
                    ch.status === "active" && "hover:ring-1 hover:ring-primary/30",
                    ch.status === "soon" && "opacity-70",
                  )}
                >
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{ch.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{ch.benefit}</p>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        ch.status === "active" ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {ch.status === "active" ? "Disponível" : "Em breve"}
                    </span>
                  </CardContent>
                </Card>
              );
              if (ch.status === "active" && "to" in ch && ch.to) {
                return (
                  <Link key={ch.title} to={ch.to} className="block">
                    {inner}
                  </Link>
                );
              }
              return <div key={ch.title}>{inner}</div>;
            })}
          </div>
        </section>
      </Can>
    </div>
  );
}
