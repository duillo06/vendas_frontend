import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { customerAuthApi } from "../api/customerAuthApi";
import { CustomerAuthContext, type CustomerAuthContextValue } from "../hooks/useCustomerAuth";
import type { Customer, CustomerTenant } from "../types/customer-auth.types";

import { authStorage } from "@/shared/lib/auth-storage";

type CustomerAuthProviderProps = {
  children: ReactNode;
};

export function CustomerAuthProvider({ children }: CustomerAuthProviderProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tenant, setTenant] = useState<CustomerTenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = authStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await customerAuthApi.me();
      setCustomer(data.customer);
      setTenant(data.tenant);
    } catch {
      authStorage.clear();
      setCustomer(null);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const persistSession = useCallback((access: string, refresh: string, tenantId: string, nextCustomer: Customer, nextTenant: CustomerTenant) => {
    authStorage.setSession(access, refresh, tenantId);
    setCustomer(nextCustomer);
    setTenant(nextTenant);
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const data = await customerAuthApi.login({ phone, password });
    persistSession(data.access, data.refresh, data.tenant.id, data.customer, data.tenant);
  }, [persistSession]);

  const register = useCallback(
    async (payload: {
      phone: string;
      password: string;
      first_name: string;
      last_name?: string;
      email?: string;
    }) => {
      const data = await customerAuthApi.register(payload);
      persistSession(data.access, data.refresh, data.tenant.id, data.customer, data.tenant);
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    const refresh = authStorage.getRefreshToken();
    try {
      if (refresh) {
        await customerAuthApi.logout(refresh);
      }
    } catch {
      // sessão já expirou
    } finally {
      authStorage.clear();
      setCustomer(null);
      setTenant(null);
      toast.success("Você saiu da conta");
    }
  }, []);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer,
      tenant,
      isAuthenticated: Boolean(customer),
      isLoading,
      login,
      register,
      logout,
    }),
    [customer, tenant, isLoading, login, register, logout],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}
