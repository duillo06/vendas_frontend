import { useEffect, useRef } from "react";

import { BLUEPRINTS } from "../blueprints";
import { SegmentCard } from "../components/SegmentCard";
import type { ProductWizard } from "../useProductWizard";

export function SegmentStep({ wizard }: { wizard: ProductWizard }) {
  const { state, dispatch, goNext } = wizard;
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {BLUEPRINTS.map((blueprint) => (
        <SegmentCard
          key={blueprint.id}
          emoji={blueprint.emoji}
          label={blueprint.label}
          tagline={blueprint.tagline}
          selected={state.segmentId === blueprint.id}
          onSelect={() => {
            dispatch({ type: "SET_SEGMENT", id: blueprint.id });
            // só auto-avança uma vez — evita pular etapa se Continuar também for clicado
            if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
            advanceTimer.current = window.setTimeout(() => {
              advanceTimer.current = null;
              goNext();
            }, 220);
          }}
        />
      ))}
    </div>
  );
}
