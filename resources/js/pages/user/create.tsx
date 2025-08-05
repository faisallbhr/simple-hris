import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { getRoleBadgeVariant, getRoleIcon } from '@/lib/utils';
import { Role } from '@/types/role';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building, Shield, User as UserIcon, X } from 'lucide-react';
import { useState } from 'react';

interface Department {
    id: string;
    name: string;
}

interface Manager {
    id: string;
    name: string;
}

interface Props {
    departments: Department[];
    managers: Manager[];
    availableRoles: Role[];
}

export default function Create({ departments, managers, availableRoles }: Props) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['employee']);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        department_id: '',
        manager_id: '',
        roles: ['employee'],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('roles', selectedRoles);
        post(route('users.store'));
    };

    const handleRoleToggle = (roleName: string, checked: boolean) => {
        let updatedRoles: string[];

        if (checked) {
            updatedRoles = [...selectedRoles, roleName];
        } else {
            updatedRoles = selectedRoles.filter((role) => role !== roleName);
        }

        setSelectedRoles(updatedRoles);
        setData('roles', updatedRoles);
    };

    const handleRemoveRole = (roleToRemove: string) => {
        setSelectedRoles(selectedRoles.filter((role) => role !== roleToRemove));
        setData(
            'roles',
            selectedRoles.filter((role) => role !== roleToRemove),
        );
    };

    return (
        <AppLayout>
            <Head title="Create New User" />
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
                            <BreadcrumbPage>Create New User</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* basic info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <UserIcon className="h-5 w-5 text-blue-600" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Full Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1"
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="email" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Email Address *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1"
                                        placeholder="Enter email address"
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="password" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Password *
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-1"
                                        placeholder="Enter password"
                                        required
                                    />
                                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="password_confirmation" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Confirm Password *
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="mt-1"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    {errors.password_confirmation && <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* organization info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Building className="h-5 w-5 text-green-600" />
                                    Organization
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="department" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Department *
                                    </Label>
                                    <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && <p className="mt-1 text-xs text-red-600">{errors.department_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="manager" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Manager
                                    </Label>
                                    <Select
                                        value={data.manager_id || 'none'}
                                        onValueChange={(value) => setData('manager_id', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select manager (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No manager</SelectItem>
                                            {managers.map((manager) => (
                                                <SelectItem key={manager.id} value={manager.id}>
                                                    {manager.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.manager_id && <p className="mt-1 text-xs text-red-600">{errors.manager_id}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* role */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Shield className="h-5 w-5 text-purple-600" />
                                Role Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* selected roles */}
                            <div>
                                <Label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                                    Selected Roles ({selectedRoles.length})
                                </Label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedRoles.length > 0 ? (
                                        selectedRoles.map((role, index) => (
                                            <div key={index} className="flex items-center gap-1">
                                                <Badge
                                                    variant={getRoleBadgeVariant(role) as any}
                                                    className="flex items-center gap-1 text-xs font-medium capitalize"
                                                >
                                                    <span>{getRoleIcon(role)}</span>
                                                    {role}
                                                    {!(role === 'employee' || selectedRoles.length === 1) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRole(role)}
                                                            className="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-black/10"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500 italic">No roles assigned</span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">* Every user must have at least the Employee role</p>
                            </div>

                            {/* available roles */}
                            <div>
                                <Label className="text-xs font-medium tracking-wide text-gray-500 uppercase">Available Roles</Label>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {availableRoles.map((role) => (
                                        <div
                                            key={role.name}
                                            className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                                        >
                                            <Checkbox
                                                id={role.name}
                                                checked={selectedRoles.includes(role.name)}
                                                disabled={role.name === 'employee'}
                                                onCheckedChange={(checked) => handleRoleToggle(role.name, checked as boolean)}
                                                className="mt-1"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <Label
                                                    htmlFor={role.name}
                                                    className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900"
                                                >
                                                    <span>{getRoleIcon(role.name)}</span>
                                                    <span className="capitalize">{role.name}</span>
                                                    {role.name === 'employee' && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </Label>
                                                <p className="mt-1 text-xs text-gray-500">{role.description}</p>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {role.permissions.slice(0, 3).map((permission, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {permission}
                                                        </Badge>
                                                    ))}
                                                    {role.permissions.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{role.permissions.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {errors.roles && <p className="text-xs text-red-600">{errors.roles}</p>}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('users.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="flex cursor-pointer items-center gap-2">
                            {processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
