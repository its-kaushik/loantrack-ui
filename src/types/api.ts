export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code:
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'RATE_LIMIT_EXCEEDED'
    | 'INTERNAL_ERROR';
  message: string;
  details: ApiValidationDetail[];
  status: number;
}

export interface ApiValidationDetail {
  field: string;
  message: string;
  source: string;
}
