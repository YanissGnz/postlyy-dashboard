import { createSeedData, type MockDB } from "./seed";

// Singleton in-memory database
let db: MockDB | null = null;

export function getDB(): MockDB {
  if (!db) {
    db = createSeedData();
  }
  return db;
}

export function resetDB(): void {
  db = createSeedData();
}

// Utility: generate a unique ID
let counter = Date.now();
export function generateId(): string {
  return `mock_${++counter}_${Math.random().toString(36).substring(2, 8)}`;
}

// Utility: simulate network latency (200-800ms)
export function simulateLatency(): Promise<void> {
  const ms = Math.floor(Math.random() * 600) + 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility: create a success response
export function successResponse<T>(data: T) {
  return {
    data,
    succeeded: true,
    errors: [] as string[],
    message: "Success",
  };
}

// Utility: create a paginated response
export function paginatedResponse<T>(
  data: T[],
  pageNumber = 1,
  pageSize = 10,
  totalRecords?: number,
) {
  const total = totalRecords ?? data.length;
  const totalPages = Math.ceil(total / pageSize);
  return {
    pageNumber,
    pageSize,
    totalPages,
    totalRecords: total,
    data,
    succeeded: true,
    errors: [] as string[],
    message: "Success",
  };
}

// Utility: create an error response
export function errorResponse(message: string, errors: string[] = [message]) {
  return {
    data: null,
    succeeded: false,
    errors,
    message,
  };
}

// Utility: find user by token (simple mock auth)
export function findUserByToken(authHeader?: string | null) {
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const db = getDB();
  return db.users.find((u) => u.accessToken === token) ?? null;
}

// Utility: find account by ID
export function findAccountById(accountId: string) {
  const db = getDB();
  return db.accounts.find((a) => a.id === accountId) ?? null;
}