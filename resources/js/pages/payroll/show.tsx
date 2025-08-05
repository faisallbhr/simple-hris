import AuditSheet from '@/components/audit-sheet';
import ConfirmDialog from '@/components/confirm-dialog';
import StatusBadge from '@/components/status-badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateString } from '@/lib/utils';
import { SharedData } from '@/types';
import { Audit } from '@/types/audit';
import { Pagination } from '@/types/pagination';
import { Payroll } from '@/types/payroll';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, Calendar, Check, DollarSign, Download, Edit, FileText, Loader, MoreHorizontal, Trash2, Upload, User, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

interface Props {
    payroll: Payroll;
    audits: Pagination<Audit>;
}

export default function Show({ payroll, audits }: Props) {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState({
        generate: false,
        download: false,
        submit: false,
    });
    const { data, meta, links } = audits;

    const handleProofPdfChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPdfFile(file);
        }
    };

    const handleSubmitPaymentProof = (e: FormEvent) => {
        e.preventDefault();
        setIsLoading({
            ...isLoading,
            submit: true,
        });
        if (!pdfFile) {
            setErrors({ payment_proof: 'Please select a PDF file' });
            return;
        }

        const formData = new FormData();
        formData.append('payment_proof', pdfFile);

        router.post(route('payrolls.update-payment-proof', payroll.id), formData, {
            onSuccess: () => {
                setPdfFile(null);
                setErrors({});
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => {
                setIsLoading({
                    ...isLoading,
                    submit: false,
                });
            },
        });
    };

    const handleDownloadProof = (payroll: Payroll) => {
        window.open(route('payrolls.download-payment-proof', payroll.id), '_blank');
    };

    const handleEdit = (payroll: Payroll) => {
        router.get(route('payrolls.edit', payroll.id));
    };

    const handleDelete = (payroll: Payroll) => {
        router.delete(route('payrolls.destroy', payroll.id));
    };

    const handleStatus = (payroll: Payroll, status: string) => {
        router.patch(route('payrolls.updateStatus', payroll.id), {
            status: status,
        });
    };

    const handleGeneratePayslip = async () => {
        setIsLoading({
            ...isLoading,
            generate: true,
        });
        try {
            const res = await fetch(route('payrolls.generatePaySlip', payroll.id), {
                method: 'GET',
                headers: {
                    Accept: 'application/pdf',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to generate payslip');
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
        } finally {
            setIsLoading({
                ...isLoading,
                generate: false,
            });
        }
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

    const { user, permissions } = usePage<SharedData>().props.auth;

    return (
        <AppLayout>
            <Head title="Payroll Details" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={route('payrolls.index')}>Payrolls</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Details</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* status and button action */}
                <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="mb-1 font-bold text-gray-900 md:text-2xl">Payroll Details</h1>
                        <p className="text-sm text-gray-500">Payroll ID: {payroll.id}</p>
                        <p className="text-sm text-gray-500">Processed by: {payroll.processed_by.name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <StatusBadge status={payroll.status} />
                        {permissions.includes('view_audits') && <AuditSheet data={data} meta={meta} links={links} />}
                        {permissions.includes('edit_payrolls') && user.id === payroll.processed_by.id && payroll.status === 'pending' && (
                            <Button className="cursor-pointer" variant="outline" size="sm" onClick={() => handleEdit(payroll)}>
                                <Edit className="h-4 w-4 text-blue-600" />
                                Edit
                            </Button>
                        )}

                        {permissions.includes('delete_payrolls') && user.id === payroll.processed_by.id && payroll.status === 'pending' && (
                            <ConfirmDialog
                                trigger={
                                    <Button className="cursor-pointer" variant="outline" size="sm">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                        Delete
                                    </Button>
                                }
                                title="Delete Payroll"
                                description={`Are you sure you want to delete payroll for ${payroll.employee.name}?`}
                                confirmText="Delete"
                                cancelText="Cancel"
                                onConfirm={() => handleDelete(payroll)}
                            />
                        )}

                        {permissions.includes('update_status_payrolls') && payroll.status === 'pending' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="cursor-pointer" variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleStatus(payroll, 'approved')} className="cursor-pointer">
                                        <Check className="h-4 w-4" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatus(payroll, 'rejected')} className="cursor-pointer">
                                        <X className="h-4 w-4" />
                                        Rejected
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {permissions.includes('update_payment_proof') &&
                        payroll.status === 'approved' &&
                        user.id === payroll.processed_by.id &&
                        payroll.payment_proof === null &&
                        payroll.is_generated ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="cursor-pointer">
                                        <Upload className="h-4 w-4" />
                                        <span className="text-sm">Upload Payment Proof</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleSubmitPaymentProof}>
                                        <DialogHeader>
                                            <DialogTitle>Upload Payment Proof</DialogTitle>
                                            <DialogDescription>Upload payment proof for {payroll.employee.name}</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="image">Image</Label>
                                                <Input type="file" name="payment_proof" accept=".pdf" onChange={handleProofPdfChange} />
                                                {errors.payment_proof && <p className="text-sm text-red-500">{errors.payment_proof}</p>}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline" className="cursor-pointer">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button disabled={isLoading.submit} type="submit" className="cursor-pointer">
                                                {isLoading.submit && <Loader className="h-4 w-4" />}
                                                Submit
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* left side */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* employee information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Employee Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="text-lg font-semibold">{payroll.employee.name || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Employee ID</label>
                                        <p className="text-gray-900">{payroll.employee.id || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-gray-900">{payroll.employee.email || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Department</label>
                                        <p className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-500" />
                                            {payroll.employee.department || '-'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* pay period */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-purple-600" />
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
                                    <DollarSign className="h-5 w-5 text-green-600" />
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
                                    {payroll.payment_proof && permissions.includes('download_payment_proof') && (
                                        <Button
                                            variant="outline"
                                            disabled={isLoading.download}
                                            className="w-full cursor-pointer justify-start"
                                            onClick={() => handleDownloadProof(payroll)}
                                        >
                                            {isLoading.download ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                            Download Payment Proof
                                        </Button>
                                    )}
                                    {payroll.status === 'approved' && permissions.includes('generate_pay_slip') && (
                                        <Button
                                            variant="outline"
                                            disabled={isLoading.generate}
                                            className="w-full cursor-pointer justify-start"
                                            onClick={handleGeneratePayslip}
                                        >
                                            {isLoading.generate ? <Loader className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
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
