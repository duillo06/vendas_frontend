import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { authApi } from "../api/authApi";
import { AuthContext, type AuthContextValue } from "../hooks/useAuth";
import type { Employee, Tenant } from "../types/auth.types";

import { authStorage } from "@/shared/lib/auth-storage";
import { queryClient } from "@/shared/lib/query-client";
import { resetTenantTheme } from "@/features/settings/utils/theme";

type AuthProviderProps = {
  children: ReactNode;
};

function clearSessionCache() {
  queryClient.clear();
  resetTenantTheme();
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Employee | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = authStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.me();
      setUser(data.user);
      setTenant(data.tenant);
    } catch {
      authStorage.clear();
      clearSessionCache();
      setUser(null);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (email: string, password: string, subdomain?: string) => {
    const data = await authApi.login({ email, password, subdomain });
    // login ok — joga fora cache da sessão anterior (evita misturar loja/usuário)
    clearSessionCache();
    authStorage.setSession(data.access, data.refresh, data.tenant.id);
    setUser(data.user);
    setTenant(data.tenant);
  }, []);

  const logout = useCallback(async () => {
    const refresh = authStorage.getRefreshToken();
    try {
      if (refresh) {
        await authApi.logout(refresh);
      }
    } catch {
      // sessão já expirou — limpa local mesmo assim
    } finally {
      authStorage.clear();
      clearSessionCache();
      setUser(null);
      setTenant(null);
      toast.success("Sessão encerrada");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tenant,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, tenant, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
