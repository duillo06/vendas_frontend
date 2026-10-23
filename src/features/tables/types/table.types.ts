export interface DiningTable {
  id: string;
  number: string;
  label: string;
  capacity: number | null;
  is_active: boolean;
  qr_token: string;
  qr_url: string;
  sort_order: number;
  created_at: string;
}

export interface DiningTableWrite {
  number: string;
  label?: string;
  capacity?: number | null;
  is_active?: boolean;
}

export interface PublicTableContext {
  table_id: string;
  table_number: string;
  label: string;
  is_active: boolean;
}

export type MesaSession = {
  tableId: string;
  tableNumber: string;
  qrToken: string;
};
