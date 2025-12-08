export interface PaginationMeta {
  current_page: number;
  from: number;
  to: number;
  total: number;
  last_page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  stats?: Record<string, unknown>;
}
