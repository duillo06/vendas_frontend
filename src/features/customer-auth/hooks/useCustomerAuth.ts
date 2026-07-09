import { createContext, useContext } from "react";

import type { Customer, CustomerTenant } from "../types/customer-auth.types";

export type CustomerAuthContextValue = {
  customer: Customer | null;
  tenant: CustomerTenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: {
    phone: string;
    password: string;
    first_name: string;
    last_name?: string;
    email?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

export const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function useCustomerAuth(): CustomerAuthContextValue {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth deve ser usado dentro de CustomerAuthProvider");
  }
  return context;
}
