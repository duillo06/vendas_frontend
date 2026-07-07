import { apiClient } from "@/shared/lib/api-client";

import type { CompanyPublic } from "../types/company.types";

export const companyApi = {
  getPublic: () => apiClient.get<CompanyPublic>("/public/company/").then((r) => r.data),
};
