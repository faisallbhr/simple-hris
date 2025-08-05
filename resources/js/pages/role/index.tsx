import { DataTable } from '@/components/data-table';
import { Pagination } from '@/components/pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Pagination as PaginationProps } from '@/types/pagination';
import { Permission } from '@/types/permission';
import { Role } from '@/types/role';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Edit, Plus, Search, Shield, Tag } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createColumns } from './column';

interface Props {
    roles: PaginationProps<Role>;
    permissions: Permission[];
}

const DEFAULT_FORM_DATA = {
    name: '',
    guard_name: 'web',
    permissions: [] as string[],
};

export default function RoleManagement({ roles, permissions }: Props) {
    const { data, meta, links } = roles;

    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [dialogs, setDialogs] = useState({
        create: false,
        edit: false,
        delete: false,
    });
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const createForm = useForm({
        ...DEFAULT_FORM_DATA,
        description: '',
    });

    const editForm = useForm(DEFAULT_FORM_DATA);

    const groupedPermissions = useMemo(() => {
        return permissions.reduce(
            (acc, permission) => {
                const key = permission.category || permission.guard_name || 'general';
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(permission);
                return acc;
            },
            {} as Record<string, Permission[]>,
        );
    }, [permissions]);

    const toggleDialog = useCallback((type: keyof typeof dialogs, value?: boolean) => {
        setDialogs((prev) => ({
            ...prev,
            [type]: value ?? !prev[type],
        }));
    }, []);

    const openEditDialog = useCallback(
        (role: Role) => {
            setSelectedRole(role);
            editForm.setData({
                name: role.name,
                guard_name: role.guard_name || 'web',
                permissions: role.permissions?.map((p) => p.id) || [],
            });
            toggleDialog('edit', true);
        },
        [editForm, toggleDialog],
    );

    const openDeleteDialog = useCallback(
        (role: Role) => {
            setSelectedRole(role);
            toggleDialog('delete', true);
        },
        [toggleDialog],
    );

    const closeDialogs = useCallback(() => {
        setDialogs({ create: false, edit: false, delete: false });
        setSelectedRole(null);
    }, []);

    const columns = useMemo(() => createColumns(openEditDialog, openDeleteDialog), [openEditDialog, openDeleteDialog]);

    useEffect(() => {
        setIsLoading(true);
        const timeoutId = setTimeout(() => {
            router.get(
                route('roles.index'),
                { search },
                {
                    preserveState: true,
                    replace: true,
                    only: ['roles'],
                    onFinish: () => setIsLoading(false),
                },
            );
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleCreateRole = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            createForm.post(route('roles.store'), {
                onSuccess: () => {
                    toggleDialog('create', false);
                    createForm.reset();
                },
            });
        },
        [createForm, toggleDialog],
    );

    const handleEditRole = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedRole) return;

            editForm.put(route('roles.update', selectedRole.id), {
                onSuccess: () => {
                    closeDialogs();
                    editForm.reset();
                },
            });
        },
        [editForm, selectedRole, closeDialogs],
    );

    const handleDeleteRole = useCallback(() => {
        if (!selectedRole) return;

        router.delete(route('roles.destroy', selectedRole.id), {
            onSuccess: closeDialogs,
        });
    }, [selectedRole, closeDialogs]);

    const handlePermissionToggle = useCallback((permissionId: string, checked: boolean, form: any) => {
        const currentPermissions = form.data.permissions;
        const newPermissions = checked ? [...currentPermissions, permissionId] : currentPermissions.filter((id: string) => id !== permissionId);

        form.setData('permissions', newPermissions);
    }, []);

    const renderPermissionGroups = useCallback(
        (form: any, prefix: string) => (
            <div className="max-h-64 space-y-4 overflow-y-auto rounded-lg border bg-gray-50/50 p-4">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            <h4 className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</h4>
                            <Badge variant="outline" className="text-xs">
                                {categoryPermissions.length}
                            </Badge>
                        </div>
                        <div className="grid gap-3 pl-6">
                            {categoryPermissions.map((permission) => (
                                <div key={permission.id} className="flex items-start space-x-3">
                                    <Checkbox
                                        id={`${prefix}-${permission.id}`}
                                        checked={form.data.permissions.includes(permission.id)}
                                        onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean, form)}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor={`${prefix}-${permission.id}`} className="cursor-pointer text-sm font-medium">
                                            {permission.name}
                                        </Label>
                                        {prefix === 'edit' && (
                                            <div className="mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {permission.guard_name}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        ),
        [groupedPermissions, handlePermissionToggle],
    );

    const { permissions: userPermissions } = usePage<SharedData>().props.auth;
    return (
        <AppLayout>
            <Head title="Role Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Role Management</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-gray-900 md:text-2xl">Role Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage system roles and their permissions</p>
                    </div>
                    {/* create dialog */}
                    {userPermissions.includes('create_roles') && userPermissions.includes('assign_permissions') && (
                        <Dialog open={dialogs.create} onOpenChange={(open) => toggleDialog('create', open)}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex cursor-pointer items-center gap-2">
                                    <Plus className="h-4 w-4 text-indigo-600" />
                                    Create Role
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        Create New Role
                                    </DialogTitle>
                                    <DialogDescription>Create a new role and assign permissions to it.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateRole} className="space-y-4">
                                    <div className="grid gap-4">
                                        <div>
                                            <Label htmlFor="create-name">Role Name</Label>
                                            <Input
                                                id="create-name"
                                                value={createForm.data.name}
                                                onChange={(e) => createForm.setData('name', e.target.value)}
                                                placeholder="e.g., Manager, Employee"
                                                required
                                            />
                                            {createForm.errors.name && <p className="mt-1 text-xs text-red-600">{createForm.errors.name}</p>}
                                        </div>

                                        <div>
                                            <Label className="text-base font-medium">Permissions</Label>
                                            <p className="mb-3 text-sm text-gray-600">Select the permissions for this role</p>
                                            {renderPermissionGroups(createForm, 'create')}
                                            <div className="mt-2 text-xs text-gray-600">
                                                {createForm.data.permissions.length} permission
                                                {createForm.data.permissions.length !== 1 ? 's' : ''} selected
                                            </div>
                                            {createForm.errors.permissions && (
                                                <p className="mt-1 text-xs text-red-600">{createForm.errors.permissions}</p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => toggleDialog('create', false)}
                                            className="cursor-pointer"
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={createForm.processing} className="cursor-pointer">
                                            {createForm.processing ? 'Creating...' : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                    </div>
                </div>

                {search.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Active filters:</span>
                        <Badge variant="secondary" className="text-xs">
                            Search: "{search}"
                        </Badge>
                    </div>
                )}

                <div className="space-y-4">
                    <DataTable columns={columns} data={data} isLoading={isLoading} />
                    <Pagination links={links} meta={meta} onPageChange={(url) => router.get(url)} />
                </div>

                {/* edit dialog */}
                {userPermissions.includes('edit_roles') &&
                    userPermissions.includes('assign_permissions') &&
                    userPermissions.includes('revoke_permissions') && (
                        <Dialog open={dialogs.edit} onOpenChange={(open) => toggleDialog('edit', open)}>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Edit className="h-5 w-5 text-blue-600" />
                                        Edit Role
                                    </DialogTitle>
                                    <DialogDescription>Update role information and permissions.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleEditRole} className="space-y-4">
                                    <div className="grid gap-4">
                                        <div>
                                            <Label htmlFor="edit-name">Role Name</Label>
                                            <Input
                                                id="edit-name"
                                                value={editForm.data.name}
                                                onChange={(e) => editForm.setData('name', e.target.value)}
                                                placeholder="e.g., Manager, Employee"
                                                required
                                            />
                                            {editForm.errors.name && <p className="mt-1 text-xs text-red-600">{editForm.errors.name}</p>}
                                        </div>

                                        <div>
                                            <Label className="text-base font-medium">Permissions</Label>
                                            <p className="mb-3 text-sm text-gray-600">Select the permissions for this role</p>
                                            {renderPermissionGroups(editForm, 'edit')}
                                            <div className="mt-2 text-xs text-gray-600">
                                                {editForm.data.permissions.length} permission
                                                {editForm.data.permissions.length !== 1 ? 's' : ''} selected
                                            </div>
                                            {editForm.errors.permissions && (
                                                <p className="mt-1 text-xs text-red-600">{editForm.errors.permissions}</p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => toggleDialog('edit', false)}
                                            className="cursor-pointer"
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="default" disabled={editForm.processing} className="cursor-pointer">
                                            {editForm.processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}

                {/* delete dialog */}
                {userPermissions.includes('delete_roles') && (
                    <AlertDialog open={dialogs.delete} onOpenChange={(open) => toggleDialog('delete', open)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Delete Role
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {selectedRole?.users_count && selectedRole.users_count > 0 ? (
                                        <>
                                            Cannot delete role <strong>"{selectedRole?.name}"</strong> because it is currently assigned to{' '}
                                            <strong>{selectedRole.users_count}</strong> user{selectedRole.users_count !== 1 ? 's' : ''}. Please
                                            reassign or remove these users before deleting the role.
                                        </>
                                    ) : (
                                        <>
                                            Are you sure you want to delete the role <strong>"{selectedRole?.name}"</strong>? This action cannot be
                                            undone and will remove all associated permissions.
                                        </>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => toggleDialog('delete', false)} className="cursor-pointer">
                                    Cancel
                                </AlertDialogCancel>
                                {(!selectedRole?.users_count || selectedRole.users_count === 0) && (
                                    <AlertDialogAction onClick={handleDeleteRole} className="cursor-pointer bg-red-600 hover:bg-red-700">
                                        Delete
                                    </AlertDialogAction>
                                )}
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </AppLayout>
    );
}
