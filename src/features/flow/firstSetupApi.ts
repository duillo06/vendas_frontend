import { apiClient } from "@/shared/lib/api-client";

import type { CompanySetupState } from "@/features/settings/types/settings.types";

export type SetupSegment = {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
};

export type SetupPayload = {
  setup: CompanySetupState;
  segments: SetupSegment[];
};

export type SetupApplyResult = {
  setup: CompanySetupState;
  segment: string;
  categories: { id: string; name: string; emoji: string }[];
};

export const firstSetupApi = {
  get: () => apiClient.get<SetupPayload>("/admin/setup/").then((r) => r.data),

  apply: (segment: string) =>
    apiClient
      .post<SetupApplyResult>("/admin/setup/apply/", { segment })
      .then((r) => r.data),

  dismiss: () =>
    apiClient.post<{ setup: CompanySetupState }>("/admin/setup/dismiss/").then((r) => r.data),
};
