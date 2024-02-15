"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./columns";
import { usePagination } from "@/hooks/usePagination";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/table/DataTableViewOptions ";
import { Spinner } from "@/components/ui/Spinner";
import { DataTablePagination } from "@/components/ui/table/DataTablePagination";
import { useGetDraftsQuery } from "@/redux/api/post/apiSlice";

export function DataTable() {
  const pagination = usePagination();
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching } = useGetDraftsQuery(
    {
      PageNumber: pagination.pageNumber,
      PageSize: pagination.pageSize,
      SearchTerm: search,
    },
    { refetchOnMountOrArgChange: true },
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
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
