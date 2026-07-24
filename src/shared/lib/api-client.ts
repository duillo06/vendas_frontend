import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { env, IS_BACKOFFICE } from "@/shared/config/env";
import { authStorage } from "@/shared/lib/auth-storage";
import { getTenantSubdomain, resolveStorefrontApiBaseUrl } from "@/shared/lib/tenant-api";
import type { ApiErrorBody } from "@/shared/types/api.types";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null): void {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

const FIELD_LABELS: Record<string, string> = {
  address: "Endereço",
  latitude: "Localização",
  longitude: "Localização",
  customer_name: "Nome",
  customer_phone: "Celular",
  customer_email: "E-mail",
  delivery_type: "Tipo de entrega",
  payment_method: "Pagamento",
  change_for: "Troco",
  items: "Itens",
  street: "Rua",
  number: "Número",
  neighborhood: "Bairro",
  city: "Cidade",
  state: "Estado",
  zip_code: "CEP",
  phone: "Celular",
  password: "Senha",
  email: "E-mail",
  first_name: "Nome",
  non_field_errors: "",
  detail: "",
};

function labelFor(path: string): string {
  const parts = path.split(".").filter((part) => part && !/^\d+$/.test(part));
  const key = parts[parts.length - 1] ?? "";
  if (!key) return "";
  return FIELD_LABELS[key] ?? key.replaceAll("_", " ");
}

function flattenDetails(detail: unknown, prefix = ""): string[] {
  if (detail == null) return [];

  if (typeof detail === "string") {
    const label = labelFor(prefix);
    return [label ? `${label}: ${detail}` : detail];
  }

  if (Array.isArray(detail)) {
    return detail.flatMap((item, index) => {
      if (typeof item === "string" || typeof item === "number") {
        const label = labelFor(prefix);
        const text = String(item);
        return [label ? `${label}: ${text}` : text];
      }
      return flattenDetails(item, prefix ? `${prefix}.${index}` : String(index));
    });
  }

  if (typeof detail === "object") {
    return Object.entries(detail as Record<string, unknown>).flatMap(([key, value]) =>
      flattenDetails(value, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [String(detail)];
}

function looksLikeRawDict(message: string): boolean {
  const trimmed = message.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.includes("ErrorDetail");
}

export function normalizeApiError(error: unknown): Error {
  // react-query passa Error genérico; interceptor já pode ter normalizado
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    if (error instanceof Error) return error;
    return new Error("Erro inesperado");
  }

  if (!error.response) {
    return new Error("Erro de conexão. Verifique sua internet.");
  }

  const data = error.response.data;
  const details = data?.error?.details ?? data?.fields;
  const fromDetails = [...new Set(flattenDetails(details).map((item) => item.trim()).filter(Boolean))];

  let message =
    (typeof data?.error?.message === "string" && data.error.message.trim()) ||
    (typeof data?.detail === "string" && data.detail.trim()) ||
    error.message ||
    "Erro inesperado";

  // dict cru do DRF → usa lista legível
  if (fromDetails.length > 0 && looksLikeRawDict(message)) {
    message = fromDetails.join(" · ");
  }

  return new Error(message);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = authStorage.getRefreshToken();
  if (!refresh) return null;

  const refreshPath = IS_BACKOFFICE ? "/auth/refresh/" : "/auth/customer/refresh/";

  try {
    const { data } = await axios.post<{ access: string }>(
      `${IS_BACKOFFICE ? env.VITE_API_BASE_URL : resolveStorefrontApiBaseUrl()}${refreshPath}`,
      { refresh },
      { headers: { "Content-Type": "application/json" } },
    );
    authStorage.setAccessToken(data.access);
    return data.access;
  } catch {
    return null;
  }
}

function redirectToLogin(): void {
  authStorage.clear();
  if (IS_BACKOFFICE && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  } else if (!IS_BACKOFFICE && !window.location.pathname.startsWith("/entrar")) {
    window.location.href = "/entrar";
  }
}

export const apiClient = axios.create({
  baseURL: IS_BACKOFFICE ? env.VITE_API_BASE_URL : resolveStorefrontApiBaseUrl(),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

/** storefront: recalcula base URL se o host mudar (ex. demo.localhost) */
export function configureStorefrontApiClient(): void {
  apiClient.defaults.baseURL = resolveStorefrontApiBaseUrl();
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const tenantId = authStorage.getTenantId();
  if (tenantId && IS_BACKOFFICE) {
    config.headers["X-Tenant-ID"] = tenantId;
  }

  // Storefront: proxy reescreve Host → Django pega tenant pelo header
  if (!IS_BACKOFFICE) {
    config.headers["X-Tenant-Subdomain"] = getTenantSubdomain();
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/customer/login") &&
      !originalRequest.url?.includes("/auth/customer/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token: string | null) => {
            if (!token) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        processQueue(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      processQueue(null);
      redirectToLogin();
    }

    return Promise.reject(normalizeApiError(error));
  },
);
