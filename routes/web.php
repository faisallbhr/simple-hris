<?php

use App\Http\Controllers\PayrollController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SalarySlipController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [SalarySlipController::class, 'index'])->name('dashboard')->middleware('can:view_salary_slips');
    Route::get('salary-slip/{id}', [SalarySlipController::class, 'download'])->name('salary-slip.download')->middleware('can:download_pay_slip');

    Route::prefix('payrolls')->group(function () {
        Route::get('/', [PayrollController::class, 'index'])->name('payrolls.index')->middleware('can:view_payrolls');
        Route::get('/create', [PayrollController::class, 'create'])->name('payrolls.create')->middleware('can:create_payrolls');
        Route::get('/export', [PayrollController::class, 'export'])->name('payrolls.export')->middleware('can:view_payrolls');
        Route::post('/', [PayrollController::class, 'store'])->name('payrolls.store')->middleware('can:create_payrolls');
        Route::get('/{id}', [PayrollController::class, 'show'])->name('payrolls.show')->middleware('can:view_payrolls');
        Route::get('/{id}/edit', [PayrollController::class, 'edit'])->name('payrolls.edit')->middleware('can:edit_payrolls');
        Route::put('/{id}', [PayrollController::class, 'update'])->name('payrolls.update')->middleware('can:edit_payrolls');
        Route::patch('/{id}/status', [PayrollController::class, 'updateStatus'])->name('payrolls.updateStatus')->middleware('can:update_status_payrolls');
        Route::post('/{id}/payment-proof', [PayrollController::class, 'updatePaymentProof'])->name('payrolls.update-payment-proof')->middleware('can:create_payrolls');
        Route::get('/{id}/payment-proof', [PayrollController::class, 'downloadPaymentProof'])->name('payrolls.download-payment-proof')->middleware('can:create_payrolls');
        Route::get('/{id}/pay-slip', [PayrollController::class, 'generatePaySlip'])->name('payrolls.generatePaySlip')->middleware('can:create_payrolls');
        Route::delete('/{id}', [PayrollController::class, 'destroy'])->name('payrolls.destroy')->middleware('can:delete_payrolls');
    });

    Route::prefix('users')->group(function () {
        Route::get('/search', [UserController::class, 'search'])->name('users.search')->middleware('can:view_users');
        Route::get('/', [UserController::class, 'index'])->name('users.index')->middleware('can:view_users');
        Route::get('/create', [UserController::class, 'create'])->name('users.create')->middleware('can:create_users');
        Route::post('/', [UserController::class, 'store'])->name('users.store')->middleware('can:create_users');
        Route::post('/import', [UserController::class, 'import'])->name('users.import')->middleware('can:create_users');
        Route::get('/export', [UserController::class, 'export'])->name('users.export')->middleware('can:view_users');
        Route::get('/{id}', [UserController::class, 'show'])->name('users.show')->middleware('can:view_users');
        Route::get('/{id}/edit', [UserController::class, 'edit'])->name('users.edit')->middleware('can:edit_users');
        Route::put('/{id}', [UserController::class, 'update'])->name('users.update')->middleware('can:edit_users');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('can:delete_users');
    });

    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('roles.index')->middleware('can:view_roles');
        Route::post('/', [RoleController::class, 'store'])->name('roles.store')->middleware('can:create_roles');
        Route::put('/{id}', [RoleController::class, 'update'])->name('roles.update')->middleware('can:edit_roles,assign_permissions,revoke_permissions');
        Route::delete('/{id}', [RoleController::class, 'destroy'])->name('roles.destroy')->middleware('can:delete_roles');
    });

    Route::prefix('trash')->group(function () {
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('users.trash.index')->middleware('can:view_users_trash');
            Route::get('/{id}', [UserController::class, 'show'])->name('users.trash.show')->middleware('can:view_users_trash');
            Route::put('/{id}/restore', [UserController::class, 'restore'])->name('users.trash.restore')->middleware('can:restore_users');
            Route::delete('/{id}/force-delete', [UserController::class, 'forceDelete'])->name('users.trash.force-delete')->middleware('can:delete_users_trash');
        });

        Route::prefix('payrolls')->group(function () {
            Route::get('/', [PayrollController::class, 'index'])->name('payrolls.trash.index')->middleware('can:view_payrolls_trash');
            Route::get('/{id}', [PayrollController::class, 'show'])->name('payrolls.trash.show')->middleware('can:view_payrolls_trash');
            Route::put('/{id}/restore', [PayrollController::class, 'restore'])->name('payrolls.trash.restore')->middleware('can:restore_payrolls');
            Route::delete('/{id}/force-delete', [PayrollController::class, 'forceDelete'])->name('payrolls.trash.force-delete')->middleware('can:delete_payrolls_trash');
        });
    });


});
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
