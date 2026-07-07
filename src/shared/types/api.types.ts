export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorBody {
  detail?: string;
  code?: string;
  fields?: Record<string, string[]>;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  ordering?: string;
}
