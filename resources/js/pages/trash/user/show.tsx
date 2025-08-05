import AuditSheet from '@/components/audit-sheet';
import ConfirmDialog from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { getRoleBadgeVariant } from '@/lib/utils';
import { SharedData } from '@/types';
import { Audit } from '@/types/audit';
import { Pagination } from '@/types/pagination';
import { User } from '@/types/user';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArchiveRestore, Building, Mail, Shield, Trash, User as UserIcon, Users } from 'lucide-react';

interface Props {
    user: User;
    audits: Pagination<Audit>;
}

export default function Show({ user, audits }: Props) {
    const { data, meta, links } = audits;

    const handleRestore = (user: User) => {
        router.put(route('users.trash.restore', user.id));
    };

    const handleDelete = (user: User) => {
        router.delete(route('users.trash.force-delete', user.id));
    };

    const { permissions } = usePage<SharedData>().props.auth;
    return (
        <AppLayout>
            <Head title={`User - ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={route('users.index')}>Users</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Details</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="font-bold text-gray-900 md:text-2xl">{user.name}</h1>
                        <p className="mt-1 text-sm text-gray-500">User ID: {user.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {permissions.includes('view_audits') && <AuditSheet data={data} meta={meta} links={links} />}
                        {permissions.includes('restore_users') && (
                            <ConfirmDialog
                                trigger={
                                    <Button className="cursor-pointer" variant="outline" size="sm">
                                        <ArchiveRestore className="h-4 w-4 text-green-600" />
                                        Restore
                                    </Button>
                                }
                                title="Delete Payroll"
                                description={`Are you sure you want to restore  ${user.name}?`}
                                confirmText="Delete"
                                cancelText="Cancel"
                                onConfirm={() => handleRestore(user)}
                            />
                        )}
                        {permissions.includes('delete_users_trash') && (
                            <ConfirmDialog
                                trigger={
                                    <Button className="cursor-pointer" variant="outline" size="sm">
                                        <Trash className="h-4 w-4 text-red-600" />
                                        Delete Permanently
                                    </Button>
                                }
                                title="Delete Payroll"
                                description={`Are you sure you want to delete permanently ${user.name}?`}
                                confirmText="Delete"
                                cancelText="Cancel"
                                onConfirm={() => handleDelete(user)}
                            />
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* basic info */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserIcon className="h-5 w-5 text-blue-600" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">Full Name</label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">Email Address</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <a
                                        href={`mailto:${user.email}`}
                                        className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                                    >
                                        {user.email}
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* organization info */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Building className="h-5 w-5 text-green-600" />
                                Organization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">Department</label>
                                <div className="mt-1">
                                    <Badge variant="outline" className="text-sm font-medium">
                                        {user.department.name}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">Manager</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-900">{user.manager?.name || 'No manager assigned'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* role info */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Shield className="h-5 w-5 text-purple-600" />
                                Roles & Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">Assigned Roles</label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {user.roles && user.roles.length > 0 ? (
                                        user.roles.map((role, index) => (
                                            <Badge key={index} variant={getRoleBadgeVariant(role) as any} className="text-xs font-medium capitalize">
                                                {role}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500 italic">No roles assigned</span>
                                    )}
                                </div>
                                {user.roles && user.roles.length > 0 && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        {user.roles.length} role{user.roles.length > 1 ? 's' : ''} assigned
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Quick Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="text-xs font-medium text-gray-500">Status</div>
                                <div className="mt-1">
                                    <Badge className="bg-red-100 text-red-800 hover:bg-green-100">Inactive</Badge>
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="text-xs font-medium text-gray-500">Department</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">{user.department.name}</div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="text-xs font-medium text-gray-500">Manager</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">{user.manager?.name || 'None'}</div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="text-xs font-medium text-gray-500">Total Roles</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">{user.roles?.length || 0}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
