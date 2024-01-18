export type TDataTablePaginationProps = {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  setPageNumber: (pageNumber: number) => void;
  setPageSize: (pageSize: number) => void;
};
