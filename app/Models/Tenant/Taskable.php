<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;


class Taskable extends Model
{
    protected $table = 'taskables';

    public function taskable()
    {
        return $this->morphTo();
    }
}
