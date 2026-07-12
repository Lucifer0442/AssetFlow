export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function getPaginationOptions(pageQuery: any, limitQuery: any): PaginationParams {
  const page = Math.max(1, parseInt(pageQuery, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(limitQuery, 10) || 10)); // max limit 100
  return { page, limit };
}

export function getSkipAndTake(params: PaginationParams) {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  };
}

export function formatPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  params: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalItems / params.limit);
  return {
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      totalItems,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    },
  };
}
