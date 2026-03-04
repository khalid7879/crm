<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class DataCategory extends Model
{
    use LogsActivity;
    use HasFactory, Notifiable, HasUlids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'type',
        'is_active',
        'is_delete'
    ];

    /**
     * Accessors that should be appended to model's array/json
     *
     * @var array<int, string>
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


    /**
     * Get all of the lead
     */
    public function leads(): MorphToMany
    {
        return $this->MorphToMany(Lead::class, 'categoryable');
    }


    /**
     * Get all of the product
     */
    public function products(): MorphToMany
    {
        return $this->morphedByMany(
            Product::class,
            'categoryable',
            'categoryables',
            'data_category_id',
            'categoryable_id'
        );
    }



    /**
     * Get all of the opportunity
     */
    public function opportunity(): MorphToMany
    {
        return $this->MorphToMany(Opportunity::class, 'categoryable');
    }

    /**
     * Get all of the task
     */
    public function tasks(): MorphToMany
    {
        return $this->MorphToMany(Task::class, 'categoryable');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "This {$this->id} model has been {$eventName}")
            ->useLogName(DATA_CATEGORY);
    }
}
