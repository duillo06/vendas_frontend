import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { settingsKeys } from "@/features/settings/constants/query-keys";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { firstSetupApi, type SetupApplyResult, type SetupSegment } from "./firstSetupApi";
import { FlowMascot } from "./FlowMascot";

type Step = "welcome" | "segment" | "done";

type FirstSetupAssistantProps = {
  open: boolean;
  onClose: () => void;
  onFinished?: (result: SetupApplyResult | null) => void;
};

export function FirstSetupAssistant({ open, onClose, onFinished }: FirstSetupAssistantProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("welcome");
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<SetupApplyResult | null>(null);

  const setupQuery = useQuery({
    queryKey: [...settingsKeys.all, "setup"],
    queryFn: () => firstSetupApi.get(),
    enabled: open,
  });

  const segments = setupQuery.data?.segments ?? [];

  const apply = useMutation({
    mutationFn: (segment: string) => firstSetupApi.apply(segment),
    onSuccess: (data) => {
      setResult(data);
      setStep("done");
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.all });
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success("Pronto — seu cardápio base já está montado");
    },
    onError: () => toast.error("Não deu pra montar agora. Tente de novo."),
  });

  const dismiss = useMutation({
    mutationFn: () => firstSetupApi.dismiss(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      onFinished?.(null);
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
        initial={{ scale: 0.94, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
      >
        <FlowMascot
          mood={step === "done" ? "celebrating" : "happy"}
          size="lg"
          className="mx-auto"
        />

        <AnimatePresence mode="wait">
          {step === "welcome" ? (
            <motion.div
              key="welcome"
              className="mt-3 space-y-4 text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div>
                <p className="text-xl font-bold">Vamos montar seu cardápio?</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
                  Em poucas perguntas preparamos categorias e o jeito típico de vender — sem
                  complicação.
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={dismiss.isPending}
                  onClick={() => dismiss.mutate()}
                >
                  Agora não
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="bg-brand hover:brightness-95"
                  onClick={() => setStep("segment")}
                >
                  Começar
                </Button>
              </div>
            </motion.div>
          ) : null}

          {step === "segment" ? (
            <motion.div
              key="segment"
              className="mt-3 space-y-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="text-center">
                <p className="text-lg font-bold">O que você vende?</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Escolha o mais parecido — dá pra ajustar depois.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {segments.map((seg: SetupSegment) => (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setSelected(seg.id)}
                    className={cn(
                      "rounded-2xl border-2 px-3 py-3 text-left transition",
                      selected === seg.id
                        ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary-soft))]"
                        : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary)/0.25)]",
                    )}
                  >
                    <span className="text-xl" aria-hidden>
                      {seg.emoji}
                    </span>
                    <p className="mt-1 text-sm font-semibold">{seg.label}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{seg.tagline}</p>
                  </button>
                ))}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep("welcome")}>
                  Voltar
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="bg-brand hover:brightness-95"
                  disabled={!selected || apply.isPending}
                  onClick={() => selected && apply.mutate(selected)}
                >
                  {apply.isPending ? "Montando…" : "Preparar meu cardápio"}
                </Button>
              </div>
            </motion.div>
          ) : null}

          {step === "done" && result ? (
            <motion.div
              key="done"
              className="mt-3 space-y-4 text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div>
                <p className="text-xl font-bold">Cardápio base pronto</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
                  Criamos {result.categories.map((c) => c.name).join(", ")}. Agora é só cadastrar o
                  primeiro produto com os preços.
                </p>
              </div>
              <ul className="space-y-1.5 text-left">
                {result.categories.map((cat) => (
                  <li
                    key={cat.id}
                    className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm"
                  >
                    <span className="mr-1.5" aria-hidden>
                      {cat.emoji}
                    </span>
                    {cat.name}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                size="lg"
                className="w-full bg-brand hover:brightness-95"
                onClick={() => {
                  onFinished?.(result);
                  onClose();
                }}
              >
                Cadastrar primeiro produto
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
                Ir pro painel
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
