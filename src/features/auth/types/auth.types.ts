export interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_owner: boolean;
  permissions: string[];
}

export interface Tenant {
  id: string;
  trade_name: string;
  slug: string;
  subdomain: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  subdomain?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: Employee;
  tenant: Tenant;
}

export interface MeResponse {
  user: Employee;
  tenant: Tenant;
}

export interface RefreshResponse {
  access: string;
}
