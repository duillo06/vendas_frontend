import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { ConfirmProvider } from "@/shared/hooks/useConfirm";
import { queryClient } from "@/shared/lib/query-client";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        {children}
        <Toaster richColors position="top-center" />
      </ConfirmProvider>
    </QueryClientProvider>
  );
}
