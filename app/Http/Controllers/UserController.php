<?php

namespace App\Http\Controllers;

use App\Exports\UserExport;
use App\Http\Resources\AuditResource;
use App\Http\Resources\UserResource;
use App\Jobs\ImportUsersJob;
use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('query', '');

        if (empty(trim($query))) {
            return response()->json([]);
        }

        $users = User::with(['department:id,name'])
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                    ->orWhere('email', 'LIKE', "%{$query}%");
            })
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name', 'email', 'department_id'])
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department' => $user->department->name,
                ];
            });

        return response()->json($users);
    }

    public function index(Request $request)
    {
        $routeName = $request->route()->getName();
        $isTrashed = $routeName === 'users.trash.index';

        $search = $request->input('search');
        $query = User::with(['manager', 'department', 'roles'])
            ->leftJoin('departments', 'users.department_id', '=', 'departments.id')
            ->leftJoin('users as managers', 'users.manager_id', '=', 'managers.id')
            ->select('users.*');

        if ($isTrashed) {
            $query->onlyTrashed();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('users.name', 'like', '%' . $search . '%')
                    ->orWhere('users.email', 'like', '%' . $search . '%');
            });
        }

        $query->where('users.id', '!=', auth()->user()->id);

        $sort = $request->input('sort') ?: 'created_at';
        $direction = $request->input('direction') ?: 'desc';

        if ($sort === 'department_name') {
            $query->orderBy('departments.name', $direction);
        } elseif ($sort === 'manager_name') {
            $query->orderBy('managers.name', $direction);
        } else {
            $query->orderBy($sort, $direction);
        }

        $users = $query->paginate(10)
            ->withQueryString();

        return Inertia::render($isTrashed ? 'trash/user/index' : 'user/index', [
            'users' => UserResource::collection($users)->additional([
                'meta' => [
                    'search' => $search,
                    'status' => $request->input('status') ? explode(',', $request->input('status')) : [],
                ]
            ])
        ]);
    }

    public function show(Request $request, $id)
    {
        $routeName = $request->route()->getName();
        $isTrashed = $routeName === 'users.trash.show';

        $user = User::when($isTrashed, fn($q) => $q->withTrashed())
            ->with(['manager', 'department', 'roles'])
            ->findOrFail($id);

        $audits = $user->audits()->latest()->paginate(10);

        return Inertia::render($isTrashed ? 'trash/user/show' : 'user/show', [
            'user' => (new UserResource($user))->resolve(),
            'audits' => AuditResource::collection($audits),
        ]);
    }

    public function create()
    {
        $departments = Department::select('id', 'name')->get();

        $managers = User::select('id', 'name')->get();

        $availableRoles = Role::with('permissions')->get()->map(function ($role) {
            return [
                'name' => $role->name,
                'description' => $role->description ?? ucfirst($role->name) . ' role',
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ];
        });

        return Inertia::render('user/create', [
            'departments' => $departments,
            'managers' => $managers,
            'availableRoles' => $availableRoles,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'department_id' => 'nullable|exists:departments,id',
            'manager_id' => 'nullable|exists:users,id',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        DB::beginTransaction();
        try {
            $user = new User();
            $user->fill([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'department_id' => $data['department_id'],
                'manager_id' => $data['manager_id'] ?? null,
            ]);

            $user->note = 'User created by ' . auth()->user()->name;
            $user->save();

            $user->syncRoles($data['roles']);

            DB::commit();
            return redirect()->route('users.index')->with('success', 'User created successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->route('users.create')->with('error', $th->getMessage());
        }
    }

    public function edit($id)
    {
        $user = User::with(['manager', 'department', 'roles'])->findOrFail($id);

        $departments = Department::select('id', 'name')->get();

        $managers = User::select('id', 'name')->get();

        $availableRoles = Role::with('permissions')->get()->map(function ($role) {
            return [
                'name' => $role->name,
                'description' => $role->description ?? ucfirst($role->name) . ' role',
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ];
        });

        return Inertia::render('user/edit', [
            'user' => (new UserResource($user))->resolve(),
            'departments' => $departments,
            'managers' => $managers,
            'availableRoles' => $availableRoles,
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'department_id' => 'nullable|exists:departments,id',
            'manager_id' => 'nullable|exists:users,id',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user = User::findOrFail($id);

        DB::beginTransaction();
        try {
            $user->fill([
                'name' => $data['name'],
                'email' => $data['email'],
                'department_id' => $data['department_id'],
                'manager_id' => $data['manager_id'],
            ]);

            $user->note = 'User updated by ' . auth()->user()->name;
            $user->save();

            $oldRoles = $user->roles->pluck('name')->toArray();
            $user->syncRoles($data['roles']);
            $newRoles = $data['roles'];

            $rolesChanged = array_diff($oldRoles, $newRoles) || array_diff($newRoles, $oldRoles);

            if ($rolesChanged && !$user->isDirty()) {
                $user->audits()->create([
                    'user_type' => get_class(auth()->user()),
                    'user_id' => auth()->user()->id,
                    'event' => 'updated',
                    'old_values' => ['roles' => $oldRoles],
                    'new_values' => ['roles' => $newRoles],
                    'url' => request()->fullUrl(),
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'note' => 'User updated by ' . auth()->user()->name
                ]);
            }

            DB::commit();
            return redirect()->route('users.show', $user->id)->with('success', 'User updated successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->route('users.show', $user->id)->with('error', 'Failed to update user.');
        }
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->note = 'User deleted by ' . auth()->user()->name;
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function restore($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $existingUser = User::where('email', $user->email)->exists();
        if ($existingUser) {
            return redirect()->route('users.trash.index')->with('error', 'User with this email already exists.');
        }

        $user->note = 'User restored by ' . auth()->user()->name;
        $user->restore();
        return redirect()->route('users.trash.index')->with('success', 'User restored successfully.');
    }

    public function forceDelete($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->note = 'User deleted permanently by ' . auth()->user()->name;
        $user->forceDelete();
        return redirect()->route('users.trash.index')->with('success', 'User deleted permanently.');
    }

    public function import(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
            ]);

            $file = $request->file('file');
            if (!$file->isValid()) {
                return redirect()->back()->withErrors(['file' => 'Invalid file upload.']);
            }

            $fileName = 'import_' . time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('imports', $fileName, 'public');

            ImportUsersJob::dispatch($path, auth()->id());

            return redirect()->route('users.index')->with('success', 'Import is being processed in the background. You will be notified when it completes.');

        } catch (ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function export(Request $request)
    {
        $data = $request->validate([
            'format' => 'required|in:xlsx,csv',
            'columns' => 'required|array|min:1',
            'columns.*' => 'in:name,email,manager_name,department_name',
            'filters' => 'sometimes|array',
            'filters.search' => 'sometimes|string|nullable',
            'filters.date_from' => 'sometimes|date|nullable',
            'filters.date_to' => 'sometimes|date|nullable',
        ]);

        $filename = 'export_users_' . now()->format('Y_m_d_H_i_s') . '.' . $data['format'];

        return Excel::download(
            new UserExport(
                $data['columns'],
                $data['filters'] ?? [],
            ),
            $filename
        );
    }
}
