import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  MessageCircle,
  MessageSquareText,
  RefreshCw,
  Send,
  Unplug,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { normalizeApiError } from "@/shared/lib/api-client";
import { cn } from "@/shared/lib/utils";

import { conexoesApi } from "../api/conexoesApi";

type Props = {
  onReconnect: () => void;
};

export function WhatsAppPanel({ onReconnect }: Props) {
  const queryClient = useQueryClient();

  const { data: connection, isLoading } = useQuery({
    queryKey: ["admin", "comms", "whatsapp"],
    queryFn: () => conexoesApi.getWhatsApp(),
    refetchInterval: 30_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin", "comms", "stats"],
    queryFn: () => conexoesApi.stats(),
  });

  const healthMutation = useMutation({
    mutationFn: () => conexoesApi.health(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "comms", "whatsapp"] });
      toast.success("Verificação concluída");
    },
    onError: (err) => toast.error(normalizeApiError(err).message),
  });

  const testMutation = useMutation({
    mutationFn: () => conexoesApi.sendConnectionTest(),
    onSuccess: (res) => toast.success(res.message),
    onError: (err) => toast.error(normalizeApiError(err).message),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => conexoesApi.disconnect(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "comms", "whatsapp"] });
      toast.message("WhatsApp desconectado");
    },
    onError: (err) => toast.error(normalizeApiError(err).message),
  });

  if (isLoading || !connection) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  const steps = connection.last_health?.steps ?? [];
  const online = connection.status === "connected";

  return (
    <div className="space-y-5">
      {!online ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-950">Seu WhatsApp foi desconectado.</p>
              <p className="text-sm text-amber-900/80">
                Os pedidos continuam no sistema — só as mensagens automáticas pausam até
                reconectar.
              </p>
            </div>
          </div>
          <Button onClick={onReconnect}>Reconectar WhatsApp</Button>
        </div>
      ) : null}

      {/* card de status — verde quando online pra dar confiança */}
      <Card
        className={cn(
          "overflow-hidden border shadow-sm",
          online
            ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-white"
            : "border-0 bg-card",
        )}
      >
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  online
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <MessageCircle className="h-6 w-6" />
                {online ? (
                  <span className="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 space-y-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                    online
                      ? "bg-emerald-500/15 text-emerald-800"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      online ? "bg-emerald-500" : "bg-muted-foreground",
                    )}
                  />
                  {online ? "WhatsApp conectado" : "WhatsApp desconectado"}
                </span>
                <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {connection.phone_display || "Número não identificado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {online
                    ? "Pronto para avisar seus clientes automaticamente."
                    : "Reconecte para voltar a enviar mensagens."}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-semibold",
                online
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  online ? "bg-white animate-pulse" : "bg-muted-foreground",
                )}
              />
              {online ? "Online" : "Offline"}
            </div>
          </div>

          <dl className="grid gap-3 rounded-xl border border-border/60 bg-white/70 p-3 sm:grid-cols-2">
            <Meta
              label="Mensagens hoje"
              value={String(stats?.today.sent ?? 0)}
            />
            <Meta
              label="Última verificação"
              value={
                connection.last_health_at
                  ? new Date(connection.last_health_at).toLocaleString("pt-BR")
                  : "ainda não"
              }
            />
          </dl>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              className="w-full sm:w-auto"
              disabled={testMutation.isPending || !online}
              onClick={() => testMutation.mutate()}
            >
              {testMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar mensagem de teste
            </Button>
            <Link
              to="/conexoes/whatsapp/templates"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full border-primary/25 text-primary hover:border-primary/40 hover:bg-primary/5 sm:w-auto",
              )}
            >
              <MessageSquareText className="mr-2 h-4 w-4" />
              Templates
            </Link>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 sm:ml-auto sm:w-auto"
              disabled={disconnectMutation.isPending}
              onClick={() => {
                if (window.confirm("Deseja desconectar este WhatsApp?")) {
                  disconnectMutation.mutate();
                }
              }}
            >
              {disconnectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Unplug className="mr-2 h-4 w-4" />
              )}
              Desconectar WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Diagnóstico</h3>
              <p className="text-sm text-muted-foreground">
                Confira se tudo está funcionando do seu lado.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-primary/25 text-primary hover:bg-primary/5 sm:w-auto"
              disabled={healthMutation.isPending}
              onClick={() => healthMutation.mutate()}
            >
              {healthMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Verificar novamente
            </Button>
          </div>
          {steps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-5 text-center text-sm text-muted-foreground">
              Toque em <span className="font-medium text-foreground">Verificar novamente</span>{" "}
              para ver o status da conexão.
            </div>
          ) : (
            <ul className="space-y-2">
              {steps.map((s) => (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm",
                    s.ok
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-amber-100 bg-amber-50/70",
                  )}
                >
                  {s.ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  )}
                  <span>
                    <span className="font-medium">{s.label}</span>
                    {s.message ? (
                      <span className="mt-0.5 block text-muted-foreground">{s.message}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {stats ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-3 p-5 sm:p-6">
            <h3 className="font-semibold">Hoje</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                label="Enviadas"
                value={stats.today.sent}
                tone="primary"
              />
              <Stat
                label="Entregues"
                value={stats.today.delivered}
                tone="success"
              />
              <Stat
                label="Pendentes"
                value={stats.today.pending}
                tone="warm"
              />
              <Stat
                label="Falhas"
                value={stats.today.failed}
                tone="danger"
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg px-2 py-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

const statToneClass = {
  primary: "border-primary/15 bg-primary/5 text-primary",
  success: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
  warm: "border-amber-200/80 bg-amber-50 text-amber-900",
  danger: "border-red-200/80 bg-red-50 text-red-800",
} as const;

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof statToneClass;
}) {
  return (
    <div className={cn("rounded-xl border px-3 py-3", statToneClass[tone])}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
