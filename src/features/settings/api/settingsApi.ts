import { apiClient } from "@/shared/lib/api-client";

import type { SettingsData, UpdateSettingsPayload } from "../types/settings.types";

export const settingsApi = {
  get: () => apiClient.get<SettingsData>("/admin/settings/").then((response) => response.data),

  update: (payload: UpdateSettingsPayload) =>
    apiClient.patch<SettingsData>("/admin/settings/", payload).then((response) => response.data),

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return apiClient
      .post<{ logo_url: string }>("/admin/settings/logo/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  },

  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append("cover", file);
    return apiClient
      .post<{ cover_url: string }>("/admin/settings/cover/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  },
};
