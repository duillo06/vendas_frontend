import type { OrderFilters } from "../types/order-admin.types";

export const orderAdminKeys = {
  all: ["orders-admin"] as const,
  lists: () => [...orderAdminKeys.all, "list"] as const,
  list: (filters?: OrderFilters) => [...orderAdminKeys.lists(), filters] as const,
  detail: (id: string) => [...orderAdminKeys.all, "detail", id] as const,
  active: () => [...orderAdminKeys.all, "active"] as const,
};
