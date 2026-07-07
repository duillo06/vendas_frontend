import type { OrderStatus } from "@/features/checkout/types/checkout.types";

export interface OrderFilters {
  status?: string;
  delivery_type?: string;
  search?: string;
  active?: boolean;
  page?: number;
}

export interface OrderListItem {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  delivery_type: string;
  total: number;
  items_count: number;
  created_at: string;
}

export interface OrderAdminDetail {
  id: string;
  order_number: string;
  status: OrderStatus;
  delivery_type: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  currency: string;
  notes: string;
  internal_notes: string;
  delivery_address: Record<string, string> | null;
  payment: {
    method: string;
    status: string;
    amount: number;
    change_for: number | null;
    paid_at: string | null;
  } | null;
  items: Array<{
    id: string;
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string;
    options: Array<{
      option_group_name: string;
      option_name: string;
      price_modifier: number;
    }>;
  }>;
  status_history: Array<{
    from_status: string | null;
    to_status: string;
    changed_by: string | null;
    notes: string | null;
    created_at: string;
  }>;
  confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const ORDER_NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Confirmar",
  confirmed: "Em preparo",
  preparing: "Pronto",
  ready: "Concluir",
  out_for_delivery: "Concluir",
  completed: "Concluído",
  cancelled: "Cancelar",
};
