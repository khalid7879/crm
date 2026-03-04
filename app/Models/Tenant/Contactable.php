<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class Contactable extends Model
{
    protected $table = 'contactables';

    public function contactable()
    {
        return $this->morphTo();
    }
}
