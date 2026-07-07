import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { companyKeys } from "@/features/company/constants/query-keys";

import { settingsApi } from "../api/settingsApi";
import { settingsKeys } from "../constants/query-keys";
import type { UpdateSettingsPayload } from "../types/settings.types";

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => settingsApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.detail() });
      void queryClient.invalidateQueries({ queryKey: companyKeys.public() });
      toast.success("Configurações salvas");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível salvar as configurações");
    },
  });
}
