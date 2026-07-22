import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { fireFlowConfetti } from "@/features/flow/FlowSuccess";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { normalizeApiError } from "@/shared/lib/api-client";

import { conexoesApi } from "../api/conexoesApi";
import type { SituationRow } from "../types/conexoes.types";

type Step =
  | "welcome"
  | "provider"
  | "credentials"
  | "progress"
  | "qr"
  | "success"
  | "situations"
  | "test";

const PROGRESS_LABELS = [
  "Validando acesso…",
  "Preparando sua conexão…",
  "Preparando QR Code…",
];

type Props = {
  onFinished: () => void;
};

export function WhatsAppConnectWizard({ onFinished }: Props) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("welcome");
  const [mode, setMode] = useState<"hosted" | "byo">("hosted");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [progressIdx, setProgressIdx] = useState(0);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [situations, setSituations] = useState<SituationRow[]>([]);
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});

  const optionsQuery = useQuery({
    queryKey: ["admin", "comms", "whatsapp-options"],
    queryFn: () => conexoesApi.getOptions(),
  });

  const hostedAvailable = optionsQuery.data?.hosted_available ?? false;

  useEffect(() => {
    if (optionsQuery.data && !optionsQuery.data.hosted_available) {
      setMode("byo");
    }
  }, [optionsQuery.data]);

  const connectMutation = useMutation({
    mutationFn: (connectMode: "hosted" | "byo") =>
      connectMode === "hosted"
        ? conexoesApi.connect({ mode: "hosted", provider_key: "evolution" })
        : conexoesApi.connect({
            mode: "byo",
            base_url: baseUrl.trim(),
            api_key: apiKey.trim(),
            provider_key: "evolution",
          }),
    onSuccess: () => {
      setStep("qr");
      void queryClient.invalidateQueries({ queryKey: ["admin", "comms", "whatsapp"] });
    },
    onError: (err, connectMode) => {
      setStep(connectMode === "hosted" ? "provider" : "credentials");
      toast.error(normalizeApiError(err).message);
    },
  });

  const handleConnect = (connectMode: "hosted" | "byo") => {
    setMode(connectMode);
    setStep("progress");
    setProgressIdx(0);
    window.setTimeout(() => setProgressIdx(1), 400);
    window.setTimeout(() => setProgressIdx(2), 900);
    connectMutation.mutate(connectMode);
  };

  // poll do QR enquanto awaiting
  useEffect(() => {
    if (step !== "qr") return;
    let stopped = false;
    const tick = async () => {
      try {
        const data = await conexoesApi.getQr();
        if (stopped) return;
        if (data.qr_base64) setQrBase64(data.qr_base64);
        if (data.status === "connected" || data.connection?.status === "connected") {
          fireFlowConfetti();
          setStep("success");
          void queryClient.invalidateQueries({ queryKey: ["admin", "comms", "whatsapp"] });
        }
      } catch {
        /* silêncio no poll — próximo tick tenta de novo */
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), 2500);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [step, queryClient]);

  useEffect(() => {
    if (step !== "success") return;
    const id = window.setTimeout(() => setStep("situations"), 1600);
    return () => window.clearTimeout(id);
  }, [step]);

  const situationsQuery = useQuery({
    queryKey: ["admin", "comms", "situations"],
    queryFn: () => conexoesApi.listSituations(),
    enabled: step === "situations",
  });

  useEffect(() => {
    if (!situationsQuery.data) return;
    setSituations(situationsQuery.data);
    const map: Record<string, boolean> = {};
    for (const s of situationsQuery.data) map[s.event_key] = s.is_enabled;
    setEnabledMap(map);
  }, [situationsQuery.data]);

  const bulkMutation = useMutation({
    mutationFn: () => conexoesApi.bulkSituations(enabledMap),
    onSuccess: () => setStep("test"),
    onError: (err) => toast.error(normalizeApiError(err).message),
  });

  const testMutation = useMutation({
    mutationFn: () => conexoesApi.sendConnectionTest(),
    onSuccess: (res) => {
      toast.success(res.message || "Mensagem enviada");
      onFinished();
    },
    onError: (err) => toast.error(normalizeApiError(err).message),
  });

  const progressDone = useMemo(
    () => Math.min(progressIdx + (connectMutation.isPending ? 0 : 1), PROGRESS_LABELS.length),
    [progressIdx, connectMutation.isPending],
  );

  if (step === "welcome") {
    return (
      <Card className="mx-auto max-w-lg border-0 shadow-sm">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Vamos conectar seu WhatsApp?</h2>
            <p className="text-muted-foreground">
              Conectando seu número você poderá enviar automaticamente mensagens para seus
              clientes.
            </p>
            <p className="text-muted-foreground">
              Seu restaurante ficará muito mais profissional.
            </p>
          </div>
          <Button className="h-12 w-full text-base" size="lg" onClick={() => setStep("provider")}>
            Conectar WhatsApp
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "provider") {
    return (
      <Card className="mx-auto max-w-lg border-0 shadow-sm">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold">Como deseja conectar?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha a forma mais fácil para você.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={!hostedAvailable}
              onClick={() => setMode("hosted")}
              className={
                mode === "hosted" && hostedAvailable
                  ? "flex w-full items-start gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4 text-left"
                  : "flex w-full items-start gap-3 rounded-xl border p-4 text-left opacity-90 hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              <span className="mt-0.5 text-lg">✨</span>
              <span>
                <span className="font-medium">Conectar de forma simples</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Recomendado se você não entende de servidor. Só escaneie o QR Code.
                </span>
                {!hostedAvailable ? (
                  <span className="mt-1 block text-xs text-amber-700">
                    Indisponível neste ambiente — use a opção abaixo.
                  </span>
                ) : null}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode("byo")}
              className={
                mode === "byo"
                  ? "flex w-full items-start gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4 text-left"
                  : "flex w-full items-start gap-3 rounded-xl border p-4 text-left hover:border-primary/40"
              }
            >
              <span className="mt-0.5 text-lg">🟢</span>
              <span>
                <span className="font-medium">Já tenho Evolution</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Você já instalou a Evolution. Vamos pedir o endereço e a chave.
                </span>
              </span>
            </button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep("welcome")}>
              Voltar
            </Button>
            <Button
              className="flex-1"
              disabled={mode === "hosted" && !hostedAvailable}
              onClick={() => {
                if (mode === "hosted") handleConnect("hosted");
                else setStep("credentials");
              }}
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "credentials") {
    return (
      <Card className="mx-auto max-w-lg border-0 shadow-sm">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold">Vamos localizar seu servidor</h2>
            <p className="mt-1 text-sm text-muted-foreground">Informe apenas duas informações.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evo-url">Endereço da Evolution</Label>
              <Input
                id="evo-url"
                placeholder="https://…"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                É o endereço onde sua Evolution está instalada.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="evo-key">Chave de acesso</Label>
              <Input
                id="evo-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                A chave permite que nosso sistema converse com seu WhatsApp.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep("provider")}>
              Voltar
            </Button>
            <Button
              className="flex-1"
              disabled={!baseUrl.trim() || !apiKey.trim()}
              onClick={() => handleConnect("byo")}
            >
              Conectar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "progress") {
    return (
      <Card className="mx-auto max-w-lg border-0 shadow-sm">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Conectando…</h2>
          </div>
          <ul className="space-y-3">
            {PROGRESS_LABELS.map((label, i) => {
              const done = i < progressDone;
              const current = i === progressDone && connectMutation.isPending;
              return (
                <li key={label} className="flex items-center gap-3 text-sm">
                  {done ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : current ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                  )}
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    );
  }

  if (step === "qr") {
    return (
      <Card className="mx-auto max-w-lg border-0 shadow-sm">
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold">Escaneie o QR Code</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Abra o WhatsApp no celular</li>
              <li>Configurações → Dispositivos conectados</li>
              <li>Conectar dispositivo</li>
            </ol>
          </div>
          <div className="flex justify-center rounded-2xl bg-white p-4 ring-1 ring-border">
            {qrBase64 ? (
              <img
                src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                alt="QR Code do WhatsApp"
                className="h-64 w-64 max-w-full object-contain"
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Preparando…
              </div>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground">Atualiza automaticamente</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              void conexoesApi.getQr().then((d) => {
                if (d.qr_base64) setQrBase64(d.qr_base64);
              });
            }}
          >
            Gerar novo QR
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "success") {
    return (
      <Card className="mx-auto max-w-lg border-0 shadow-sm">
        <CardContent className="space-y-4 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold">Seu WhatsApp foi conectado com sucesso!</h2>
          <p className="text-muted-foreground">
            Agora vamos escolher quais mensagens seu restaurante enviará automaticamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === "situations") {
    return (
      <Card className="mx-auto max-w-lg border-0 shadow-sm">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold">Quais mensagens enviar?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Todos ligados por padrão — desmarque só o que não quiser.
            </p>
          </div>
          <ul className="space-y-2">
            {situations.map((s) => (
              <li key={s.event_key}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 hover:bg-muted/40">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                    checked={enabledMap[s.event_key] ?? true}
                    onChange={(e) =>
                      setEnabledMap((m) => ({ ...m, [s.event_key]: e.target.checked }))
                    }
                  />
                  <span>
                    <span className="font-medium">{s.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {s.description}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <Button
            className="w-full"
            disabled={bulkMutation.isPending}
            onClick={() => bulkMutation.mutate()}
          >
            {bulkMutation.isPending ? "Salvando…" : "Confirmar e ativar"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // test
  return (
    <Card className="mx-auto max-w-lg border-0 shadow-sm">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-semibold">Tudo certo para um teste rápido?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vamos enviar uma mensagem para o seu próprio WhatsApp para você ver funcionando na
            hora.
          </p>
        </div>
        <Button
          className="w-full"
          disabled={testMutation.isPending}
          onClick={() => testMutation.mutate()}
        >
          {testMutation.isPending ? "Enviando…" : "Enviar mensagem de teste"}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onFinished}>
          Fazer isso depois
        </Button>
      </CardContent>
    </Card>
  );
}
