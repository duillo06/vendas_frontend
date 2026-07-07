export const env = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8001/api/v1",
  VITE_API_PORT: import.meta.env.VITE_API_PORT ?? "8001",
  VITE_DEFAULT_TENANT_SUBDOMAIN: import.meta.env.VITE_DEFAULT_TENANT_SUBDOMAIN ?? "demo",
  VITE_APP_TARGET: import.meta.env.VITE_APP_TARGET ?? "storefront",
} as const;

export const IS_BACKOFFICE = env.VITE_APP_TARGET === "backoffice";
