<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalarySlip extends Model
{
    use HasUuids, SoftDeletes;
    protected $guarded = ['id'];
    protected $casts = [
        'slip_data' => 'array',
    ];

    public function payroll()
    {
        return $this->belongsTo(Payroll::class);
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }
}
