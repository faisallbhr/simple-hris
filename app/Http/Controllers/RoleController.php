<?php

namespace App\Http\Controllers;

use App\Http\Resources\PermissionResource;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $roles = Role::query()
            ->withCount('users')
            ->with(['permissions:id,name,guard_name'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $permissions = Permission::all(['id', 'name', 'guard_name'])
            ->map(function ($permission) {
                $permission->category = $this->getPermissionCategory($permission->name);
                return $permission;
            });

        return Inertia::render('role/index', [
            'roles' => RoleResource::collection($roles)->additional([
                'meta' => [
                    'search' => $search,
                ],
            ]),
            'permissions' => PermissionResource::collection($permissions)->resolve(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        DB::beginTransaction();
        try {
            $role = new Role();
            $role->fill([
                'name' => $data['name'],
                'guard_name' => 'web',
            ]);

            $role->note = 'Role created by ' . auth()->user()->name;
            $role->save();

            $role->permissions()->sync($data['permissions']);

            DB::commit();
            return redirect()->route('roles.index')->with('success', 'Role created successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();
            \Log::error($th);
            return redirect()->route('roles.index')->with('error', 'Failed to create role.');
        }
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        DB::beginTransaction();
        try {
            $role->fill([
                'name' => $data['name'],
            ]);

            $role->note = 'Role updated by ' . auth()->user()->name;
            $role->save();

            $oldPermissions = $role->permissions->pluck('id')->toArray();
            $role->permissions()->sync($data['permissions']);
            $newPermissions = $data['permissions'];
            $changedPermissions = array_diff($oldPermissions, $newPermissions) || array_diff($newPermissions, $oldPermissions);

            if ($changedPermissions && !$role->isDirty()) {
                $role->audits()->create([
                    'user_type' => get_class(auth()->user()),
                    'user_id' => auth()->user()->id,
                    'event' => 'updated',
                    'old_values' => ['roles' => $oldPermissions],
                    'new_values' => ['roles' => $newPermissions],
                    'url' => request()->fullUrl(),
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'note' => 'Role updated by ' . auth()->user()->name
                ]);
            }
            DB::commit();
            return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->route('roles.index')->with('error', 'Failed to update role.');
        }
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Cannot delete role because it is assigned to one or more users.');
        }

        $role->note = 'Role deleted by ' . auth()->user()->name;
        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }

    private function getPermissionCategory($permissionName)
    {
        $categories = [
            'user' => [
                'view_users',
                'create_users',
                'edit_users',
                'delete_users',
                'view_users_trash',
                'restore_users',
                'delete_users_trash',
            ],
            'role' => [
                'view_roles',
                'create_roles',
                'edit_roles',
                'delete_roles',
            ],
            'permission' => [
                'assign_permissions',
                'revoke_permissions',
            ],
            'payroll' => [
                'view_payrolls',
                'create_payrolls',
                'edit_payrolls',
                'delete_payrolls',
                'update_payment_proof',
                'download_payment_proof',
                'update_status_payrolls',
                'view_payrolls_trash',
                'restore_payrolls',
                'delete_payrolls_trash',
            ],
            'salary_slip' => [
                'generate_pay_slip',
                'download_pay_slip',
                'view_salary_slips',
            ],
        ];

        foreach ($categories as $category => $permissions) {
            if (in_array($permissionName, $permissions)) {
                return $category;
            }
        }

        return 'general';
    }

}