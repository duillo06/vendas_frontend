import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { preferencesApi } from "../api/preferencesApi";
import {
  DEFAULT_DASHBOARD_PREFERENCES,
  normalizeDashboardPreferences,
  type DashboardPreferences,
  type DashboardWidgetId,
  type EmployeePreferences,
} from "../constants/widgets";

export const preferencesKeys = {
  all: ["employee-preferences"] as const,
  me: () => [...preferencesKeys.all, "me"] as const,
};

export function useDashboardPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: preferencesKeys.me(),
    queryFn: async () => {
      const data = await preferencesApi.get();
      return {
        dashboard: normalizeDashboardPreferences(data.dashboard),
      } satisfies EmployeePreferences;
    },
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: (dashboard: DashboardPreferences) =>
      preferencesApi.patch({ dashboard }),
    onMutate: async (dashboard) => {
      await queryClient.cancelQueries({ queryKey: preferencesKeys.me() });
      const previous = queryClient.getQueryData<EmployeePreferences>(preferencesKeys.me());
      queryClient.setQueryData<EmployeePreferences>(preferencesKeys.me(), {
        dashboard: normalizeDashboardPreferences(dashboard),
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(preferencesKeys.me(), ctx.previous);
      }
      toast.error("Não deu pra salvar o layout. Tenta de novo.");
    },
    onSuccess: (data) => {
      queryClient.setQueryData<EmployeePreferences>(preferencesKeys.me(), {
        dashboard: normalizeDashboardPreferences(data.dashboard),
      });
    },
  });

  const prefs = query.data?.dashboard ?? DEFAULT_DASHBOARD_PREFERENCES;

  function saveOrder(order: DashboardWidgetId[]) {
    mutation.mutate({
      widget_order: order,
      hidden_widgets: prefs.hidden_widgets,
    });
  }

  function toggleHidden(id: DashboardWidgetId) {
    const hidden = prefs.hidden_widgets.includes(id)
      ? prefs.hidden_widgets.filter((x) => x !== id)
      : [...prefs.hidden_widgets, id];
    if (hidden.length >= prefs.widget_order.length) {
      toast.message("Deixe pelo menos um gráfico visível.");
      return;
    }
    mutation.mutate({
      widget_order: prefs.widget_order,
      hidden_widgets: hidden,
    });
  }

  function reset() {
    mutation.mutate(DEFAULT_DASHBOARD_PREFERENCES, {
      onSuccess: () => toast.success("Layout padrão restaurado"),
    });
  }

  return {
    prefs,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    saveOrder,
    toggleHidden,
    reset,
  };
}
