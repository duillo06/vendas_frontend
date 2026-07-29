import { apiClient } from "@/shared/lib/api-client";

export type BrazilianState = {
  id: number;
  name: string;
  acronym: string;
};

export type BrazilianCity = {
  id: number;
  name: string;
  state_id: number;
  state: string;
};

export const locationsApi = {
  listStates: () =>
    apiClient
      .get<BrazilianState[]>("/public/locations/states/")
      .then((response) => response.data),

  listCities: (stateId: number) =>
    apiClient
      .get<BrazilianCity[]>("/public/locations/cities/", {
        params: { state_id: stateId },
      })
      .then((response) => response.data),
};
