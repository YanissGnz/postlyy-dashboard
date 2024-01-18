export type TPaginatedResponse<T> = {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  data: Array<T>;
  succeeded: boolean;
  errors: Array<string>;
  message: string;
};
