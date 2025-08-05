<?php

namespace App\Exports;

use App\Models\Payroll;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PayrollExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $columns;
    protected $filters;

    public function __construct($columns, $filters)
    {
        $this->columns = $columns;
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Payroll::with(['employee', 'employee.department', 'processedBy']);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }
        return $query;
    }

    public function headings(): array
    {
        $headings = [];
        $headingMap = [
            'employee_id' => 'Employee ID',
            'employee_name' => 'Employee Name',
            'period_start' => 'Period Start',
            'period_end' => 'Period End',
            'base_salary' => 'Base Salary',
            'net_salary' => 'Net Salary',
            'details' => 'Payroll Details',
            'status' => 'Status',
            'paid_at' => 'Paid At',
            'processed_by' => 'Processed By',
        ];

        foreach ($this->columns as $column) {
            $headings[] = $headingMap[$column] ?? $column;
        }

        return $headings;
    }

    public function map($payroll): array
    {
        $row = [];

        foreach ($this->columns as $column) {
            switch ($column) {
                case 'employee_id':
                    $row[] = $payroll->employee_id ?? '-';
                    break;
                case 'employee_name':
                    $row[] = $payroll->employee ? $payroll->employee->name : 'N/A';
                    break;
                case 'period_start':
                    $row[] = $payroll->period_start ? Carbon::parse($payroll->period_start)->format('Y-m-d') : '';
                    break;
                case 'period_end':
                    $row[] = $payroll->period_end ? Carbon::parse($payroll->period_end)->format('Y-m-d') : '';
                    break;
                case 'base_salary':
                    $row[] = number_format($payroll->base_salary, 0, ',', '.');
                    break;
                case 'net_salary':
                    $row[] = number_format($payroll->net_salary, 0, ',', '.');
                    break;
                case 'details':
                    if ($payroll->details) {
                        $details = json_decode($payroll->details, true);
                        $flattened = $this->flattenDetails($details);
                        $row[] = implode('; ', $flattened);
                    } else {
                        $row[] = '';
                    }
                    break;
                case 'status':
                    $row[] = ucfirst($payroll->status);
                    break;
                case 'paid_at':
                    $row[] = $payroll->paid_at ? Carbon::parse($payroll->paid_at)->format('Y-m-d H:i:s') : '';
                    break;
                case 'processed_by':
                    $row[] = $payroll->processedBy ? $payroll->processedBy->name : '';
                    break;
                default:
                    $row[] = $payroll->{$column} ?? '';
                    break;
            }
        }

        return $row;
    }

    public function styles(Worksheet $sheet)
    {
        return;
    }

    private function flattenDetails(array $details, string $prefix = ''): array
    {
        $formatted = [];

        foreach ($details as $key => $value) {
            $label = ucfirst(str_replace('_', ' ', $key));

            if (is_array($value)) {
                $nested = $this->flattenDetails($value, $prefix . $label . ' - ');
                $formatted = array_merge($formatted, $nested);
            } else {
                $formatted[] = $prefix . $label . ': ' . $value;
            }
        }

        return $formatted;
    }

}