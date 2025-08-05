import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Payroll } from '@/types/payroll';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' };
            case 'approved':
                return { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 hover:bg-green-200' };
            case 'rejected':
                return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 hover:bg-red-200' };
            case 'paid':
                return { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' };
            default:
                return { variant: 'outline' as const, className: '' };
        }
    };

    const config = getStatusConfig(status);
    return (
        <Badge variant={config.variant} className={config.className}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
};

export const columns: ColumnDef<Payroll>[] = [
    {
        accessorKey: 'employee.name',
        header: 'Employee Name',
        enableSorting: true,
        cell: ({ getValue }) => <div className="font-medium">{(getValue() as string) || '-'}</div>,
    },
    {
        accessorKey: 'employee.department',
        header: 'Department',
        enableSorting: true,
        cell: ({ getValue }) => <div className="font-medium">{(getValue() as string) || '-'}</div>,
    },
    {
        accessorKey: 'period_start',
        header: 'Period Start',
        enableSorting: true,
        cell: ({ getValue }) => (
            <div className="font-medium">
                {new Date(getValue() as string).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })}
            </div>
        ),
    },
    {
        accessorKey: 'period_end',
        header: 'Period End',
        enableSorting: true,
        cell: ({ getValue }) => (
            <div className="font-medium">
                {new Date(getValue() as string).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })}
            </div>
        ),
    },
    {
        accessorKey: 'net_salary',
        header: 'Net Salary',
        enableSorting: true,
        cell: ({ getValue }) => (
            <div className="font-semibold text-green-600">
                {(getValue() as number).toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                })}
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => {
            const handleView = (payroll: Payroll) => {
                const currentRoute = route().current();
                const routeName = currentRoute === 'payrolls.trash.index' ? 'payrolls.trash.show' : 'payrolls.show';

                router.get(route(routeName, payroll.id));
            };
            return (
                <Button size={'sm'} variant="outline" onClick={() => handleView(row.original)} className="cursor-pointer">
                    <Eye className="h-4 w-4 text-blue-600" />
                    View Details
                </Button>
            );
        },
    },
];
