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

export interface DashboardData {
  today: DashboardToday;
  yesterday?: DashboardYesterday;
  recent_orders: DashboardRecentOrder[];
}
