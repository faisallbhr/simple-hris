import AuditSheet from '@/components/audit-sheet';
import ConfirmDialog from '@/components/confirm-dialog';
import StatusBadge from '@/components/status-badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateString } from '@/lib/utils';
import { SharedData } from '@/types';
import { Audit } from '@/types/audit';
import { Pagination } from '@/types/pagination';
import { Payroll } from '@/types/payroll';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArchiveRestore, Building2, Calendar, DollarSign, Download, FileText, Trash, User } from 'lucide-react';

interface Props {
    payroll: Payroll;
    audits: Pagination<Audit>;
}

export default function PayrollTrashShow({ payroll, audits }: Props) {
    const { data, meta, links } = audits;
    const handleDownloadProof = (payroll: Payroll) => {
        window.open(route('payrolls.download-payment-proof', payroll.id), '_blank');
    };

    const handleGeneratePayslip = async () => {
        try {
            const res = await fetch(route('payrolls.generatePaySlip', payroll.id), {
                method: 'GET',
                headers: {
                    Accept: 'application/pdf',
                },
            });

            if (!res.ok) {
                throw new Error('Gagal mengambil payslip');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `payslip-${payroll.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.location.reload();
        } catch (error) {
            console.error('Error generate payslip:', error);
        }
    };

    const handleRestore = (payroll: Payroll) => {
        router.put(route('payrolls.trash.restore', payroll.id));
    };

    const handleDelete = (payroll: Payroll) => {
        router.delete(route('payrolls.trash.force-delete', payroll.id));
    };

    const details = typeof payroll.details === 'string' ? JSON.parse(payroll.details) : payroll.details;

    const calculateGrossSalary = () => {
        let gross = Number(payroll.base_salary) || 0;

        if (details?.bonus) {
            gross += Number(details.bonus) || 0;
        }

        if (details?.allowances) {
            for (const amount of Object.values(details.allowances)) {
                gross += Number(amount) || 0;
            }
        }

        if (details?.overtime_hours && details?.overtime_rate) {
            gross += Number(details.overtime_hours) * Number(details.overtime_rate);
        }

        return gross;
    };

    const calculateTotalDeductions = () => {
        let deductions = 0;

        if (details?.deductions) {
            for (const amount of Object.values(details.deductions)) {
                deductions += Number(amount) || 0;
            }
        }

        return deductions;
    };

    const grossSalary = calculateGrossSalary();
    const totalDeductions = calculateTotalDeductions();

    const { permissions } = usePage<SharedData>().props.auth;
    return (
        <AppLayout>
            <Head title="Payroll Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link href="/payrolls">
                                <BreadcrumbPage>Payroll</BreadcrumbPage>
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Details</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* status and button action */}
                <div className="mb-2 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 font-bold text-gray-900 md:text-xl">Payroll Details</h1>
                        <p className="md:text-basetext-gray-600 text-sm">Payroll ID: {payroll.id}</p>
                        <p className="md:text-basetext-gray-600 text-sm">Processed by: {payroll.processed_by.name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <StatusBadge status={payroll.status} />
                        {permissions.includes('view_audits') && <AuditSheet data={data} meta={meta} links={links} />}
                        {permissions.includes('restore_payrolls') && (
                            <ConfirmDialog
                                trigger={
                                    <Button className="cursor-pointer" variant="outline" size="sm">
                                        <ArchiveRestore className="h-4 w-4 text-green-600" />
                                        Restore
                                    </Button>
                                }
                                title="Delete Payroll"
                                description={`Are you sure you want to restore payroll for ${payroll.employee.name}?`}
                                confirmText="Delete"
                                cancelText="Cancel"
                                onConfirm={() => handleRestore(payroll)}
                            />
                        )}
                        {permissions.includes('delete_payrolls_trash') && (
                            <ConfirmDialog
                                trigger={
                                    <Button className="cursor-pointer" variant="outline" size="sm">
                                        <Trash className="h-4 w-4 text-red-600" />
                                        Delete Permanently
                                    </Button>
                                }
                                title="Delete Payroll"
                                description={`Are you sure you want to delete permanently payroll for ${payroll.employee.name}?`}
                                confirmText="Delete"
                                cancelText="Cancel"
                                onConfirm={() => handleDelete(payroll)}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* left side */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* employee information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Employee Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="text-lg font-semibold">{payroll.employee.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Employee ID</label>
                                        <p className="text-gray-900">{payroll.employee.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-gray-900">{payroll.employee.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Department</label>
                                        <p className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-500" />
                                            {payroll.employee.department}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* pay period */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Pay Period
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                                        <p className="font-medium text-gray-900">{formatDateString(payroll.period_start)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">End Date</label>
                                        <p className="font-medium text-gray-900">{formatDateString(payroll.period_end)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* salary breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Salary Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Base Salary</span>
                                        <span className="font-medium">{formatCurrency(payroll.base_salary)}</span>
                                    </div>

                                    {/* bonus */}
                                    {details?.bonus > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Bonus</span>
                                            <span className="font-medium text-green-600">+{formatCurrency(details?.bonus)}</span>
                                        </div>
                                    )}

                                    {/* allowances */}
                                    {details?.allowances && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2">
                                                <span className="text-sm font-medium text-gray-700">Allowances</span>
                                                {Object.entries(details.allowances).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between pl-4">
                                                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                                                        <span className="text-green-600">+{formatCurrency(Number(value))}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* gross salary */}
                                    <div className="flex items-center justify-between font-medium">
                                        <span>Gross Salary</span>
                                        <span>{formatCurrency(grossSalary)}</span>
                                    </div>

                                    {/* deductions */}
                                    {details?.deductions && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2">
                                                <span className="text-sm font-medium text-gray-700">Deductions</span>
                                                {Object.entries(details.deductions).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between pl-4">
                                                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                                                        <span className="text-red-600">-{formatCurrency(Number(value))}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between font-medium">
                                                <span>Total Deductions</span>
                                                <span className="text-red-600">-{formatCurrency(totalDeductions)}</span>
                                            </div>
                                        </>
                                    )}

                                    {/* net salary */}
                                    <Separator className="border-2" />
                                    <div className="flex items-center justify-between text-lg font-bold">
                                        <span>Net Salary</span>
                                        <span className="text-green-600">{formatCurrency(payroll.net_salary)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* notes */}
                        {payroll.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="leading-relaxed text-gray-700">{payroll.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* right side */}
                    <div className="space-y-6">
                        {/* quick actions */}
                        {payroll.status !== 'pending' && payroll.status !== 'rejected' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {payroll.payment_proof && (
                                        <Button
                                            variant="outline"
                                            className="w-full cursor-pointer justify-start"
                                            onClick={() => handleDownloadProof(payroll)}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Payment Proof
                                        </Button>
                                    )}
                                    {payroll.status === 'approved' && (
                                        <Button variant="outline" className="w-full cursor-pointer justify-start" onClick={handleGeneratePayslip}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Generate Payslip
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* summary stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Gross Amount</span>
                                    <span className="font-medium">{formatCurrency(grossSalary)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Deductions</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(totalDeductions)}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between font-bold">
                                    <span>Net Pay</span>
                                    <span className="text-green-600">{formatCurrency(payroll.net_salary)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
