import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { Input } from "@/shared/components/ui/input";
import { formatPhoneMask } from "@/shared/lib/phone";

type PhoneInputProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "type" | "inputMode" | "value" | "onChange"
> & {
  value?: string;
  onChange?: (value: string) => void;
};

/** input de celular com máscara (11) 98765-4321 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value = "", onChange, ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      placeholder="(11) 98765-4321"
      maxLength={15}
      value={formatPhoneMask(value)}
      onChange={(event) => onChange?.(formatPhoneMask(event.target.value))}
      {...props}
    />
  );
});
