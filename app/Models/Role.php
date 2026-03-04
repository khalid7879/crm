<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Models\Role as SpatieRole;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Role extends SpatieRole
{
    use LogsActivity;
    use HasFactory, Notifiable, HasUlids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'guard_name',
        'note',
        'is_active',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['model_time', 'first_letter'];

    /* --------------------------------------------------------------------------
       ATTRIBUTE ACCESSORS / MUTATORS
       --------------------------------------------------------------------------
       - firstLetter: formatted first letter with bgColor
       - modelTime: formatted creation and update info
    -------------------------------------------------------------------------- */
    protected function firstLetter(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'letter'  => $this->name ? Str::substr($this->name, 0, 1) : '',
                'bgColor' => $this->name
                    ? _getAlphabeticalColorName(Str::substr($this->name, 0, 1))
                    : 'gray',
            ]
        );
    }
    protected function modelTime(): Attribute
    {
        return new Attribute(
            get: fn() => [
                'create_diff'       => $this->created_at->diffForHumans(),
                'create_formatted'  => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                'create_date'  => _dateFormat($this->created_at, 'd M Y'),
                'update_diff'       => $this->updated_at->diffForHumans(),
                'update_formatted'  => _dateFormat($this->updated_at, 'd M, Y (h:i A)'),
                'update_date'  => _dateFormat($this->updated_at, 'd M Y'),
            ]
        );
    }
    public function getActivitylogOptions(): LogOptions
    {

        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "This {$this->id} model has been {$eventName}")
            ->useLogName(ROLE);
    }
}
