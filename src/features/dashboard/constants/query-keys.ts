import type { DashboardQuery } from "../types/dashboard.types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (query: DashboardQuery = { period: "today" }) =>
    [...dashboardKeys.all, "summary", query.period, query.from ?? "", query.to ?? ""] as const,
};
