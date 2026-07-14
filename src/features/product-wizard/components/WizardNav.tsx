import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

type WizardNavProps = {
  onBack?: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLast: boolean;
  nextLabel?: string;
  loading?: boolean;
};

export function WizardNav({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLast,
  nextLabel,
  loading,
}: WizardNavProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={!canGoBack || loading}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Button
        type="button"
        size="lg"
        onClick={onNext}
        disabled={!canGoNext || loading}
        className="gap-2"
      >
        {isLast ? <Sparkles className="h-4 w-4" /> : null}
        {loading ? "Criando..." : nextLabel ?? (isLast ? "Criar produto" : "Continuar")}
        {!isLast ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
    </div>
  );
}
