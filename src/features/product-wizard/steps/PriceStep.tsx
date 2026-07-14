import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { Label } from "@/shared/components/ui/label";
import type { ProductWizard } from "../useProductWizard";

export function PriceStep({ wizard }: { wizard: ProductWizard }) {
  const { state, dispatch } = wizard;

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-xs space-y-2">
        <Label htmlFor="wiz-price">Preço base do produto</Label>
        <CurrencyInput
          id="wiz-price"
          value={state.basePrice}
          onChange={(value) => dispatch({ type: "SET_BASE_PRICE", value })}
        />
      </div>
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        Este é o valor inicial. Opções e adicionais são somados a partir daqui.
      </p>
    </div>
  );
}
