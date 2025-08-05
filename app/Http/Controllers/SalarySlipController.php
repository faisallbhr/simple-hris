<?php

namespace App\Http\Controllers;

use App\Http\Resources\SalarySlipResource;
use App\Models\SalarySlip;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalarySlipController extends Controller
{
    public function index()
    {
        $salarySlips = SalarySlip::with('employee')
            ->where('employee_id', auth()->user()->id)
            ->latest()
            ->paginate(10);

        $yearlySlips = SalarySlip::where('employee_id', auth()->user()->id)
            ->whereYear('created_at', now()->year)
            ->latest()
            ->get();

        $yearlyStats = [
            'total_earned' => $yearlySlips->sum(function ($slip) {
                return $slip->slip_data['net_salary'] ?? 0;
            }),
            'total_slips' => $yearlySlips->count(),
            'last_payment' => $yearlySlips->first()?->slip_data['net_salary'] ?? 0,
        ];

        return Inertia::render('dashboard', [
            'salarySlips' => SalarySlipResource::collection($salarySlips),
            'yearlyStats' => $yearlyStats,
        ]);
    }

    public function download($id)
    {
        $salarySlip = SalarySlip::with('employee')->findOrFail($id);
        $pdf = Pdf::loadView('pdf.salary_slip', [
            'slip' => $salarySlip,
            'employeeName' => $salarySlip->employee?->name
        ]);

        $fileName = "salary-slip-{$salarySlip->id}.pdf";
        return $pdf->download($fileName);
    }
}
