import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateString } from '@/lib/utils';
import { Role } from '@/types/role';
import { ColumnDef } from '@tanstack/react-table';
import { Calendar, Edit, Lock, Trash2 } from 'lucide-react';

export const createColumns = (onEdit: (role: Role) => void, onDelete: (role: Role) => void): ColumnDef<Role>[] => [
    {
        accessorKey: 'name',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.original;
            return (
                <div className="flex flex-col items-center justify-center">
                    <span className="font-semibold text-gray-900">{role.name}</span>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Created {formatDateString(role.created_at)}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => {
            const { permissions } = row.original;
            const displayPermissions = permissions.slice(0, 3);
            const remainingCount = permissions.length - 3;

            return (
                <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex flex-wrap gap-1">
                        {displayPermissions.map((permission) => (
                            <Badge key={permission.id} variant="outline" className="text-xs">
                                <Lock className="mr-1 h-3 w-3" />
                                {permission.name}
                            </Badge>
                        ))}
                        {remainingCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                +{remainingCount} more
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-gray-500">
                        {permissions.length} permission{permissions.length !== 1 ? 's' : ''} assigned
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'users_count',
        header: 'Users',
        cell: ({ row }) => {
            const usersCount = row.original.users_count || 0;
            return (
                <div className="text-center">
                    <div className="font-semibold text-gray-900">{usersCount}</div>
                    <div className="text-xs text-gray-500">users</div>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const role = row.original;
            return (
                <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(role)} className="cursor-pointer">
                        <Edit className="h-4 w-4 text-blue-600" />
                        Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDelete(role)} className="cursor-pointer">
                        <Trash2 className="h-4 w-4 text-red-600" />
                        Delete
                    </Button>
                </div>
            );
        },
    },
];
