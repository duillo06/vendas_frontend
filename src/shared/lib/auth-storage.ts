const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const TENANT_ID_KEY = "tenant_id";

export const authStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getTenantId(): string | null {
    return localStorage.getItem(TENANT_ID_KEY);
  },

  setSession(access: string, refresh: string, tenantId: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(TENANT_ID_KEY, tenantId);
  },

  setAccessToken(access: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TENANT_ID_KEY);
  },
};
