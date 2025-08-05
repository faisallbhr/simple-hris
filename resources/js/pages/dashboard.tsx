import { DataTable } from '@/components/data-table';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateString } from '@/lib/utils';
import { Pagination as PaginationProps } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Calendar, DollarSign, Download, Eye, FileText, XCircle } from 'lucide-react';
import { useState } from 'react';

interface SalarySlipData {
    period: {
        start: string;
        end: string;
    };
    base_salary: number;
    bonus: number;
    allowances: Record<string, number>;
    deductions: Record<string, number>;
    net_salary: number;
}

interface SalarySlip {
    id: string;
    employee_name?: string;
    slip_data: SalarySlipData;
    created_at: string;
}

interface YearlyStats {
    total_earned: number;
    total_slips: number;
    last_payment: number;
}

interface Props {
    salarySlips: PaginationProps<SalarySlip>;
    yearlyStats: YearlyStats;
}

export default function PaySlips({ salarySlips, yearlyStats }: Props) {
    const [isLoading, setIsLoading] = useState({
        page: false,
        download: false,
    });
    const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const { data, meta, links } = salarySlips;

    const handleDownload = async (slip: SalarySlip) => {
        setIsLoading({
            ...isLoading,
            download: true,
        });
        try {
            const res = await fetch(route('salary-slip.download', slip.id), {
                method: 'GET',
                headers: {
                    Accept: 'application/pdf',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to download salary slip');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `salary-slip-${slip.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.location.reload();
        } catch (error) {
            console.error('Error generate salary slip:', error);
        } finally {
            setIsLoading({
                ...isLoading,
                download: false,
            });
        }
    };

    const handleViewDetail = async (slip: SalarySlip) => {
        setSelectedSlip(slip);
        setShowDetail(true);
    };
    console.log(data[1]);

    const columns: ColumnDef<SalarySlip>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ getValue }) => (
                <div className="mx-auto max-w-[100px] truncate overflow-hidden font-medium whitespace-nowrap">{getValue() as string}</div>
            ),
        },
        {
            accessorKey: 'slip_data.period.start',
            header: 'Period Start',
            cell: ({ getValue }) => <div className="font-medium">{formatDateString(getValue() as string)}</div>,
        },
        {
            accessorKey: 'slip_data.period.end',
            header: 'Period End',
            cell: ({ getValue }) => <div className="font-medium">{formatDateString(getValue() as string)}</div>,
        },
        {
            accessorKey: 'slip_data.base_salary',
            header: 'Base Salary',
            cell: ({ getValue }) => <div className="font-medium">{formatCurrency(getValue() as number)}</div>,
        },
        {
            accessorKey: 'slip_data.net_salary',
            header: 'Net Salary',
            cell: ({ getValue }) => <div className="font-medium">{formatCurrency(getValue() as number)}</div>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex justify-center gap-2">
                    <Button size="sm" className="cursor-pointer text-sm" onClick={() => handleViewDetail(row.original)} variant="outline">
                        <Eye className="h-4 w-4 text-blue-600" />
                        View
                    </Button>
                    <Button
                        size="sm"
                        disabled={isLoading.download}
                        variant="outline"
                        className="cursor-pointer text-sm"
                        onClick={() => handleDownload(row.original)}
                    >
                        <Download className="h-4 w-4 text-teal-600" />
                        Download
                    </Button>
                </div>
            ),
        },
    ];

    const handlePageChange = (url: string) => {
        setIsLoading({
            ...isLoading,
            page: true,
        });
        router.get(
            url,
            {},
            {
                preserveState: true,
                replace: true,
                only: ['salarySlips'],
                onFinish: () =>
                    setIsLoading({
                        ...isLoading,
                        page: false,
                    }),
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* stats */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex h-full items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Earned (YTD)</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(yearlyStats.total_earned)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex h-full items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Pay Slips</p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{yearlyStats.total_slips}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex h-full items-center gap-3">
                            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Last Payment</p>
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(yearlyStats.last_payment)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* content */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-900" />
                            <h2 className="text-xl font-semibold text-gray-900">Salary Slip History</h2>
                        </div>
                        <p className="mb-4 text-sm text-gray-600">All your salary slips are listed below. Click to view details or download PDF.</p>
                    </div>

                    <div className="space-y-4">
                        <DataTable data={data} columns={columns} isLoading={isLoading.page} />
                        <Pagination meta={meta} links={links} onPageChange={handlePageChange} />
                    </div>
                </div>
            </div>

            {/* salary slip details */}
            <Dialog open={showDetail} onOpenChange={setShowDetail}>
                <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Salary Slip Detail</DialogTitle>
                        <DialogDescription>
                            {selectedSlip && (
                                <>
                                    Period: {formatDateString(selectedSlip.slip_data.period.start)} -{' '}
                                    {formatDateString(selectedSlip.slip_data.period.end)}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSlip && (
                        <div className="space-y-4">
                            {/* earnings */}
                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Earnings</h3>
                                <div className="space-y-2">
                                    <Card>
                                        <CardContent className="flex justify-between p-3">
                                            <span className="text-gray-900">Base Salary</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(selectedSlip.slip_data.base_salary)}</span>
                                        </CardContent>
                                    </Card>
                                    {Object.entries(selectedSlip.slip_data.allowances).map(([key, value]) => (
                                        <Card key={key} className="bg-green-100/50 dark:bg-green-900/20">
                                            <CardContent className="flex justify-between p-3">
                                                <span className="text-gray-900 capitalize">{key}</span>
                                                <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(value)}</span>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {selectedSlip.slip_data.bonus > 0 && (
                                        <Card className="bg-green-100/50 dark:bg-green-900/20">
                                            <CardContent className="flex justify-between p-3">
                                                <span className="text-gray-900">Bonus</span>
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    {formatCurrency(selectedSlip.slip_data.bonus)}
                                                </span>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            {/* deductions */}
                            {Object.keys(selectedSlip.slip_data.deductions).length > 0 && (
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">Deductions</h3>
                                    <div className="space-y-2">
                                        {Object.entries(selectedSlip.slip_data.deductions).map(([key, value]) => (
                                            <Card key={key} className="bg-red-100/50 dark:bg-red-900/20">
                                                <CardContent className="flex justify-between p-3">
                                                    <span className="text-gray-900 capitalize">{key}</span>
                                                    <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(value)}</span>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <Separator />
                                <Card className="mt-4 bg-blue-100/50 dark:bg-blue-900/20">
                                    <CardContent className="flex justify-between p-4 text-xl font-bold">
                                        <span className="text-gray-900">Net Salary</span>
                                        <span className="text-green-600 dark:text-green-400">
                                            {formatCurrency(selectedSlip.slip_data.net_salary)}
                                        </span>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowDetail(false)} className="cursor-pointer">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    Close
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={isLoading.download}
                                    onClick={() => handleDownload(selectedSlip)}
                                    className="cursor-pointer"
                                >
                                    <Download className="h-4 w-4 text-teal-600" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
