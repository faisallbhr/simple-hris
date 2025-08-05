import { Button } from '@/components/ui/button';
import { User } from '@/types/user';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
        cell: ({ getValue }) => <div className="font-medium">{getValue() as string}</div>,
    },
    {
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
        cell: ({ getValue }) => <div className="font-medium">{getValue() as string}</div>,
    },
    {
        accessorKey: 'manager.name',
        header: 'Manager',
        enableSorting: true,
        cell: ({ getValue }) => <div className="font-medium">{(getValue() as string) || '-'}</div>,
    },
    {
        accessorKey: 'department.name',
        header: 'Department',
        enableSorting: true,
        cell: ({ getValue }) => <div className="font-medium">{getValue() as string}</div>,
    },
    {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => {
            const handleView = (user: User) => {
                const currentRoute = route().current();
                const routeName = currentRoute === 'users.trash.index' ? 'users.trash.show' : 'users.show';

                router.get(route(routeName, user.id));
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
