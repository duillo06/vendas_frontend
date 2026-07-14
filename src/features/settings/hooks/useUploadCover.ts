import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { companyKeys } from "@/features/company/constants/query-keys";
import { adminCopy } from "@/shared/copy/admin";

import { settingsApi } from "../api/settingsApi";
import { settingsKeys } from "../constants/query-keys";

export function useUploadCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => settingsApi.uploadCover(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.detail() });
      void queryClient.invalidateQueries({ queryKey: companyKeys.public() });
      toast.success(adminCopy.settings.toasts.coverUploaded);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível enviar a capa");
    },
  });
}
