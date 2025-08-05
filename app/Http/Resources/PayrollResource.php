<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollResource extends JsonResource
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
            'employee' => [
                'id' => $this->employee?->id,
                'name' => $this->employee?->name,
                'email' => $this->employee?->email,
                'department' => $this->employee?->department?->name,
            ],
            'period_start' => $this->period_start,
            'period_end' => $this->period_end,
            'base_salary' => $this->base_salary,
            'details' => $this->details,
            'net_salary' => $this->net_salary,
            'status' => $this->status,
            'notes' => $this->notes,
            'payment_proof' => $this->payment_proof,
            'paid_at' => $this->paid_at,
            'processed_by' => [
                'id' => $this->processedBy->id,
                'name' => $this->processedBy->name
            ],
            'is_generated' => $this->is_generated,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
