import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { companyKeys } from "@/features/company/constants/query-keys";

import { settingsApi } from "../api/settingsApi";
import { settingsKeys } from "../constants/query-keys";

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => settingsApi.uploadLogo(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.detail() });
      void queryClient.invalidateQueries({ queryKey: companyKeys.public() });
      toast.success("Logo atualizada");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível enviar a logo");
    },
  });
}
