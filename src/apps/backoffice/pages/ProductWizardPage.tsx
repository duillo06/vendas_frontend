import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { FlowPanel } from "@/features/flow/FlowPanel";
import { FlowSuccess } from "@/features/flow/FlowSuccess";
import { flowMessages, type FlowLine } from "@/features/flow/flowMessages";
import { createProductFromWizard } from "@/features/product-wizard/buildEnginePayload";
import { WizardNav } from "@/features/product-wizard/components/WizardNav";
import { WizardShell } from "@/features/product-wizard/components/WizardShell";
import { WizardStepper } from "@/features/product-wizard/components/WizardStepper";
import { BasicsStep } from "@/features/product-wizard/steps/BasicsStep";
import { OptionBuilderStep } from "@/features/product-wizard/steps/OptionBuilderStep";
import { PriceStep } from "@/features/product-wizard/steps/PriceStep";
import { QuestionStep } from "@/features/product-wizard/steps/QuestionStep";
import { ReviewStep } from "@/features/product-wizard/steps/ReviewStep";
import { SegmentStep } from "@/features/product-wizard/steps/SegmentStep";
import { useProductWizard } from "@/features/product-wizard/useProductWizard";
import { BackLink } from "@/shared/components/visual";
import { Card, CardContent } from "@/shared/components/ui/card";
import { adminCopy } from "@/shared/copy/admin";

const copy = adminCopy.wizard;

export function ProductWizardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const wizard = useProductWizard();
  const [createdId, setCreatedId] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: catalogAdminKeys.categories(),
    queryFn: () => catalogAdminApi.listCategories(),
  });

  // limpa os object URLs das imagens ao desmontar
  useEffect(() => {
    return () => {
      wizard.state.images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = useMutation({
    mutationFn: () =>
      createProductFromWizard({
        name: wizard.state.basics.name,
        description: wizard.state.basics.description,
        categoryId: wizard.state.basics.categoryId,
        basePrice: wizard.state.basePrice,
        groups: wizard.groups,
        optionsByGroup: wizard.state.optionsByGroup,
        images: wizard.state.images,
        composition: wizard.composition,
      }),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.all });
      setCreatedId(product.id);
    },
    onError: (error: Error) => {
      // erro nunca frio: fala do Flow
      toast.error(`${flowMessages.error.emoji} ${flowMessages.error.text}`);
      if (error.message) console.error(error);
    },
  });

  const header = getHeader(wizard);
  const flowLine = getFlowLine(wizard);
  const progress = (wizard.stepIndex + 1) / wizard.screens.length;

  const handleNext = () => {
    if (wizard.isLast) {
      create.mutate();
      return;
    }
    wizard.goNext();
  };

  return (
    <>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <BackLink to="/produtos" label="Produtos" />
          <Link
            to="/produtos/novo/avancado"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:text-brand"
            title={copy.advancedHint}
          >
            <Settings2 className="h-4 w-4" />
            {copy.advancedLink}
          </Link>
        </div>

        <WizardStepper currentPhase={wizard.phaseOf(wizard.currentScreen)} progress={progress} />

        <FlowPanel line={flowLine} compact />

        <Card>
          <CardContent className="space-y-6 p-5 sm:p-6">
            <WizardShell
              stepKey={screenKey(wizard)}
              emoji={header.emoji}
              title={header.title}
              subtitle={header.subtitle}
            >
              {renderStep(wizard, categories ?? [])}
            </WizardShell>

            <WizardNav
              onBack={wizard.goBack}
              onNext={handleNext}
              canGoBack={wizard.stepIndex > 0}
              canGoNext={wizard.isCurrentValid}
              isLast={wizard.isLast}
              loading={create.isPending}
            />
          </CardContent>
        </Card>
      </div>

      <FlowSuccess
        open={createdId !== null}
        line={flowMessages.success}
        actionLabel="Ver produto"
        onAction={() => navigate(`/produtos/${createdId}`)}
      />
    </>
  );
}

function screenKey(wizard: ReturnType<typeof useProductWizard>): string {
  const s = wizard.currentScreen;
  if (s.kind === "question") return `question-${s.questionId}`;
  if (s.kind === "options") return `options-${s.groupKey}`;
  return s.kind;
}

// mensagem do Flow por tela — humaniza cada etapa
function getFlowLine(wizard: ReturnType<typeof useProductWizard>): FlowLine {
  const s = wizard.currentScreen;
  const m = flowMessages.wizard;
  switch (s.kind) {
    case "basics":
      return m.basics;
    case "segment":
      return m.segment;
    case "question": {
      // na primeira pergunta do segmento, o Flow "percebe" o tipo escolhido
      const first = wizard.activeQuestions[0]?.id === s.questionId;
      const intro = wizard.blueprint ? flowMessages.segmentIntro[wizard.blueprint.id] : undefined;
      if (first && intro) return { mood: "happy", ...intro };
      return m.question;
    }
    case "options":
      return m.options;
    case "price":
      return m.price;
    case "review":
      return m.review;
  }
}

function getHeader(wizard: ReturnType<typeof useProductWizard>): {
  emoji?: string;
  title: string;
  subtitle?: string;
} {
  const s = wizard.currentScreen;
  switch (s.kind) {
    case "basics":
      return { emoji: "👋", title: copy.basics.title, subtitle: copy.basics.subtitle };
    case "segment":
      return { emoji: "🍽️", title: copy.segment.title, subtitle: copy.segment.subtitle };
    case "question": {
      const question = wizard.blueprint?.questions[s.questionId];
      return { emoji: question?.emoji, title: question?.title ?? "", subtitle: question?.subtitle };
    }
    case "options": {
      const group = wizard.groupByKey(s.groupKey);
      return { emoji: group?.emoji, title: group?.optionsPrompt ?? "", subtitle: copy.optionsSubtitle };
    }
    case "price":
      return { emoji: "💰", title: copy.price.title, subtitle: copy.price.subtitle };
    case "review":
      return { emoji: "🎉", title: copy.review.title, subtitle: copy.review.subtitle };
  }
}

function renderStep(
  wizard: ReturnType<typeof useProductWizard>,
  categories: Parameters<typeof BasicsStep>[0]["categories"],
) {
  const s = wizard.currentScreen;
  switch (s.kind) {
    case "basics":
      return <BasicsStep wizard={wizard} categories={categories} />;
    case "segment":
      return <SegmentStep wizard={wizard} />;
    case "question": {
      const question = wizard.blueprint?.questions[s.questionId];
      if (!question) return null;
      return <QuestionStep wizard={wizard} question={question} />;
    }
    case "options":
      return <OptionBuilderStep wizard={wizard} groupKey={s.groupKey} />;
    case "price":
      return <PriceStep wizard={wizard} />;
    case "review":
      return <ReviewStep wizard={wizard} categories={categories} />;
  }
}
