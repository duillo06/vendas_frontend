import { env } from "@/shared/config/env";

const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "app"]);

/** subdomínio do tenant a partir do hostname do browser */
export function getTenantSubdomain(): string {
  if (typeof window === "undefined") {
    return env.VITE_DEFAULT_TENANT_SUBDOMAIN;
  }

  const { hostname } = window.location;

  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.replace(".localhost", "");
    if (subdomain && !RESERVED_SUBDOMAINS.has(subdomain)) {
      return subdomain;
    }
  }

  if (hostname.endsWith(".foodservice.app")) {
    const subdomain = hostname.replace(".foodservice.app", "");
    if (subdomain && !RESERVED_SUBDOMAINS.has(subdomain)) {
      return subdomain;
    }
  }

  return env.VITE_DEFAULT_TENANT_SUBDOMAIN;
}

/** Base relativa (/api/v1) = mesma origem do Vite; evita localhost:8001 no browser (LAN). */
function isRelativeApiBase(url: string): boolean {
  return url.startsWith("/");
}

/** base URL da API no storefront — tenant via Host ou X-Tenant-Subdomain */
export function resolveStorefrontApiBaseUrl(): string {
  const configured = env.VITE_API_BASE_URL;

  // Proxy do Vite: browser fala com :5174, não com :8001
  if (isRelativeApiBase(configured)) {
    return configured;
  }

  if (typeof window === "undefined") {
    return configured;
  }

  const { hostname, protocol } = window.location;
  const apiPort = env.VITE_API_PORT;

  if (hostname.endsWith(".localhost")) {
    return `http://${hostname}:${apiPort}/api/v1`;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://${env.VITE_DEFAULT_TENANT_SUBDOMAIN}.localhost:${apiPort}/api/v1`;
  }

  if (hostname.endsWith(".foodservice.app")) {
    const subdomain = hostname.replace(".foodservice.app", "");
    return `${protocol}//api.foodservice.app/api/v1`.replace(
      "//api.",
      subdomain ? `//${subdomain}.` : "//api.",
    );
  }

  return configured;
}
