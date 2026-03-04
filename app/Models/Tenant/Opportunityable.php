<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class Opportunityable extends Model
{
    protected $table = 'opportunityables';

    public function opportunityable()
    {
        return $this->morphTo();
    }
}
