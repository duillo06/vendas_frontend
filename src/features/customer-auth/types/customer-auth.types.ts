export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  has_account: boolean;
};

export type CustomerTenant = {
  id: string;
  trade_name: string;
  slug: string;
  subdomain: string;
};

export type CustomerLoginPayload = {
  phone: string;
  password: string;
};

export type CustomerRegisterPayload = {
  phone: string;
  password: string;
  first_name: string;
  last_name?: string;
  email?: string;
};

export type CustomerAuthResponse = {
  access: string;
  refresh: string;
  customer: Customer;
  tenant: CustomerTenant;
};

export type CustomerMeResponse = {
  customer: Customer;
  tenant: CustomerTenant;
};

export type CustomerAddress = {
  id: string;
  label: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerAddressPayload = {
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code?: string;
  reference?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
};

export type CustomerAdminListItem = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  has_account: boolean;
  created_at: string;
};

export type CustomerAdminDetail = CustomerAdminListItem & {
  addresses: CustomerAddress[];
  recent_orders: Array<{
    id: string;
    order_number: string;
    status: string;
    total: number;
    created_at: string;
  }>;
};
