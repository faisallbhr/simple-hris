<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use OwenIt\Auditing\Contracts\Auditable as AuditContract;
use OwenIt\Auditing\Auditable as AuditTrait;

class User extends Authenticatable implements AuditContract
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasUuids, SoftDeletes, AuditTrait;

    protected $dates = ['deleted_at'];
    public string|null $note = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'manager_id',
        'department_id',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted()
    {
        static::deleting(function ($user) {
            if (!$user->isForceDeleting()) {
                User::where('manager_id', $user->id)
                    ->whereNull('deleted_at')
                    ->update(['manager_id' => null]);
            }
        });
    }

    public function transformAudit(array $data): array
    {
        if ($this->note) {
            $data['note'] = $this->note;
        }

        return $data;
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class, 'employee_id');
    }

    public function salarySlips()
    {
        return $this->hasMany(SalarySlip::class);
    }
}
