export type DashboardPeriod = "today" | "7d" | "30d" | "custom";

export type DashboardSeriesMetric = "orders" | "revenue" | "average_ticket";

export type DashboardQuery = {
  period: DashboardPeriod;
  from?: string;
  to?: string;
};

export interface DashboardToday {
  date: string;
  total_orders: number;
  pending_orders: number;
  preparing_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  revenue: number;
  average_ticket: number;
}

export interface DashboardYesterday {
  date: string;
  total_orders: number;
  revenue: number;
}

export interface DashboardRecentOrder {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  total: number;
  created_at: string;
}

export interface DashboardKpi {
  value: number;
  previous: number;
  delta_pct: number | null;
}

export interface DashboardSeriesPoint {
  label: string;
  orders: number;
  revenue: number;
  average_ticket: number;
}

export interface DashboardHourSlot {
  slot: string;
  orders: number;
}

export interface DashboardWeekday {
  weekday: number;
  label: string;
  orders: number;
}

export interface DashboardPaymentMethod {
  method: string;
  label: string;
  orders: number;
}

export interface DashboardProductRank {
  product_id: string | null;
  name: string;
  quantity: number;
  revenue: number;
  orders: number;
}

export interface DashboardDeliveryMix {
  total: number;
  items: Array<{
    method: string;
    label: string;
    orders: number;
    pct: number;
  }>;
}

export interface DashboardCustomers {
  new: number;
  returning: number;
  total: number;
  new_pct: number;
  returning_pct: number;
}

export interface DashboardData {
  period: DashboardPeriod;
  compare_period: {
    label: string;
    start: string;
    end: string;
  };
  period_range: {
    start: string;
    end: string;
  };
  kpis: {
    orders: DashboardKpi;
    revenue: DashboardKpi;
    average_ticket: DashboardKpi;
    cancelled: DashboardKpi;
    cancellation_rate: DashboardKpi;
  };
  operational: {
    pending_orders: number;
    preparing_orders: number;
    completed_orders: number;
  };
  series: {
    granularity: "hour" | "day";
    metric_keys: DashboardSeriesMetric[];
    current: DashboardSeriesPoint[];
    previous: DashboardSeriesPoint[];
  };
  by_hour: {
    weekday: DashboardHourSlot[];
    weekend: DashboardHourSlot[];
    peak_slot: string;
    peak_orders: number;
  };
  by_weekday: {
    days: DashboardWeekday[];
    best_weekday: number;
    best_orders: number;
  };
  by_payment_method: DashboardPaymentMethod[];
  top_products: DashboardProductRank[];
  slow_products: DashboardProductRank[];
  by_delivery_type: DashboardDeliveryMix;
  customers: DashboardCustomers;
  recent_orders: DashboardRecentOrder[];
  today: DashboardToday;
  yesterday?: DashboardYesterday;
}
