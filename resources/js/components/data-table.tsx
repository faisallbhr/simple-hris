import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, Updater, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader, Search } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    sorting?: SortingState;
    onSortingChange?: (updaterOrValue: Updater<SortingState>) => void;
}

export function DataTable<TData, TValue>({ columns, data, isLoading = false, sorting, onSortingChange }: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: 'includesString',
        state: {
            sorting,
        },
        onSortingChange: (updater) => {
            if (!onSortingChange) return;
            const nextValue = typeof updater === 'function' ? updater(sorting ?? []) : updater;
            onSortingChange(nextValue);
        },
    });

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border text-center shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-gray-50/50">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="cursor-pointer text-center font-semibold text-gray-700 select-none"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {{
                                            asc: ' 🔼',
                                            desc: ' 🔽',
                                        }[header.column.getIsSorted() as string] ?? null}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                        <span>Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getFilteredRowModel().rows?.length ? (
                            table.getFilteredRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="transition-colors hover:bg-gray-50/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-8 w-8 text-gray-300" />
                                        <span>No results found.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
