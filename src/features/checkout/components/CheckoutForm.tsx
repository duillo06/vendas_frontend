import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, CreditCard, MapPin, ShieldCheck, Smartphone, Store, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { Link } from "react-router";
import type { ZodIssue } from "zod";

import { useCart } from "@/features/cart";
import { useCompanyPublic } from "@/features/company";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { storefrontCopy } from "@/shared/copy/storefront";

import { CHECKOUT_STEPS, CheckoutStepper } from "./CheckoutStepper";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { useCheckoutPrefill } from "../hooks/useCheckoutPrefill";
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
  const prefillApplied = useRef(false);
  const { items, subtotal } = useCart();
  const { data: company } = useCompanyPublic();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { prefillValues, isPrefillReady, customer, isAuthenticated, authLoading } =
    useCheckoutPrefill(company);

  const paymentMethods = company?.settings.payment_methods ?? ["cash", "pix", "card_on_delivery"];

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
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

  useEffect(() => {
    if (!isPrefillReady || prefillApplied.current || !prefillValues) {
      return;
    }

    reset((current) => ({
      ...current,
      ...prefillValues,
    }));
    prefillApplied.current = true;
  }, [isPrefillReady, prefillValues, reset]);

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
      className="space-y-6 pb-24 lg:pb-0"
    >
      <CheckoutStepper currentStep={step} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-6">
      {!authLoading && isAuthenticated && customer ? (
        <UiHint tone="success" icon={User} title={`Olá, ${customer.first_name}!`}>
          {storefrontCopy.account.checkoutLoggedIn(customer.full_name)}
        </UiHint>
      ) : null}

      {!authLoading && !isAuthenticated ? (
        <UiHint tone="info">
          {storefrontCopy.account.guestCheckout}{" "}
          <Link to="/entrar" state={{ from: "/checkout" }} className="font-medium text-brand underline">
            {storefrontCopy.account.checkoutLoginLink}
          </Link>
          .
        </UiHint>
      ) : null}

      <UiHint tone="warm">{storefrontCopy.checkout.steps[step as 1 | 2 | 3 | 4]}</UiHint>

      {step === 1 ? (
        <Card className="border-brand-soft/60 shadow-sm">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-brand-soft/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-brand" />
              Seus dados
            </CardTitle>
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
        <Card className="border-brand-soft/60 shadow-sm">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-brand-soft/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-brand" />
              Entrega ou retirada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {company?.settings.accepts_pickup !== false ? (
                <button
                  type="button"
                  className={cn(
                    "checkout-option",
                    deliveryType === "pickup" && "checkout-option-selected",
                  )}
                  onClick={() => {
                    setValue("deliveryType", "pickup");
                    setValue("address", undefined);
                    clearErrors("address");
                  }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Store className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold">Retirada</span>
                    <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
                      Busque no balcão quando estiver pronto
                    </span>
                  </span>
                </button>
              ) : null}
              {company?.settings.accepts_delivery !== false ? (
                <button
                  type="button"
                  className={cn(
                    "checkout-option",
                    deliveryType === "delivery" && "checkout-option-selected",
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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold">Entrega</span>
                    <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
                      Levamos até o seu endereço
                    </span>
                  </span>
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
        <Card className="border-brand-soft/60 shadow-sm">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-brand-soft/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-brand" />
              Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const PaymentIcon =
                  method === "cash" ? Banknote : method === "pix" ? Smartphone : CreditCard;

                return (
                <button
                  key={method}
                  type="button"
                  className={cn(
                    "checkout-option",
                    paymentMethod === method && "checkout-option-selected",
                  )}
                  onClick={() => {
                    setValue("paymentMethod", method as CheckoutFormValues["paymentMethod"]);
                    if (method !== "cash") {
                      clearErrors("changeFor");
                      setValue("changeFor", undefined);
                    }
                  }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <PaymentIcon className="h-4 w-4" />
                  </span>
                  <span className="font-semibold">{PAYMENT_LABELS[method] ?? method}</span>
                </button>
              );
              })}
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
        <Card className="border-brand-soft/60 shadow-sm">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-brand-soft/20">
            <CardTitle>Revisão do pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-3"
                >
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
              ) : deliveryType === "delivery" ? (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Entrega</span>
                  <span className="font-medium text-brand">Grátis</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-semibold">
                <span>Total estimado</span>
                <PriceDisplay value={estimatedTotal} className="text-brand" />
              </div>
            </div>
            <div className="rounded-xl bg-brand-soft/50 p-4 text-sm">
              <p>
                <strong>{formValues.customerName}</strong> — {formValues.customerPhone}
              </p>
              <p className="text-[hsl(var(--muted-foreground))]">
                {deliveryType === "delivery" ? "Entrega" : "Retirada"} ·{" "}
                {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
              </p>
            </div>

            <UiHint icon={ShieldCheck} tone="success">
              {storefrontCopy.checkout.confirmReassurance}
            </UiHint>
          </CardContent>
        </Card>
      ) : null}

      <UiHint tone="neutral" className="text-xs lg:hidden">
        {storefrontCopy.checkout.secureNote}
      </UiHint>
        </div>

        <div className="space-y-4">
          <CheckoutOrderSummary
            className="lg:sticky lg:top-24"
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            deliveryType={deliveryType}
            freeDeliveryAbove={company?.settings.free_delivery_above}
            baseDeliveryFee={company?.settings.delivery_fee ?? 0}
            compact={step < 4}
          />
          <UiHint icon={ShieldCheck} tone="neutral" className="hidden text-xs lg:block">
            {storefrontCopy.checkout.secureNote}
          </UiHint>
        </div>
      </div>

      <div className="checkout-sticky-actions lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="mx-auto flex max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:justify-between lg:max-w-none">
        <Button
          type="button"
          variant="outline"
          disabled={step === 1 || isPending}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="lg:flex-none"
        >
          Voltar
        </Button>
        {step < CHECKOUT_STEPS ? (
          <Button type="button" onClick={goNext} className="lg:flex-none">
            Continuar
          </Button>
        ) : (
          <Button type="button" disabled={isPending} onClick={handleConfirm} className="gap-2 lg:flex-none">
            {isPending ? "Finalizando..." : "Confirmar pedido 🎉"}
          </Button>
        )}
        </div>
      </div>
    </form>
  );
}
