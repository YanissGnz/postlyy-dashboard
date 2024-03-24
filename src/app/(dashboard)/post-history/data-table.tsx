"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Spinner } from "@/components/ui/Spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/table/DataTablePagination";
import { DataTableViewOptions } from "@/components/ui/table/DataTableViewOptions ";
import { usePagination } from "@/hooks/usePagination";
import { useGetPostHistoryQuery } from "@/redux/api/post/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { columns } from "./columns";

export function DataTable() {
  const pagination = usePagination();

  const currentAccount = useAppSelector((state) => state.auth.currentAccount);

  const { data, isLoading, isFetching } = useGetPostHistoryQuery(
    {
      accountId: currentAccount?.id ?? "",
      PageNumber: pagination.pageNumber,
      PageSize: pagination.pageSize,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !currentAccount,
    },
  );

  console.log("🚀 ~ DataTable ~ data:", data);
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center py-4">
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize() ?? "auto",
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching || isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-56">
                  <div className="flex items-center justify-center ">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination {...pagination} totalPages={data?.totalPages ?? 1} />
    </div>
  );
}
