<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            'view_roles',
            'create_roles',
            'edit_roles',
            'delete_roles',
            'assign_permissions',
            'revoke_permissions',
            'view_payrolls',
            'create_payrolls',
            'edit_payrolls',
            'delete_payrolls',
            'update_payment_proof',
            'download_payment_proof',
            'update_status_payrolls',
            'generate_pay_slip',
            'download_pay_slip',
            'view_salary_slips',
            'view_users_trash',
            'restore_users',
            'delete_users_trash',
            'view_payrolls_trash',
            'restore_payrolls',
            'delete_payrolls_trash',
            'view_audits',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'administrator']);
        $adminRole->syncPermissions(Permission::all());

        $financeRole = Role::firstOrCreate(['name' => 'finance']);
        $financeRole->syncPermissions([
            'view_users',
            'view_payrolls',
            'create_payrolls',
            'edit_payrolls',
            'delete_payrolls',
            'update_payment_proof',
            'download_payment_proof',
            'generate_pay_slip',
            'download_pay_slip',
            'view_salary_slips',
            'view_payrolls_trash',
            'restore_payrolls',
            'delete_payrolls_trash',
        ]);

        $employeeRole = Role::firstOrCreate(['name' => 'employee']);
        $employeeRole->syncPermissions([
            'view_salary_slips',
            'download_pay_slip',
        ]);

        $hr = Department::firstOrCreate(['name' => 'HR']);
        $fnc = Department::firstOrCreate(['name' => 'Finance']);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@mail.com',
            'password' => bcrypt('password'),
            'department_id' => $hr->id,
        ]);
        $admin->assignRole('administrator');
        $admin->assignRole('employee');

        $finance = User::create([
            'name' => 'Finance User',
            'email' => 'finance@mail.com',
            'password' => bcrypt('password'),
            'department_id' => $fnc->id,
        ]);
        $finance->assignRole('finance');
        $finance->assignRole('employee');

        $employee = User::create([
            'name' => 'Employee User',
            'email' => 'employee@mail.com',
            'password' => bcrypt('password'),
            'department_id' => $fnc->id,
            'manager_id' => $finance->id,
        ]);
        $employee->assignRole('employee');
    }
}
