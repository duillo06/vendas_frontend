export type DeliveryType = "delivery" | "pickup";
export type PaymentMethod = "cash" | "pix" | "card_on_delivery";

export interface CheckoutAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string;
}

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  notes?: string;
  changeFor?: number;
  address?: CheckoutAddress;
}

export interface CheckoutItemPayload {
  product_id: string;
  quantity: number;
  notes?: string;
  options: Array<{ option_id: string; quantity?: number }>;
}

export interface CheckoutPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_id?: string;
  delivery_type: DeliveryType;
  payment_method: PaymentMethod;
  notes?: string;
  change_for?: number;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    reference?: string;
  };
  items: CheckoutItemPayload[];
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface OrderItemOption {
  option_group_name: string;
  option_name: string;
  price_modifier: number;
  quantity?: number;
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
  options: OrderItemOption[];
}

export interface OrderPayment {
  method: string;
  status: string;
  amount: number;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  currency: string;
  payment: OrderPayment;
  items: OrderItem[];
  status_history: OrderStatusHistoryEntry[];
  estimated_prep_at: string | null;
  estimated_delivery_at: string | null;
  created_at: string;
}
