<?php

namespace App\Models\Tenant;

use Nnjeim\World\Models\Country;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Address extends Model
{
    use HasFactory, Notifiable, HasUlids;

    protected $fillable = [
        'addressable_id',
        'addressable_type',
        'country',
        'city',
        'state',
        'post_code',
        'type',
        'street'
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['model_time'];

    /**
     * Custom model timing
     */
    protected function modelTime(): Attribute
    {
        return new Attribute(
            get: fn() => ['create_diff' => $this->created_at->diffForHumans(), 'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'), 'update_diff' => $this->updated_at->diffForHumans(), 'update_formatted' => _dateFormat($this->updated_at, 'd M, Y (h:i A)')]
        );
    }

    /**
     * Get the parent model
     */
    public function addressable(): MorphTo
    {
        return $this->morphTo();
    }
}
