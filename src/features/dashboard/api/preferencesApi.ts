import { apiClient } from "@/shared/lib/api-client";

import type { EmployeePreferences } from "../constants/widgets";

export const preferencesApi = {
  get: () => apiClient.get<EmployeePreferences>("/auth/me/preferences/").then((r) => r.data),
  patch: (body: Partial<EmployeePreferences>) =>
    apiClient.patch<EmployeePreferences>("/auth/me/preferences/", body).then((r) => r.data),
};
