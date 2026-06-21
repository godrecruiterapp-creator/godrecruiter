export type ULID = string

export type Timestamp = string // ISO 8601 UTC

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type CustomFields = Record<string, JsonValue>

export type PaginationParams = {
  cursor?: string
  limit?: number
}

export type PaginatedResult<T> = {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string }
