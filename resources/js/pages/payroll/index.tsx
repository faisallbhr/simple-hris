import { DataTable } from '@/components/data-table';
import { ExportColumn, ExportDialog } from '@/components/export-dialog';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useExport } from '@/hooks/use-export';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Pagination as PaginationProps } from '@/types/pagination';
import { Payroll } from '@/types/payroll';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { SortingState } from '@tanstack/react-table';
import { Filter, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { columns } from './column';

export const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'paid', label: 'Paid', color: 'bg-blue-100 text-blue-800' },
];

const availableColumns: ExportColumn[] = [
    { id: 'employee_id', label: 'Employee ID' },
    { id: 'employee_name', label: 'Employee Name' },
    { id: 'period_start', label: 'Period Start' },
    { id: 'period_end', label: 'Period End' },
    { id: 'base_salary', label: 'Base Salary' },
    { id: 'net_salary', label: 'Net Salary' },
    { id: 'details', label: 'Payroll Details' },
    { id: 'status', label: 'Status' },
    { id: 'paid_at', label: 'Paid At' },
    { id: 'processed_by', label: 'Processed By' },
];

export default function Index({ payrolls }: { payrolls: PaginationProps<Payroll> }) {
    const { data, links, meta } = payrolls;

    const searchInitial = (meta?.search as string) ?? '';
    const statusInitial = (meta?.status as string[]) ?? [];

    const [search, setSearch] = useState(searchInitial);
    const [statusFilter, setStatusFilter] = useState<string[]>(statusInitial);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusExport, setStatusExport] = useState<string[]>([]);

    const handlePageChange = (url: string) => {
        setIsLoading(true);
        router.get(
            url,
            {},
            {
                preserveState: true,
                replace: true,
                only: ['payrolls'],
                onFinish: () => setIsLoading(false),
            },
        );
    };

    useEffect(() => {
        setIsLoading(true);
        const delay = setTimeout(() => {
            router.get(
                route('payrolls.index'),
                {
                    search,
                    status: statusFilter.join(','),
                    ...(sorting[0] && {
                        sort: sorting[0].id,
                        direction: sorting[0].desc ? 'desc' : 'asc',
                    }),
                },
                {
                    preserveState: true,
                    replace: true,
                    only: ['payrolls'],
                    onFinish: () => setIsLoading(false),
                },
            );
        }, 500);

        return () => clearTimeout(delay);
    }, [search, statusFilter, sorting]);

    const handleStatusChange = (status: string) => {
        const exists = statusFilter.includes(status);
        const newStatus = exists ? statusFilter.filter((s) => s !== status) : [...statusFilter, status];
        setStatusFilter(newStatus);
    };

    const { handleExport, isExporting, exportErrors } = useExport({
        exportRoute: route('payrolls.export'),
    });

    const renderCustomFilters = () => {
        const handleStatusFilter = (status: string) => {
            const exists = statusExport.includes(status);
            const newStatus = exists ? statusExport.filter((s) => s !== status) : [...statusExport, status];
            setStatusExport(newStatus);
        };
        return (
            <div className="space-y-2">
                <label className="text-xs font-medium">Status Filter</label>
                <div className="mt-1 flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                        <Button
                            key={status.value}
                            variant="outline"
                            size="sm"
                            type="button"
                            className={`cursor-pointer text-xs ${statusExport.includes(status.value) ? status.color + ' border-transparent' : 'hover:' + status.color}`}
                            onClick={() => handleStatusFilter(status.value)}
                        >
                            {status.label}
                        </Button>
                    ))}
                </div>
            </div>
        );
    };
    const { permissions } = usePage<SharedData>().props.auth;

    return (
        <AppLayout>
            <Head title="Payroll" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Payroll</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-gray-900 md:text-2xl">Payroll</h1>
                        <p className="mt-1 text-sm text-gray-600">List of all payrolls</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportDialog
                            availableColumns={availableColumns}
                            onExport={(config) => {
                                config.filters.status = statusExport.join(',');
                                handleExport(config);
                            }}
                            isExporting={isExporting}
                            errors={exportErrors}
                            title="Export Payroll Data"
                            description="Export payroll data with custom filters and column selection"
                            defaultColumns={['employee_id', 'employee_name', 'period_start', 'period_end', 'base_salary', 'net_salary']}
                            searchPlaceholder="Filter by employee name..."
                            searchLabel="Employee Search"
                            customFilters={renderCustomFilters()}
                        />

                        {permissions.includes('create_payrolls') && (
                            <Link href={route('payrolls.create')} className="w-fit">
                                <Button size="sm" variant="outline" className="flex cursor-pointer items-center gap-2">
                                    <Plus className="h-4 w-4 text-indigo-600" />
                                    Create Payroll
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input
                            placeholder="Search employee names..."
                            value={search ?? ''}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((status) => (
                                <Button
                                    key={status.value}
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                    onClick={() => handleStatusChange(status.value)}
                                    className={`cursor-pointer text-xs ${statusFilter.includes(status.value) ? status.color + ' border-transparent' : 'hover:' + status.color}`}
                                >
                                    {status.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {(search.length > 0 || statusFilter.length > 0) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Active filters:</span>
                        {search && (
                            <Badge variant="secondary" className="text-xs">
                                Search: "{search}"
                            </Badge>
                        )}
                        {statusFilter.map((status) => (
                            <Badge key={status} variant="secondary" className="text-xs">
                                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                        ))}
                    </div>
                )}
                <div className="space-y-4">
                    <DataTable columns={columns} data={data} isLoading={isLoading} sorting={sorting} onSortingChange={setSorting} />
                    <Pagination links={links} meta={meta} onPageChange={handlePageChange} />
                </div>
            </div>
        </AppLayout>
    );
}
