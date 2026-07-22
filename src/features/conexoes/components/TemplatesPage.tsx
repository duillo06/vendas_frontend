import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { BackLink, PageHeader } from "@/shared/components/visual";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";
import { normalizeApiError } from "@/shared/lib/api-client";
import { cn } from "@/shared/lib/utils";

import { conexoesApi } from "../api/conexoesApi";

export function TemplatesPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState("");

  const { data: situations, isLoading } = useQuery({
    queryKey: ["admin", "comms", "situations"],
    queryFn: () => conexoesApi.listSituations(),
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "comms", "template", selected],
    queryFn: () => conexoesApi.getTemplate(selected!),
    enabled: !!selected,
  });

  useEffect(() => {
    if (detailQuery.data) setBody(detailQuery.data.body);
  }, [detailQuery.data]);

  useEffect(() => {
    if (!selected || !body) {
      setPreview("");
      return;
    }
    const id = window.setTimeout(() => {
      void conexoesApi.previewTemplate(selected, body).then((r) => setPreview(r.preview));
    }, 300);
    return () => window.clearTimeout(id);
  }, [selected, body]);

  const saveMutation = useMutation({
    mutationFn: () => conexoesApi.saveTemplate(selected!, body),
    onSuccess: () => {
      toast.success("Mensagem atualizada");
      void queryClient.invalidateQueries({ queryKey: ["admin", "comms", "situations"] });
    },
    onError: (err) => toast.error(normalizeApiError(err).message),
  });

  const testMutation = useMutation({
    mutationFn: () => conexoesApi.testTemplate(selected!, body),
    onSuccess: () => toast.success("Mensagem de teste enviada"),
    onError: (err) => toast.error(normalizeApiError(err).message),
  });

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;

  if (selected && detailQuery.data) {
    const tpl = detailQuery.data;
    return (
      <div className="space-y-6">
        <button
          type="button"
          className="text-sm font-medium text-primary hover:underline"
          onClick={() => setSelected(null)}
        >
          ← Voltar para templates
        </button>
        <PageHeader title={tpl.title} subtitle={tpl.description} />
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {tpl.variables.map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/5"
                  onClick={() => setBody((b) => `${b}{{${v}}}`)}
                >
                  {v}
                </Button>
              ))}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Prévia</p>
              <pre className="whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-sm">{preview}</pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={testMutation.isPending}
                variant="outline"
                onClick={() => testMutation.mutate()}
              >
                Enviar teste
              </Button>
              <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink to="/conexoes/whatsapp" label="Voltar ao WhatsApp" />
      <PageHeader
        title="Templates de Mensagens"
        subtitle="Edite o que seus clientes recebem — com prévia e teste."
      />
      <ul className="space-y-2">
        {(situations ?? []).map((s) => (
          <li key={s.event_key}>
            <button
              type="button"
              onClick={() => setSelected(s.event_key)}
              className="flex w-full items-center justify-between rounded-xl border bg-card p-4 text-left hover:border-primary/40"
            >
              <span>
                <span className="font-medium">{s.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground line-clamp-1">
                  {s.body_preview}
                </span>
              </span>
              <span
                className={
                  s.is_enabled
                    ? "text-xs font-medium text-primary"
                    : "text-xs text-muted-foreground"
                }
              >
                {s.is_enabled ? "Ativa" : "Pausada"}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Link to="/conexoes/whatsapp" className={cn(buttonVariants({ variant: "ghost" }))}>
        Fechar
      </Link>
    </div>
  );
}
