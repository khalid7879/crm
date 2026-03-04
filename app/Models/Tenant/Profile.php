<?php

namespace App\Models\Tenant;

use App\Models\Tenant\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Profile extends Model
{
    use HasFactory, Notifiable, HasUlids, LogsActivity;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Fillable props
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'language',
        'salutation',
        'note',
        'photo',
        'telephone',
        'mobile_phone',
        'time_zone',
        'currency',
        'date_format',
        'time_format',
        'working_hours',
        'is_active',
    ];

    /**
     * Appended props
     *
     * @var array
     */
    protected $appends = ['model_time'];

    /**
     * Get model time
     */
    protected function modelTime(): Attribute
    {
        return new Attribute(
            get: fn() => ['create_diff' => $this->created_at->diffForHumans(), 'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'), 'update_diff' => $this->updated_at->diffForHumans(), 'update_formatted' => _dateFormat($this->updated_at, 'd M, Y (h:i A)')]
        );
    }

    /**
     * Get and set address
     *
     * @return MorphToMany
     */
    public function address(): MorphToMany
    {
        return $this->MorphToMany(Address::class, 'addressable');
    }
    
    /**
     * Model activity logs
     *
     * @return LogOptions
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "This {$this->id} model has been {$eventName}")
            ->useLogName(USER_PROFILE);
    }
}
