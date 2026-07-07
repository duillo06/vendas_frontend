import { useEffect, useState } from "react";

import { Input } from "@/shared/components/ui/input";
import { formatCurrency, maskCurrencyInput, parseCurrencyInput } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type CurrencyInputProps = {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function CurrencyInput({
  value,
  onChange,
  id,
  className,
  disabled,
  placeholder = "R$ 0,00",
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatCurrency(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(formatCurrency(value));
    }
  }, [value, focused]);

  return (
    <Input
      id={id}
      inputMode="numeric"
      disabled={disabled}
      placeholder={placeholder}
      className={cn("tabular-nums", className)}
      value={display}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setDisplay(formatCurrency(value));
      }}
      onChange={(event) => {
        const masked = maskCurrencyInput(event.target.value);
        setDisplay(masked);
        onChange(parseCurrencyInput(masked));
      }}
    />
  );
}
