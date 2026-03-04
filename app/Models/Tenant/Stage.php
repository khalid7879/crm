<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Stage extends Model
{
    use LogsActivity;
    use HasFactory, Notifiable, HasUlids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'label',
        'type',
        'order',
        'stage_percent',
        'is_default',
        'is_final_stage',
        'is_delete',
        'is_active',
        'resolution_hours',
        'resolution_days'

    ];
    
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['first_letter', 'model_time'];


    /* ======================================================
     |  ATTRIBUTE ACCESSORS
     |  - firstLetter: formatted first letter with bgColor
     |  - modelTime        → Human readable timestamps
     ====================================================== */
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
            ->useLogName(STAGE);
    }

    /**
     * Get all of the leads
     */
    public function leads()
    {
        return $this->morphedByMany(Lead::class, 'stageable', 'stageables', 'stage_id', 'stageable_id')
            ->using(Stageable::class)
            ->withPivot('id', 'causer_id', 'duration', 'created_at', 'updated_at')
            ->withTimestamps();
    }

    /**
     * Get all of the Task
     */
    public function tasks()
    {
        return $this->morphedByMany(Task::class, 'stageable', 'stageables', 'stage_id', 'stageable_id')
            ->using(Stageable::class)
            ->withPivot('causer_id', 'duration', 'created_at', 'updated_at')
            ->withTimestamps();
    }

    /**
     * Get all of the opportunity
     */
    public function opportunity()
    {
        return $this->morphedByMany(Opportunity::class, 'stageable', 'stageables', 'stage_id', 'stageable_id')
            ->using(Stageable::class)
            ->withPivot('id', 'causer_id', 'duration', 'created_at', 'updated_at')
            ->withTimestamps();
    }
}
