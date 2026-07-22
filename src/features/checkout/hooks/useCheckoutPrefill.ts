import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { CompanyPublic } from "@/features/company/types/company.types";
import { customerAuthApi, useCustomerAuth } from "@/features/customer-auth";
import type { CustomerAddress } from "@/features/customer-auth";

import type { CheckoutFormValues } from "../schemas/checkout.schema";
import { formatPhoneMask } from "@/shared/lib/phone";

function mapAddressToForm(address: CustomerAddress): NonNullable<CheckoutFormValues["address"]> {
  const fromGeo = Boolean(address.latitude != null && address.longitude != null);
  return {
    street: address.street,
    number: address.number,
    complement: address.complement ?? "",
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zipCode: address.zip_code ?? "",
    reference: address.reference ?? "",
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    fromGeo,
  };
}

export function useCheckoutPrefill(company?: CompanyPublic | null) {
  const { customer, isAuthenticated, isLoading: authLoading } = useCustomerAuth();

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["customer", "addresses", "checkout"],
    queryFn: () => customerAuthApi.listAddresses(),
    enabled: isAuthenticated,
  });

  const prefillValues = useMemo((): Partial<CheckoutFormValues> | null => {
    if (!isAuthenticated || !customer) {
      return null;
    }

    const defaultAddress = addresses?.find((row) => row.is_default) ?? addresses?.[0];
    const acceptsDelivery = company?.settings.accepts_delivery !== false;

    const values: Partial<CheckoutFormValues> = {
      customerName: customer.full_name,
      customerPhone: formatPhoneMask(customer.phone),
      customerEmail: customer.email ?? "",
    };

    if (defaultAddress && acceptsDelivery) {
      values.deliveryType = "delivery";
      values.address = mapAddressToForm(defaultAddress);
    }

    return values;
  }, [isAuthenticated, customer, addresses, company?.settings.accepts_delivery]);

  const isPrefillReady = !authLoading && (!isAuthenticated || !addressesLoading);

  return {
    prefillValues,
    isPrefillReady,
    customer,
    isAuthenticated,
    authLoading,
  };
}
