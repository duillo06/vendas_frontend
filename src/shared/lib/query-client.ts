import { QueryClient } from "@tanstack/react-query";

// singleton — limpa no logout pra não misturar sessão antiga
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});
