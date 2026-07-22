import { apiClient } from "@/shared/lib/api-client";

import type {
  MessageTemplateDetail,
  QrResponse,
  SituationRow,
  WhatsAppConnectOptions,
  WhatsAppConnection,
  WhatsAppStats,
} from "../types/conexoes.types";

export const conexoesApi = {
  getWhatsApp: () =>
    apiClient.get<WhatsAppConnection>("/admin/communications/whatsapp/").then((r) => r.data),

  getOptions: () =>
    apiClient
      .get<WhatsAppConnectOptions>("/admin/communications/whatsapp/options/")
      .then((r) => r.data),

  connect: (payload: {
    mode: "hosted" | "byo";
    base_url?: string;
    api_key?: string;
    provider_key?: string;
  }) =>
    apiClient
      .post<WhatsAppConnection>("/admin/communications/whatsapp/connect/", payload)
      .then((r) => r.data),

  getQr: () =>
    apiClient.get<QrResponse>("/admin/communications/whatsapp/qr/").then((r) => r.data),

  health: () =>
    apiClient.post<{
      ok: boolean;
      steps: { key: string; label: string; ok: boolean; message: string }[];
      checked_at: string;
      connection: WhatsAppConnection;
    }>("/admin/communications/whatsapp/health/").then((r) => r.data),

  disconnect: () =>
    apiClient
      .post<WhatsAppConnection>("/admin/communications/whatsapp/disconnect/")
      .then((r) => r.data),

  sendConnectionTest: (message?: string) =>
    apiClient
      .post<{ ok: boolean; status: string; message: string }>(
        "/admin/communications/whatsapp/test/",
        message ? { message } : {},
      )
      .then((r) => r.data),

  stats: () =>
    apiClient.get<WhatsAppStats>("/admin/communications/whatsapp/stats/").then((r) => r.data),

  listSituations: () =>
    apiClient.get<SituationRow[]>("/admin/communications/situations/").then((r) => r.data),

  bulkSituations: (situations: Record<string, boolean>) =>
    apiClient
      .post<SituationRow[]>("/admin/communications/situations/bulk/", { situations })
      .then((r) => r.data),

  getTemplate: (eventKey: string) =>
    apiClient
      .get<MessageTemplateDetail>(`/admin/communications/templates/${eventKey}/`)
      .then((r) => r.data),

  saveTemplate: (eventKey: string, body: string) =>
    apiClient
      .put<MessageTemplateDetail>(`/admin/communications/templates/${eventKey}/`, { body })
      .then((r) => r.data),

  previewTemplate: (eventKey: string, body?: string) =>
    apiClient
      .post<{ preview: string }>(`/admin/communications/templates/${eventKey}/preview/`, {
        body,
      })
      .then((r) => r.data),

  testTemplate: (eventKey: string, body?: string) =>
    apiClient
      .post<{ ok: boolean; status: string }>(
        `/admin/communications/templates/${eventKey}/test/`,
        body ? { body } : {},
      )
      .then((r) => r.data),
};
