'use client';
import React, { useState } from "react";
import {
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    flexRender,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnDef,
    Table as TanStackTable,
    Row as TanStackRow,
    Cell as TanStackCell,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/table/core";
import {  SearchIcon } from "lucide-react";

// Generic interface for your data items
interface DataTableProps<T extends object> {
    data: T[];
    columns: (ColumnDef<T> & { accessor?: string })[]; 
    loading?: boolean;
    total?: number;
    element?: React.ReactNode;
    searchType?:number;
}

export function DataTable<T extends object>({
    data,
    columns,
    element,
    searchType=0
}: DataTableProps<T>) {
    // State management
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({}); // Using string keys for row IDs

    // Table instance setup
    const table = useReactTable<T>({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(), // Use default pageSize
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        // Initial state for pagination (optional)
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize: 9,
            },
        },
    });

    return (
        <div className="w-full  border border-border rounded-lg bg-background">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-300/15 p-2 lowercase md:py-4">
               
                                <div className="relative flex w-full max-w-xs items-start justify-center">
                                    <SearchIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 transform text-slate-400 dark:text-slate-50" />
                                    <Input
                                        placeholder="البحث ..."
                                        value={
                                            (table.getColumn(columns[1]?.accessorKey)?.getFilterValue() as string)
                                             ?? ""}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                            table.getColumn(columns[1]?.accessorKey)?.setFilterValue(event.target.value)
                                        }
                                        className="w-full border-slate-400/35 bg-white"
                                    />
                                </div>

                                                <div className="flex items-center flex-wrap justify-between gap-4">
                                                    {element}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger className="rounded-md" asChild>
                                                            <Button variant={"outline"} className="flex items-center justify-center gap-2  border-slate-400/35 px-2 text-slate-600">
                                                                <FilterIcon />
                                                                تصفية الأعمدة
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {table
                                                                .getAllColumns()
                                                                .filter((column:any) => column.getCanHide())
                                                                .map((column: any) => (
                                                                    <DropdownMenuCheckboxItem
                                                                        key={column.id}
                                                                        className="capitalize text-slate-500"
                                                                        checked={column.getIsVisible()}
                                                                        onCheckedChange={(value: boolean) => column.setVisibility(value)}
                                                                    >
                                                                        {column.id}
                                                                    </DropdownMenuCheckboxItem>
                                                                ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            {/* Table */}
            <div className="border-t">
                <Table className="min-h-48 rounded-lg">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header: any) => (
                                    <TableHead
                                        className={`truncate bg-slate-300/15 text-sm font-semibold capitalize text-slate-900 dark:text-slate-50 ${
                                            header.column.id === "id" ? "hidden" : ""
                                        }`}
                                        key={header.id}
                                    >
                                        <div className="flex gap-2 text-slate-500 dark:text-slate-50">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row: TanStackRow<T>) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell: TanStackCell<T, any>) => (
                                        <TableCell className={`h-10 capitalize ${cell.column.id === "id" ? "hidden" : ""}`} key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            // No Data Placeholder
                            <TableRow className="absolute flex w-full touch-none items-center justify-center gap-2 p-5 text-slate-400 hover:bg-transparent">
                                <span>لا توجد بيانات</span>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 p-2 py-4">
                {/* Pagination Information */}
                <div className="flex-1 text-xs text-muted-foreground lg:text-sm">
                    عرض {table.getFilteredSelectedRowModel().rows.length + 1} إلى {table.getFilteredSelectedRowModel().rows.length + 5} صفحة
                </div>
                <Pagination table={table} />
            </div>
        </div>
    );
}

const Pagination = ({ table }: { table: TanStackTable<any> }) => {
    const pageCount = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex

    const getVisiblePages = () => {
        const pages = []
        if (pageCount <= 4) {
            for (let i = 0; i < pageCount; i++) {
                pages.push(i)
            }
        } else {
            pages.push(0)
            if (currentPage < 3) {
                for (let i = 1; i < 3; i++) {
                    pages.push(i)
                }
                pages.push("right-ellipsis")
                pages.push(pageCount - 1)
            } else if (currentPage >= 3 && currentPage < pageCount - 3) {
                pages.push("left-ellipsis")
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push("right-ellipsis")
                pages.push(pageCount - 1)
            } else {
                pages.push("left-ellipsis")
                for (let i = pageCount - 3; i < pageCount - 1; i++) {
                    pages.push(i)
                }
                pages.push(pageCount - 1)
            }
        }
        return pages
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="size-8 border-slate-600/35 p-1 font-semibold text-slate-500"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
               <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            </Button>
            {getVisiblePages().map((page, index) =>
                typeof page === "string" ? (
                    <span
                        key={index}
                        className="size-8 border-slate-600/35 font-semibold text-slate-500"
                    >
                        ...
                    </span>
                ) : (
                    <Button
                        key={page}
                        variant={page === currentPage ? "ghost" : "outline"}
                        size="sm"
                        className="size-8 border-slate-600/35 font-semibold text-slate-500"
                        onClick={() => table.setPageIndex(page)}
                        disabled={page === currentPage}
                    >
                        {page + 1}
                    </Button>
                ),
            )}
            <Button
                variant="outline"
                size="sm"
                className="size-8 border-slate-600/35 p-1 font-semibold text-slate-500"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                 <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                
            </Button>
        </div>
    )
}

export const FilterIcon = () => {
    return (
        <svg
            className=" fill-none text-slate-600/35"
            color="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
        >
            <path
                d="M8.85746 12.5061C6.36901 10.6456 4.59564 8.59915 3.62734 7.44867C3.3276 7.09253 3.22938 6.8319 3.17033 6.3728C2.96811 4.8008 2.86701 4.0148 3.32795 3.5074C3.7889 3 4.60404 3 6.23433 3H17.7657C19.396 3 20.2111 3 20.672 3.5074C21.133 4.0148 21.0319 4.8008 20.8297 6.37281C20.7706 6.83191 20.6724 7.09254 20.3726 7.44867C19.403 8.60062 17.6261 10.6507 15.1326 12.5135C14.907 12.6821 14.7583 12.9567 14.7307 13.2614C14.4837 15.992 14.2559 17.4876 14.1141 18.2442C13.8853 19.4657 12.1532 20.2006 11.226 20.8563C10.6741 21.2466 10.0043 20.782 9.93278 20.1778C9.79643 19.0261 9.53961 16.6864 9.25927 13.2614C9.23409 12.9539 9.08486 12.6761 8.85746 12.5061Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    )
}

export type { ColumnDef }