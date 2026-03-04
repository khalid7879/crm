<?php

namespace App\Models\Tenant;

use Nnjeim\World\Models\Country;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SystemCountry extends Country
{
    /**
     * @return HasMany
     */
    public function currencies(): HasMany
    {
        $currencyClass = config('world.models.currencies');

        return $this->hasMany($currencyClass, 'country_id', 'id');
    }
}
