<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Models\Role as SpatieRole;
use OwenIt\Auditing\Contracts\Auditable as AuditContract;
use OwenIt\Auditing\Auditable as AuditTrait;

class Role extends SpatieRole implements AuditContract
{
    use HasUuids, AuditTrait;
    public string|null $note = null;

    public function transformAudit(array $data): array
    {
        if ($this->note) {
            $data['note'] = $this->note;
        }

        return $data;
    }
}
