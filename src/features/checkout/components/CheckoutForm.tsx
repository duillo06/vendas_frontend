import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import type { ZodIssue } from "zod";

import { useCart } from "@/features/cart";
import { useCompanyPublic } from "@/features/company";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

import { CHECKOUT_STEPS, CheckoutStepper } from "./CheckoutStepper";
import { useCreateOrder } from "../hooks/useCreateOrder";
import {
  checkoutSchema,
  checkoutStep1Schema,
  checkoutStep2Schema,
  checkoutStep3Schema,
  type CheckoutFormValues,
} from "../schemas/checkout.schema";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  pix: "PIX na entrega",
  card_on_delivery: "Cartão na entrega",
};

export function CheckoutForm() {
  const [step, setStep] = useState(1);
  const { items, subtotal } = useCart();
  const { data: company } = useCompanyPublic();
  const { mutate: createOrder, isPending } = useCreateOrder();

  const paymentMethods = company?.settings.payment_methods ?? ["cash", "pix", "card_on_delivery"];

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType: "pickup",
      paymentMethod: "pix",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
    },
  });

  const deliveryType = watch("deliveryType");
  const paymentMethod = watch("paymentMethod");
  const formValues = watch();

  const deliveryFee =
    deliveryType === "delivery" && company
      ? company.settings.free_delivery_above &&
        subtotal >= company.settings.free_delivery_above
        ? 0
        : company.settings.delivery_fee
      : 0;

  const estimatedTotal = subtotal + deliveryFee;

  const applyZodErrors = (fieldErrors: ZodIssue[]) => {
    fieldErrors.forEach((issue) => {
      const path = issue.path.join(".") as FieldPath<CheckoutFormValues>;
      if (path) {
        setError(path, { message: issue.message });
      }
    });
  };

  const goNext = () => {
    const values = getValues();

    if (step === 1) {
      const result = checkoutStep1Schema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.issues);
        return;
      }
      clearErrors(["customerName", "customerPhone", "customerEmail"]);
      setStep(2);
      return;
    }

    if (step === 2) {
      const step2Data =
        values.deliveryType === "delivery"
          ? { deliveryType: "delivery" as const, address: values.address }
          : { deliveryType: "pickup" as const };

      const result = checkoutStep2Schema.safeParse(step2Data);
      if (!result.success) {
        applyZodErrors(result.error.issues);
        return;
      }
      clearErrors("address");
      setStep(3);
      return;
    }

    if (step === 3) {
      const step3Data =
        values.paymentMethod === "cash"
          ? {
              paymentMethod: "cash" as const,
              changeFor: values.changeFor,
              notes: values.notes,
            }
          : {
              paymentMethod: values.paymentMethod,
              notes: values.notes,
            };

      const result = checkoutStep3Schema.safeParse(step3Data);
      if (!result.success) {
        applyZodErrors(result.error.issues);
        return;
      }
      clearErrors(["paymentMethod", "changeFor", "notes"]);
      setStep(4);
    }
  };

  const onSubmit = handleSubmit((data) => {
    createOrder(data);
  });

  const handleConfirm = () => {
    void onSubmit();
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      className="space-y-6"
    >
      <CheckoutStepper currentStep={step} />

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Seus dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome completo</Label>
              <Input id="customerName" autoComplete="name" {...register("customerName")} />
              {errors.customerName ? (
                <p className="text-xs text-red-600">{errors.customerName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telefone (WhatsApp)</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="(11) 98765-4321"
                autoComplete="tel"
                {...register("customerPhone")}
              />
              {errors.customerPhone ? (
                <p className="text-xs text-red-600">{errors.customerPhone.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">E-mail (opcional)</Label>
              <Input id="customerEmail" type="email" autoComplete="email" {...register("customerEmail")} />
              {errors.customerEmail ? (
                <p className="text-xs text-red-600">{errors.customerEmail.message}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Entrega ou retirada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {company?.settings.accepts_pickup !== false ? (
                <button
                  type="button"
                  className={cn(
                    "rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                    deliveryType === "pickup"
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "border-[hsl(var(--border))]",
                  )}
                  onClick={() => {
                    setValue("deliveryType", "pickup");
                    setValue("address", undefined);
                    clearErrors("address");
                  }}
                >
                  Retirada
                </button>
              ) : null}
              {company?.settings.accepts_delivery !== false ? (
                <button
                  type="button"
                  className={cn(
                    "rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                    deliveryType === "delivery"
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "border-[hsl(var(--border))]",
                  )}
                  onClick={() => {
                    setValue("deliveryType", "delivery");
                    setValue("address", {
                      street: "",
                      number: "",
                      complement: "",
                      neighborhood: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      reference: "",
                    });
                  }}
                >
                  Entrega
                </button>
              ) : null}
            </div>

            {deliveryType === "delivery" ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input id="street" {...register("address.street")} />
                    {errors.address?.street ? (
                      <p className="text-xs text-red-600">{errors.address.street.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" {...register("address.number")} />
                    {errors.address?.number ? (
                      <p className="text-xs text-red-600">{errors.address.number.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" {...register("address.complement")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" {...register("address.neighborhood")} />
                    {errors.address?.neighborhood ? (
                      <p className="text-xs text-red-600">{errors.address.neighborhood.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input id="zipCode" placeholder="01310-100" {...register("address.zipCode")} />
                    {errors.address?.zipCode ? (
                      <p className="text-xs text-red-600">{errors.address.zipCode.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" {...register("address.city")} />
                    {errors.address?.city ? (
                      <p className="text-xs text-red-600">{errors.address.city.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">UF</Label>
                    <Input id="state" maxLength={2} {...register("address.state")} />
                    {errors.address?.state ? (
                      <p className="text-xs text-red-600">{errors.address.state.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="reference">Referência</Label>
                    <Input id="reference" {...register("address.reference")} />
                  </div>
                </div>
                {errors.address?.message ? (
                  <p className="text-xs text-red-600">{errors.address.message}</p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  className={cn(
                    "flex w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                    paymentMethod === method
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "border-[hsl(var(--border))]",
                  )}
                  onClick={() => {
                    setValue("paymentMethod", method as CheckoutFormValues["paymentMethod"]);
                    if (method !== "cash") {
                      clearErrors("changeFor");
                      setValue("changeFor", undefined);
                    }
                  }}
                >
                  {PAYMENT_LABELS[method] ?? method}
                </button>
              ))}
            </div>

            {paymentMethod === "cash" ? (
              <div className="space-y-2">
                <Label htmlFor="changeFor">Troco para quanto?</Label>
                <Input
                  id="changeFor"
                  type="number"
                  step="0.01"
                  min={estimatedTotal + 0.01}
                  placeholder={`Mín. R$ ${(estimatedTotal + 1).toFixed(2)}`}
                  {...register("changeFor", {
                    setValueAs: (value) => {
                      if (value === "" || value === null || value === undefined) {
                        return undefined;
                      }
                      const parsed = Number(value);
                      return Number.isNaN(parsed) ? undefined : parsed;
                    },
                  })}
                />
                {errors.changeFor ? (
                  <p className="text-xs text-red-600">{errors.changeFor.message}</p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="notes">Observações do pedido</Label>
              <Input id="notes" placeholder="Ex: sem cebola" {...register("notes")} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card>
          <CardHeader>
            <CardTitle>Revisão do pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>
                    {item.quantity}x {item.productName}
                  </span>
                  <PriceDisplay value={item.unitPrice * item.quantity} />
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-[hsl(var(--border))] pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                <PriceDisplay value={subtotal} />
              </div>
              {deliveryFee > 0 ? (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Entrega</span>
                  <PriceDisplay value={deliveryFee} />
                </div>
              ) : null}
              <div className="flex justify-between text-base font-semibold">
                <span>Total estimado</span>
                <PriceDisplay value={estimatedTotal} className="text-[hsl(var(--primary))]" />
              </div>
            </div>
            <div className="rounded-lg bg-[hsl(var(--muted))]/50 p-3 text-sm">
              <p>
                <strong>{formValues.customerName}</strong> — {formValues.customerPhone}
              </p>
              <p className="text-[hsl(var(--muted-foreground))]">
                {deliveryType === "delivery" ? "Entrega" : "Retirada"} ·{" "}
                {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={step === 1 || isPending}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          Voltar
        </Button>
        {step < CHECKOUT_STEPS ? (
          <Button type="button" onClick={goNext}>
            Continuar
          </Button>
        ) : (
          <Button type="button" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Finalizando..." : "Confirmar pedido"}
          </Button>
        )}
      </div>
    </form>
  );
}
