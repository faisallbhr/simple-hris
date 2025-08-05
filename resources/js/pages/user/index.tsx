// pages/users/index.tsx
import { DataTable } from '@/components/data-table';
import { ExportColumn, ExportDialog } from '@/components/export-dialog';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExport } from '@/hooks/use-export';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Pagination as PaginationProps } from '@/types/pagination';
import { User } from '@/types/user';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { SortingState } from '@tanstack/react-table';
import { Import, Plus, Search } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { columns } from './column';

export default function Index({ users }: { users: PaginationProps<User> }) {
    const { data, meta, links } = users;

    const { post, setData, errors, processing, reset } = useForm({
        file: null as File | null,
    });

    const searchInitial = (meta?.search as string) ?? '';
    const [search, setSearch] = useState(searchInitial);
    const [isLoading, setIsLoading] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [importErrors, setImportErrors] = useState<string[]>([]);

    const availableColumns: ExportColumn[] = [
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
        { id: 'manager_name', label: 'Manager' },
        { id: 'department_name', label: 'Department' },
    ];

    const { handleExport, isExporting, exportErrors } = useExport({
        exportRoute: route('users.export'),
    });

    useEffect(() => {
        setIsLoading(true);
        const delay = setTimeout(() => {
            router.get(
                route('users.index'),
                {
                    search,
                    ...(sorting[0] && {
                        sort: sorting[0].id,
                        direction: sorting[0].desc ? 'desc' : 'asc',
                    }),
                },
                {
                    preserveState: true,
                    replace: true,
                    only: ['users'],
                    onFinish: () => setIsLoading(false),
                },
            );
        }, 500);

        return () => clearTimeout(delay);
    }, [search, sorting]);

    const handlePageChange = (url: string) => {
        setIsLoading(true);
        router.get(
            url,
            {},
            {
                preserveState: true,
                replace: true,
                only: ['users'],
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleImport = (e: FormEvent) => {
        e.preventDefault();
        post(route('users.import'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
            },
        });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setData('file', file || null);
    };

    const { permissions, user } = usePage<SharedData>().props.auth;

    useEffect(() => {
        if (!user?.id) return;

        const channel = window.Echo.private(`user.${user.id}`);

        const handleImport = (data: any) => {
            if (data.status === 'success') {
                toast.success(`Successfully imported ${data.totalRows} data.`);
                setImportErrors([]);
                router.reload({ only: ['users'] });
            } else {
                const formattedErrors = data.errors.map((error: any) => `Row ${error.row}: ${error.message}`);
                setImportErrors(formattedErrors);
            }
        };

        channel.listen('.import.users', handleImport);

        channel.error((error: any) => {
            console.error('Echo channel error:', error);
        });

        return () => {
            channel.stopListening('.import.users');
            window.Echo.leave(`user.${user.id}`);
        };
    }, [user.id]);

    return (
        <AppLayout>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Users</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-gray-900 md:text-2xl">Users</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage your users</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* export dialog */}
                        <ExportDialog
                            availableColumns={availableColumns}
                            onExport={handleExport}
                            title="Export Users"
                            description="Configure your export settings and download users data"
                            defaultColumns={['name', 'email', 'manager_name', 'department_name']}
                            isExporting={isExporting}
                            errors={exportErrors}
                            searchPlaceholder="Filter users name or email..."
                            searchLabel="Search users name or email"
                        />

                        {/* import dialog */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex cursor-pointer items-center gap-2">
                                    <Import className="h-4 w-4 text-emerald-600" />
                                    Import Users
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="flex flex-col gap-4">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Import className="h-4 w-4 text-blue-600" />
                                        Import Users
                                    </DialogTitle>
                                    <DialogDescription>Import users from an Excel file.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleImport}>
                                    <div className="flex items-center gap-2">
                                        <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} required />
                                        <Button type="submit" variant="default" disabled={processing} className="cursor-pointer">
                                            {processing ? 'Importing...' : 'Import Excel'}
                                        </Button>
                                    </div>
                                    {errors.file && <div className="mt-0 text-sm text-red-600">{errors.file}</div>}
                                </form>
                            </DialogContent>
                        </Dialog>

                        {permissions.includes('create_users') && (
                            <Link href={route('users.create')} className="w-fit">
                                <Button size="sm" variant="outline" className="flex cursor-pointer items-center gap-2">
                                    <Plus className="h-4 w-4 text-indigo-600" />
                                    Create User
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input
                            placeholder="Search users name or email..."
                            value={search ?? ''}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {search.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Active filters:</span>
                        {search && (
                            <Badge variant="secondary" className="text-xs">
                                Search: "{search}"
                            </Badge>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    <DataTable columns={columns} data={data} isLoading={isLoading} sorting={sorting} onSortingChange={setSorting} />
                    <Pagination links={links} meta={meta} onPageChange={handlePageChange} />
                </div>

                {importErrors.length > 0 && (
                    <div className="">
                        <Label className="text-sm font-medium text-red-600">Failed import ({importErrors.length} errors):</Label>
                        <ul className="mt-2 list-disc pl-5 text-sm text-red-500">
                            {importErrors.slice(0, 3).map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                            {importErrors.length > 3 && <li>...</li>}
                        </ul>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
