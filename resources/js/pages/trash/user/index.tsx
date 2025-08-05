import { DataTable } from '@/components/data-table';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { columns } from '@/pages/user/column';
import { Pagination as PaginationProps } from '@/types/pagination';
import { User } from '@/types/user';
import { Head, router } from '@inertiajs/react';
import { SortingState } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Index({ users }: { users: PaginationProps<User> }) {
    const { data, meta, links } = users;

    const searchInitial = (meta?.search as string) ?? '';
    const [search, setSearch] = useState(searchInitial);
    const [isLoading, setIsLoading] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => {
        setIsLoading(true);
        const delay = setTimeout(() => {
            router.get(
                route('users.trash.index'),
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
            </div>
        </AppLayout>
    );
}
