import type { DashboardData } from "@/features/dashboard/types/dashboard.types";

export const DASHBOARD_WIDGET_IDS = [
  "top_products",
  "hours",
  "days",
  "payments",
  "slow_products",
  "delivery",
  "customers",
] as const;

export type DashboardWidgetId = (typeof DASHBOARD_WIDGET_IDS)[number];

export type DashboardPreferences = {
  widget_order: DashboardWidgetId[];
  hidden_widgets: DashboardWidgetId[];
};

export type EmployeePreferences = {
  dashboard: DashboardPreferences;
};

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  widget_order: [...DASHBOARD_WIDGET_IDS],
  hidden_widgets: [],
};

export function normalizeDashboardPreferences(
  raw?: Partial<DashboardPreferences> | null,
): DashboardPreferences {
  const orderRaw = Array.isArray(raw?.widget_order) ? raw.widget_order : [];
  const seen = new Set<string>();
  const order: DashboardWidgetId[] = [];
  for (const id of orderRaw) {
    if ((DASHBOARD_WIDGET_IDS as readonly string[]).includes(id) && !seen.has(id)) {
      seen.add(id);
      order.push(id as DashboardWidgetId);
    }
  }
  for (const id of DASHBOARD_WIDGET_IDS) {
    if (!seen.has(id)) order.push(id);
  }

  const hiddenRaw = Array.isArray(raw?.hidden_widgets) ? raw.hidden_widgets : [];
  const hidden: DashboardWidgetId[] = [];
  for (const id of hiddenRaw) {
    if (
      (DASHBOARD_WIDGET_IDS as readonly string[]).includes(id) &&
      !hidden.includes(id as DashboardWidgetId) &&
      hidden.length < order.length - 1
    ) {
      hidden.push(id as DashboardWidgetId);
    }
  }

  return { widget_order: order, hidden_widgets: hidden };
}

export type WidgetRenderCtx = {
  data: DashboardData;
};

export const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  hours: "Horários",
  days: "Dias da semana",
  payments: "Pagamentos",
  top_products: "Mais vendidos",
  slow_products: "Quase não vende",
  delivery: "Entrega × retirada",
  customers: "Clientes",
};
