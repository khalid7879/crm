<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\MorphPivot;

class Stageable extends MorphPivot
{
    protected $appends = ['causer_data'];

    public function causer()
    {
        return $this->belongsTo(Contact::class, 'creator_id');
    }

    public function getCauserDataAttribute()
    {
        return $this->causer
            ? [
                'id'   => $this->causer->id,
                'name' => $this->causer->name,
            ]
            : null;
    }
}
