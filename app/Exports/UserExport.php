<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UserExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $columns;
    protected $filters;

    public function __construct($columns, $filters = [])
    {
        $this->columns = $columns;
        $this->filters = $filters;
    }

    public function query()
    {
        $query = User::with(['manager', 'department']);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
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
            'name' => 'Name',
            'email' => 'Email',
            'manager_name' => 'Manager',
            'department_name' => 'Department',
        ];

        foreach ($this->columns as $column) {
            $headings[] = $headingMap[$column] ?? $column;
        }

        return $headings;
    }

    public function map($user): array
    {
        $row = [];

        foreach ($this->columns as $column) {
            switch ($column) {
                case 'name':
                    $row[] = $user->name;
                    break;
                case 'email':
                    $row[] = $user->email;
                    break;
                case 'manager_name':
                    $row[] = $user->manager?->name ?? '-';
                    break;
                case 'department_name':
                    $row[] = $user->department?->name ?? '-';
                    break;
                default:
                    $row[] = '';
            }
        }

        return $row;
    }

    public function styles(Worksheet $sheet)
    {
        return;
    }
}