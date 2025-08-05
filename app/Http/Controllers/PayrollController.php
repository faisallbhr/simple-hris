<?php

namespace App\Http\Controllers;

use App\Exports\PayrollExport;
use App\Http\Resources\AuditResource;
use App\Http\Resources\PayrollResource;
use App\Models\SalarySlip;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use DB;
use Event;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use OwenIt\Auditing\Events\AuditCustom;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $routeName = $request->route()->getName();
        $isTrashed = $routeName === 'payrolls.trash.index';

        $query = Payroll::with(['employee', 'employee.department', 'processedBy'])
            ->leftJoin('users', 'payrolls.employee_id', '=', 'users.id')
            ->leftJoin('departments', 'users.department_id', '=', 'departments.id')
            ->select('payrolls.*');

        if ($isTrashed) {
            $query->onlyTrashed();
        }

        if ($search = $request->input('search')) {
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            });
        }

        if ($statuses = $request->input('status')) {
            $statusArray = explode(',', $statuses);
            $query->whereIn('status', $statusArray);
        }

        $sort = $request->input('sort') ?: 'created_at';
        $direction = $request->input('direction') ?: 'desc';

        if ($sort === 'employee_name') {
            $query->orderBy('users.name', $direction);
        } elseif ($sort === 'employee_department') {
            $query->orderBy('departments.name', $direction);
        } else {
            $query->orderBy("payrolls.$sort", $direction);
        }

        $payrolls = $query->when($user->hasRole('finance'), function ($q) {
            $q->where('processed_by', auth()->user()->id);
        })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render($isTrashed ? 'trash/payroll/index' : 'payroll/index', [
            'payrolls' => PayrollResource::collection($payrolls)->additional([
                'meta' => [
                    'search' => $search,
                    'status' => $request->input('status') ? explode(',', $request->input('status')) : [],
                ]
            ])
        ]);
    }

    public function create()
    {
        return Inertia::render('payroll/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|uuid|exists:users,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'base_salary' => 'required|numeric',
            'details' => 'nullable|json',
        ]);

        $existingPayroll = Payroll::where('employee_id', $data['employee_id'])
            ->where(function ($query) use ($data) {
                $query->whereBetween('period_start', [$data['period_start'], $data['period_end']])
                    ->orWhereBetween('period_end', [$data['period_start'], $data['period_end']])
                    ->orWhere(function ($q) use ($data) {
                        $q->where('period_start', '<=', $data['period_start'])
                            ->where('period_end', '>=', $data['period_end']);
                    });
            })
            ->exists();

        if ($existingPayroll) {
            return redirect()->back()->with('error', 'Payroll for this period already exists.');
        }

        $netSalary = $this->calculateNetSalary($data['base_salary'], $data['details']);

        $payroll = new Payroll();
        $payroll->fill([
            'employee_id' => $data['employee_id'],
            'period_start' => $data['period_start'],
            'period_end' => $data['period_end'],
            'base_salary' => $data['base_salary'],
            'details' => $data['details'] ?? null,
            'net_salary' => $netSalary,
            'processed_by' => auth()->user()->id
        ]);

        $payroll->note = 'Payroll created by ' . auth()->user()->name;
        $payroll->save();

        return redirect()->route('payrolls.index')->with('success', 'Payroll created successfully.');
    }

    public function show(Request $request, string $id)
    {
        $routeName = $request->route()->getName();
        $isTrashed = $routeName === 'payrolls.trash.show';

        $payroll = Payroll::when($isTrashed, fn($q) => $q->withTrashed())
            ->with(['employee', 'employee.department', 'processedBy'])
            ->findOrFail($id);

        $audits = $payroll->audits()->latest()->paginate(10);

        return Inertia::render($isTrashed ? 'trash/payroll/show' : 'payroll/show', [
            'payroll' => (new PayrollResource($payroll))->resolve(),
            'audits' => AuditResource::collection($audits),
        ]);
    }

    public function edit($id)
    {
        $payroll = Payroll::with(['employee', 'employee.department', 'processedBy'])->findOrFail($id);
        return Inertia::render('payroll/edit', [
            'payroll' => (new PayrollResource($payroll))->resolve(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'employee_id' => 'required|uuid|exists:users,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'base_salary' => 'required|numeric',
            'details' => 'nullable|json',
        ]);

        $payroll = Payroll::findOrFail($id);

        $existingPayroll = Payroll::where('employee_id', $data['employee_id'])
            ->where('id', '!=', $payroll->id)
            ->where(function ($query) use ($data) {
                $query->whereBetween('period_start', [$data['period_start'], $data['period_end']])
                    ->orWhereBetween('period_end', [$data['period_start'], $data['period_end']])
                    ->orWhere(function ($q) use ($data) {
                        $q->where('period_start', '<=', $data['period_start'])
                            ->where('period_end', '>=', $data['period_end']);
                    });
            })
            ->exists();

        if ($existingPayroll) {
            return redirect()->back()->with('error', 'Another payroll for this period already exists.');
        }

        $netSalary = $this->calculateNetSalary($data['base_salary'], $data['details']);

        $payroll->fill([
            'employee_id' => $data['employee_id'],
            'period_start' => $data['period_start'],
            'period_end' => $data['period_end'],
            'base_salary' => $data['base_salary'],
            'details' => $data['details'] ?? null,
            'net_salary' => $netSalary,
            'processed_by' => auth()->user()->id
        ]);

        $payroll->note = 'Payroll updated by ' . auth()->user()->name;
        $payroll->save();

        return redirect()->route('payrolls.show', $payroll)->with('success', 'Payroll updated successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string|max:1000',
        ]);

        $payroll = Payroll::findOrFail($id);

        $payroll->fill([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        $payroll->note = 'Payroll status updated by ' . auth()->user()->name;
        $payroll->save();

        return redirect()->route('payrolls.show', $payroll)->with('success', 'Payroll status updated successfully.');
    }

    public function updatePaymentProof(Request $request, $id)
    {
        $request->validate([
            'payment_proof' => [
                'required',
                'mimes:pdf',
                function ($attribute, $value, $fail) {
                    if ($value && $value->getSize() < 102400) {
                        $fail('The payment proof must be at least 100KB.');
                    }

                    if ($value && $value->getSize() > 512000) {
                        $fail('The payment proof may not be greater than 500KB.');
                    }
                },
            ],
        ]);

        $payroll = Payroll::findOrFail($id);

        if ($payroll->status !== 'approved') {
            return redirect()->back()->with('error', 'Only approved payrolls can be updated.');
        }

        if (!$payroll->is_generated) {
            return redirect()->back()->with('error', 'Only generated payrolls can be updated.');
        }

        $path = Storage::disk('public')->putFile('payment_proofs', $request->file('payment_proof'));

        $payroll->fill([
            'payment_proof' => $path,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $payroll->note = 'Payment proof uploaded by ' . auth()->user()->name;
        $payroll->save();

        return redirect()->route('payrolls.show', $payroll)->with('success', 'Payment proof updated successfully.');
    }

    public function downloadPaymentProof($id)
    {
        $payroll = Payroll::findOrFail($id);

        $payroll->auditEvent = 'downloaded';
        $payroll->note = 'Payment proof downloaded by ' . auth()->user()->name;
        $payroll->isCustomEvent = true;
        Event::dispatch(new AuditCustom($payroll));

        $filePath = storage_path('app/public/' . $payroll->payment_proof);
        return response()->download($filePath);
    }

    public function generatePaySlip($id)
    {
        $payroll = Payroll::findOrFail($id);

        if ($payroll->status !== 'approved') {
            return redirect()->back()->with('error', 'Only approved payrolls can be generated.');
        }

        DB::beginTransaction();

        try {
            $details = is_array($payroll->details) ? $payroll->details : json_decode($payroll->details, true);

            $slip = SalarySlip::create([
                'payroll_id' => $payroll->id,
                'employee_id' => $payroll->employee_id,
                'slip_data' => [
                    'period' => [
                        'start' => Carbon::parse($payroll->period_start)->toDateString(),
                        'end' => Carbon::parse($payroll->period_end)->toDateString(),
                    ],
                    'base_salary' => $payroll->base_salary,
                    'bonus' => $details['bonus'] ?? 0,
                    'allowances' => $details['allowances'] ?? [],
                    'deductions' => $details['deductions'] ?? [],
                    'net_salary' => $payroll->net_salary,
                ],
            ]);

            $employeeName = User::find($payroll->employee_id)->name;

            $payroll->fill([
                'is_generated' => true
            ]);

            $payroll->note = 'Payroll generated by ' . auth()->user()->name;
            $payroll->save();

            $pdf = Pdf::loadView('pdf.salary_slip', [
                'slip' => $slip,
                'employeeName' => $employeeName
            ]);
            $fileName = "payslip-{$payroll->id}.pdf";

            DB::commit();
            return $pdf->download($fileName);
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'An error occurred while generating the pay slip.');
        }
    }

    public function destroy($id)
    {
        $payroll = Payroll::findOrFail($id);
        if ($payroll->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending payrolls can be deleted.');
        }

        $payroll->note = 'Payroll deleted by ' . auth()->user()->name;
        $payroll->delete();
        return redirect()->route('payrolls.index')->with('success', 'Payroll deleted successfully.');
    }

    public function restore($id)
    {
        $payroll = Payroll::withTrashed()->findOrFail($id);
        $existingPayroll = Payroll::where('employee_id', $payroll->employee_id)
            ->where(function ($query) use ($payroll) {
                $query->whereBetween('period_start', [$payroll->period_start, $payroll->period_end])
                    ->orWhereBetween('period_end', [$payroll->period_start, $payroll->period_end])
                    ->orWhere(function ($q) use ($payroll) {
                        $q->where('period_start', '<=', $payroll->period_start)
                            ->where('period_end', '>=', $payroll->period_end);
                    });
            })
            ->exists();

        if ($existingPayroll) {
            return redirect()->route('payrolls.trash.show', $id)->with('error', 'Payroll for the same employee already exists.');
        }

        $payroll->note = 'Payroll restored by ' . auth()->user()->name;
        $payroll->restore();
        return redirect()->route('payrolls.trash.index')->with('success', 'Payroll restored successfully.');
    }

    public function forceDelete($id)
    {
        $payroll = Payroll::withTrashed()->findOrFail($id);
        $payroll->note = 'Payroll deleted permanently by ' . auth()->user()->name;
        $payroll->forceDelete();
        return redirect()->route('payrolls.trash.index')->with('success', 'Payroll deleted permanently.');
    }

    public function export(Request $request)
    {
        $data = $request->validate([
            'format' => 'required|in:xlsx,csv',
            'columns' => 'required|array|min:1',
            'columns.*' => 'in:employee_id,employee_name,period_start,period_end,base_salary,net_salary,details,status,paid_at,processed_by',
            'filters' => 'sometimes|array',
            'filters.search' => 'sometimes|string|nullable',
            'filters.date_from' => 'sometimes|date|nullable',
            'filters.date_to' => 'sometimes|date|nullable',
            'filters.status' => 'sometimes|string|nullable',
        ]);

        $filename = 'export_payrolls_' . now()->format('Y_m_d_H_i_s') . '.' . $data['format'];

        return Excel::download(
            new PayrollExport(
                $data['columns'],
                $data['filters'] ?? [],
            ),
            $filename
        );
    }

    private function calculateNetSalary($baseSalary, $details)
    {
        $details = json_decode($details, true);

        if (is_null($details)) {
            return $baseSalary;
        }

        $allowances = array_sum($details['allowances'] ?? []);
        $deductions = array_sum($details['deductions'] ?? []);
        $bonus = $details['bonus'] ?? 0;

        return $baseSalary + $allowances - $deductions + $bonus;
    }
}