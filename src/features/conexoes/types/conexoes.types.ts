export type ConnectionStatus =
  | "none"
  | "pending"
  | "awaiting_qr"
  | "connected"
  | "disconnected"
  | "error";

export type WhatsAppConnection = {
  id?: string;
  connected: boolean;
  status: ConnectionStatus | string;
  phone_display: string;
  phone_e164?: string;
  provider_key: string;
  connection_mode?: "hosted" | "byo" | null;
  last_health_at?: string | null;
  last_health?: {
    steps?: HealthStep[];
    ok?: boolean;
  } | null;
  last_error_code?: string;
  last_error_message?: string;
};

export type WhatsAppConnectOptions = {
  hosted_available: boolean;
  modes: {
    id: "hosted" | "byo";
    title: string;
    description: string;
    available: boolean;
  }[];
};

export type HealthStep = {
  key: string;
  label: string;
  ok: boolean;
  message: string;
};

export type SituationRow = {
  event_key: string;
  title: string;
  description: string;
  is_enabled: boolean;
  variables: string[];
  body_preview: string;
};

export type MessageTemplateDetail = {
  event_key: string;
  title: string;
  description?: string;
  variables: string[];
  body: string;
};

export type WhatsAppStats = {
  today: {
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
    avg_latency_ms: number;
    last_sent_at: string | null;
  };
};

export type QrResponse = {
  status: string;
  qr_base64?: string | null;
  pairing_code?: string | null;
  phone_display?: string;
  connection?: WhatsAppConnection;
};
