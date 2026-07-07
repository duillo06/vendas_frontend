import { apiClient } from "@/shared/lib/api-client";

import type { LoginPayload, LoginResponse, MeResponse } from "../types/auth.types";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>("/auth/login/", payload).then((r) => r.data),

  me: () => apiClient.get<MeResponse>("/auth/me/").then((r) => r.data),

  logout: (refresh: string) => apiClient.post("/auth/logout/", { refresh }),
};
