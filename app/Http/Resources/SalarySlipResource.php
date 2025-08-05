<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalarySlipResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_name' => $this->employee?->name,
            'slip_data' => [
                'period' => [
                    'start' => $this->slip_data['period']['start'] ?? null,
                    'end' => $this->slip_data['period']['end'] ?? null,
                ],
                'base_salary' => (float) ($this->slip_data['base_salary'] ?? 0),
                'bonus' => (float) ($this->slip_data['bonus'] ?? 0),
                'allowances' => (array) ($this->slip_data['allowances'] ?? []),
                'deductions' => (array) ($this->slip_data['deductions'] ?? []),
                'net_salary' => (float) ($this->slip_data['net_salary'] ?? 0),
            ],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
