import { env } from "@/shared/config/env";

const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "app"]);

function storefrontBaseDomain(): string {
  return (env.VITE_STOREFRONT_BASE_DOMAIN || "").replace(/^\./, "").toLowerCase();
}

/** subdomínio do tenant a partir do hostname do browser */
export function getTenantSubdomain(): string {
  if (typeof window === "undefined") {
    return env.VITE_DEFAULT_TENANT_SUBDOMAIN;
  }

  const { hostname } = window.location;
  const base = storefrontBaseDomain();

  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.replace(".localhost", "");
    if (subdomain && !RESERVED_SUBDOMAINS.has(subdomain)) {
      return subdomain;
    }
  }

  // produção: demo.pediu.cloud → demo
  if (base && hostname.endsWith(`.${base}`)) {
    const subdomain = hostname.slice(0, -(base.length + 1));
    if (subdomain && !RESERVED_SUBDOMAINS.has(subdomain) && !subdomain.includes(".")) {
      return subdomain;
    }
  }

  // legado foodservice.app (builds antigos)
  if (hostname.endsWith(".foodservice.app")) {
    const subdomain = hostname.replace(".foodservice.app", "");
    if (subdomain && !RESERVED_SUBDOMAINS.has(subdomain)) {
      return subdomain;
    }
  }

  return env.VITE_DEFAULT_TENANT_SUBDOMAIN;
}

/** Base relativa (/api/v1) = mesma origem; evita CORS no storefront. */
function isRelativeApiBase(url: string): boolean {
  return url.startsWith("/");
}

/** base URL da API no storefront — tenant via Host */
export function resolveStorefrontApiBaseUrl(): string {
  const configured = env.VITE_API_BASE_URL;

  // Proxy Nginx/Vite: browser fala com a mesma origem
  if (isRelativeApiBase(configured)) {
    return configured;
  }

  if (typeof window === "undefined") {
    return configured;
  }

  const { hostname, protocol } = window.location;
  const apiPort = env.VITE_API_PORT;
  const base = storefrontBaseDomain();

  if (hostname.endsWith(".localhost")) {
    return `http://${hostname}:${apiPort}/api/v1`;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://${env.VITE_DEFAULT_TENANT_SUBDOMAIN}.localhost:${apiPort}/api/v1`;
  }

  // tenant em produção → mesma origem (/api no Nginx)
  if (base && hostname.endsWith(`.${base}`)) {
    return "/api/v1";
  }

  if (hostname.endsWith(".foodservice.app")) {
    return `${protocol}//${hostname}/api/v1`;
  }

  return configured;
}
