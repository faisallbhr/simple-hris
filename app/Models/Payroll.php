<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditContract;
use OwenIt\Auditing\Auditable as AuditTrait;

class Payroll extends Model implements AuditContract
{
    use HasUuids, SoftDeletes, AuditTrait;
    protected $guarded = ['id'];
    protected $dates = ['deleted_at'];
    public string|null $note = null;

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function salarySlip()
    {
        return $this->hasOne(SalarySlip::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function transformAudit(array $data): array
    {
        if ($this->note) {
            $data['note'] = $this->note;
        }

        return $data;
    }
}
