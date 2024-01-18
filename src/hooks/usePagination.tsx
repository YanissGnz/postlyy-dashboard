import { useState } from "react";

export function usePagination() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return {
    pageNumber,
    pageSize,
    setPageNumber,
    setPageSize,
  };
}
