import { zodResolver } from "@hookform/resolvers/zod";
import { Armchair, Banknote, CreditCard, MapPin, Smartphone, Store, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import type { ZodIssue } from "zod";

import { useCart, formatCompositionLabel, CompositionHighlight } from "@/features/cart";
import { useCompanyPublic } from "@/features/company";
import { getMesaSession, setMesaSession, tablesPublicApi } from "@/features/tables";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { MessageTicker } from "@/shared/components/MessageTicker";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PhoneInput } from "@/shared/components/PhoneInput";
import { cn } from "@/shared/lib/utils";
import { storefrontCopy } from "@/shared/copy/storefront";

import { CHECKOUT_STEPS, CheckoutStepper } from "./CheckoutStepper";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { AddressFields, type AddressFieldsValue } from "./AddressFields";
import { useCheckoutPrefill } from "../hooks/useCheckoutPrefill";
import { useCreateOrder } from "../hooks/useCreateOrder";
import {
  checkoutSchema,
  checkoutStep1Schema,
  checkoutStep2Schema,
  checkoutStep3Schema,
  type CheckoutFormValues,
} from "../schemas/checkout.schema";
import { isInDeliveryArea } from "@/shared/lib/geo";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  pix: "PIX na entrega",
  card_on_delivery: "Cartão na entrega",
  pay_at_venue: "Pagar no local",
};

export function CheckoutForm() {
  const [step, setStep] = useState(1);
  const [mesaNumberInput, setMesaNumberInput] = useState("");
  const [mesaLabel, setMesaLabel] = useState<string | null>(null);
  const [resolvingMesa, setResolvingMesa] = useState(false);
  const prefillApplied = useRef(false);
  const mesaApplied = useRef(false);
  const { items, subtotal, removeItem } = useCart();
  const { data: company } = useCompanyPublic();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { prefillValues, isPrefillReady, customer, isAuthenticated, authLoading } =
    useCheckoutPrefill(company);

  const paymentMethods = company?.settings.payment_methods ?? ["cash", "pix", "card_on_delivery"];
  const acceptsDineIn = company?.settings.accepts_dine_in === true;

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    setError,
    clearErrors,
    control,
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

  // veio do QR da mesa → checkout express (só confirmar)
  useEffect(() => {
    if (!acceptsDineIn || mesaApplied.current) return;
    const session = getMesaSession();
    if (!session) return;
    setValue("deliveryType", "dine_in");
    setValue("tableId", session.tableId);
    setValue("qrToken", session.qrToken);
    setValue("paymentMethod", "pay_at_venue");
    setValue("address", undefined);
    setValue("customerPhone", "");
    setValue("customerEmail", "");
    setValue("customerName", `Mesa ${session.tableNumber}`);
    setMesaLabel(`Mesa ${session.tableNumber}`);
    setMesaNumberInput(session.tableNumber);
    setStep(4);
    mesaApplied.current = true;
  }, [acceptsDineIn, setValue]);

  const deliveryType = watch("deliveryType");
  const paymentMethod = watch("paymentMethod");
  const formValues = watch();
  const mesaExpress =
    deliveryType === "dine_in" && Boolean(formValues.tableId || formValues.qrToken);

  const applyMesaByNumber = async () => {
    const number = mesaNumberInput.trim();
    if (!number) {
      toast.error("Informe o número da mesa");
      return;
    }
    setResolvingMesa(true);
    try {
      const table = await tablesPublicApi.getByNumber(number);
      setValue("deliveryType", "dine_in");
      setValue("tableId", table.table_id);
      setValue("qrToken", table.qr_token);
      setValue("paymentMethod", "pay_at_venue");
      setValue("address", undefined);
      setValue("customerPhone", "");
      setValue("customerEmail", "");
      setValue("customerName", `Mesa ${table.table_number}`);
      setMesaLabel(`Mesa ${table.table_number}`);
      setMesaSession({
        tableId: table.table_id,
        tableNumber: table.table_number,
        qrToken: table.qr_token || "",
      });
      clearErrors(["tableId", "address"]);
      setStep(4);
    } catch {
      toast.error("Não encontramos essa mesa. Confira o número.");
    } finally {
      setResolvingMesa(false);
    }
  };

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
          : values.deliveryType === "dine_in"
            ? {
                deliveryType: "dine_in" as const,
                tableId: values.tableId,
                qrToken: values.qrToken,
              }
            : { deliveryType: "pickup" as const };

      const result = checkoutStep2Schema.safeParse(step2Data);
      if (!result.success) {
        applyZodErrors(result.error.issues);
        if (values.deliveryType === "dine_in") {
          toast.error("Informe a mesa antes de continuar");
        }
        return;
      }
      if (
        values.deliveryType === "delivery" &&
        values.address &&
        !isInDeliveryArea({
          city: values.address.city,
          state: values.address.state,
          deliveryCity: company?.settings.delivery_city,
          deliveryState: company?.settings.delivery_state,
        })
      ) {
        setError("address.city", {
          message: `Não entregamos em ${values.address.city}. Nossa entrega é só em ${company?.settings.delivery_city}.`,
        });
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
      className="space-y-6 pb-24 lg:pb-0 w-full min-w-0 max-w-full"
    >
      <CheckoutStepper currentStep={step} mesaExpress={mesaExpress} />

      <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 space-y-6">
      <MessageTicker
        messages={[
          mesaExpress
            ? `🪑 ${mesaLabel || "Mesa"} · confira e envie o pedido`
            : null,
          !mesaExpress && !authLoading && isAuthenticated && customer
            ? `👋 Olá, ${customer.first_name}! ${storefrontCopy.account.checkoutLoggedIn(customer.full_name)}`
            : null,
          !mesaExpress && !authLoading && !isAuthenticated
            ? {
                text: `${storefrontCopy.account.guestCheckout} ${storefrontCopy.account.checkoutLoginLink}`,
                to: "/entrar",
              }
            : null,
          !mesaExpress
            ? `✨ ${storefrontCopy.checkout.steps[step as 1 | 2 | 3 | 4]}`
            : null,
          mesaExpress || step === 4
            ? `🔒 ${storefrontCopy.checkout.confirmReassurance}`
            : null,
          `🛡️ ${storefrontCopy.checkout.secureNote}`,
        ].filter((m): m is NonNullable<typeof m> => m != null)}
      />

      {!mesaExpress && step === 1 ? (
        <Card className="border-[hsl(var(--border))] shadow-sm">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
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
              <Label htmlFor="customerPhone">Celular (WhatsApp)</Label>
              <Controller
                name="customerPhone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    id="customerPhone"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    aria-invalid={Boolean(errors.customerPhone)}
                  />
                )}
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

      {!mesaExpress && step === 2 ? (
        <Card className="border-[hsl(var(--border))] shadow-sm">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-brand" />
              Como prefere receber?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mesaLabel && deliveryType === "dine_in" ? (
              <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-soft/40 px-3 py-2 text-sm font-medium text-brand">
                <Armchair className="h-4 w-4 shrink-0" />
                {mesaLabel}
              </div>
            ) : null}
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
                    setValue("tableId", undefined);
                    setValue("qrToken", undefined);
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
                    setValue("tableId", undefined);
                    setValue("qrToken", undefined);
                    setValue("address", {
                      street: "",
                      number: "",
                      complement: "",
                      neighborhood: "",
                      city: company?.settings.delivery_city ?? "",
                      state: company?.settings.delivery_state ?? "",
                      cityId: company?.settings.delivery_city_id ?? null,
                      stateId: company?.settings.delivery_state_id ?? null,
                      zipCode: "",
                      reference: "",
                      fromGeo: false,
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
              {acceptsDineIn ? (
                <button
                  type="button"
                  className={cn(
                    "checkout-option sm:col-span-2",
                    deliveryType === "dine_in" && "checkout-option-selected",
                  )}
                  onClick={() => {
                    setValue("deliveryType", "dine_in");
                    setValue("address", undefined);
                    clearErrors("address");
                  }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Armchair className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold">Estou na loja</span>
                    <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
                      Pedido na mesa — o garçom leva até você
                    </span>
                  </span>
                </button>
              ) : null}
            </div>

            {acceptsDineIn && deliveryType === "dine_in" ? (
              <div className="space-y-2 rounded-xl border border-[hsl(var(--border))] p-3">
                <Label htmlFor="mesa-number">Qual é o número da sua mesa?</Label>
                <div className="flex gap-2">
                  <Input
                    id="mesa-number"
                    placeholder="Ex.: 12"
                    value={mesaNumberInput}
                    onChange={(e) => setMesaNumberInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={resolvingMesa}
                    onClick={applyMesaByNumber}
                  >
                    {resolvingMesa ? "…" : "Confirmar"}
                  </Button>
                </div>
              </div>
            ) : null}

            {deliveryType === "delivery" ? (
              <AddressFields
                value={
                  (formValues.address as AddressFieldsValue | undefined) ?? {
                    street: "",
                    number: "",
                    complement: "",
                    neighborhood: "",
                    city: company?.settings.delivery_city ?? "",
                    state: company?.settings.delivery_state ?? "",
                    cityId: company?.settings.delivery_city_id ?? null,
                    stateId: company?.settings.delivery_state_id ?? null,
                    zipCode: "",
                    reference: "",
                    fromGeo: false,
                  }
                }
                onChange={(next) => setValue("address", next, { shouldValidate: true })}
                errors={errors.address}
                deliveryCity={company?.settings.delivery_city}
                deliveryState={company?.settings.delivery_state}
                deliveryCityId={company?.settings.delivery_city_id}
                deliveryStateId={company?.settings.delivery_state_id}
                showLabel={false}
              />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!mesaExpress && step === 3 ? (
        <Card className="border-[hsl(var(--border))] shadow-sm">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
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

      {step === 4 || mesaExpress ? (
        <Card className="border-[hsl(var(--border))] shadow-sm">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
            <CardTitle>
              {mesaExpress ? "Confirmar pedido na mesa" : "Revisão do pedido"}
            </CardTitle>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {mesaExpress
                ? "Confira os itens e envie. O pagamento é no estabelecimento."
                : "Confira os itens. Pode tirar o que não quiser antes de confirmar."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {mesaExpress && mesaLabel ? (
              <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-soft/40 px-3 py-2.5 text-sm font-semibold text-brand">
                <Armchair className="h-4 w-4 shrink-0" />
                {mesaLabel}
              </div>
            ) : null}
            <ul className="space-y-2">
              {items.map((item) => {
                const composition = formatCompositionLabel(
                  item.productName,
                  (item.components ?? []).map((c) => c.productName),
                );
                return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug">
                      <span className="tabular-nums text-brand">{item.quantity}×</span>{" "}
                      {item.productName}
                    </p>
                    {composition ? <CompositionHighlight label={composition} /> : null}
                    {item.selectedOptions.length > 0 ? (
                      <ul className="mt-1 space-y-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                        {item.selectedOptions.map((option) => (
                          <li key={`${option.optionId}-${option.quantity}`}>
                            {option.optionGroupName}:{" "}
                            {option.quantity > 1 ? `${option.quantity}× ` : ""}
                            {option.name}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <PriceDisplay
                      value={item.unitPrice * item.quantity}
                      className="text-sm font-semibold tabular-nums"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[hsl(var(--muted-foreground))] hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remover ${item.productName}`}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
                );
              })}
            </ul>

            {mesaExpress ? (
              <div className="space-y-2">
                <Label htmlFor="notes-mesa">Observação (opcional)</Label>
                <Input id="notes-mesa" placeholder="Ex: sem cebola" {...register("notes")} />
              </div>
            ) : (
              <div className="rounded-xl bg-[hsl(var(--muted))]/50 p-4 text-sm">
                <p>
                  <strong>{formValues.customerName}</strong> — {formValues.customerPhone}
                </p>
                <p className="mt-0.5 text-[hsl(var(--muted-foreground))]">
                  {deliveryType === "delivery"
                    ? "Entrega"
                    : deliveryType === "dine_in"
                      ? mesaLabel || "Na mesa"
                      : "Retirada"}{" "}
                  · {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
        </div>

        <div className="min-w-0 space-y-4">
          <CheckoutOrderSummary
            className="lg:sticky lg:top-24"
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            deliveryType={deliveryType}
            freeDeliveryAbove={company?.settings.free_delivery_above}
            baseDeliveryFee={company?.settings.delivery_fee ?? 0}
            compact
          />
        </div>
      </div>

      <div className="checkout-sticky-actions lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="mx-auto flex w-full max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:justify-between lg:max-w-none">
        {!mesaExpress ? (
          <Button
            type="button"
            variant="outline"
            disabled={step === 1 || isPending}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="lg:flex-none"
          >
            Voltar
          </Button>
        ) : (
          <span className="hidden sm:block" />
        )}
        {mesaExpress || step >= CHECKOUT_STEPS ? (
          <Button type="button" disabled={isPending} onClick={handleConfirm} className="gap-2 lg:flex-none">
            {isPending ? "Enviando..." : mesaExpress ? "Enviar pedido 🎉" : "Confirmar pedido 🎉"}
          </Button>
        ) : (
          <Button type="button" onClick={goNext} className="lg:flex-none">
            Continuar
          </Button>
        )}
        </div>
      </div>
    </form>
  );
}
