<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class TaskHistory extends Model
{
    use HasUlids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'task_id',
        'causer_id',
        'owner_id',
        'name',
        'details',
        'date_start',
        'date_due',
        'date_reminder',
        'progress_percent',
        'is_sample',
        'is_active'
    ];
    protected $casts = [
        'date_start'       => 'datetime',
        'date_due'         => 'datetime',
        'date_reminder'    => 'datetime',
        'progress_percent' => 'float',
    ];

    protected $appends = [
        'get_category',
        'get_stage',
        'get_priority',
        'get_associates_name',
        'model_time'
    ];

    protected function modelTime(): Attribute
    {
        return new Attribute(
            get: fn() => $this->created_at
                ? [
                    'create_diff'      => $this->created_at->diffForHumans(),
                    'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                    'create_date_only' => _dateFormat($this->created_at, 'd M Y'),
                    'update_diff'      => $this->updated_at ? $this->updated_at->diffForHumans() : "",
                    'update_formatted' => $this->updated_at ? _dateFormat($this->updated_at, 'd M, Y (h:i A)') : "",
                ]
                : ""
        );
    }
    protected function dateDue(): Attribute
    {
        return new Attribute(
            get: fn($value) => !empty($value) ? _dateFormat($value, 'Y-m-d') : ''
        );
    }

    protected function dateStart(): Attribute
    {
        return new Attribute(
            set: fn($value) => $value ? $value : now(),
            get: fn($value) => !empty($value) ? _dateFormat($value, 'Y-m-d') : ''
        );
    }

    protected function dateReminder(): Attribute
    {
        return new Attribute(
            set: fn($value) => $value ? $value : now(),
            get: fn($value) => !empty($value) ? _dateFormat($value, 'Y-m-d H:i') : ''
        );
    }


    protected function getCategory(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('categories')
                ? $this->categories->sortByDesc('pivot.created_at')->first()
                : ""
        );
    }
    protected function getStage(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('stages')
                ? $this->stages->sortByDesc('pivot.created_at')->first()
                : ""
        );
    }
    protected function getPriority(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('priorities')
                ? $this->priorities->sortByDesc('pivot.created_at')->first()
                : ""
        );
    }

    protected function getAssociatesName(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) =>
            $this->relationLoaded('associates')
                ? $this->associates->pluck('nickname')->implode(', ')
                : ''
        );
    }

    public function stages(): MorphToMany
    {
        return $this->morphToMany(Stage::class, 'stageable', 'stageables', 'stageable_id', 'stage_id')->withTimestamps();
    }


    public function tasks(): MorphToMany
    {
        return $this->morphToMany(Task::class, 'taskable', 'taskables')
            ->withTimestamps()
            ->select('tasks.*');
    }


    public function associates(): MorphToMany
    {
        return $this->morphToMany(Contact::class, 'associatable', 'associatables', 'associatable_id', 'contact_id')
            ->withTimestamps();
    }

    public function priorities(): MorphToMany
    {
        return $this->morphToMany(DataPriority::class, 'priorityable', 'priorityables')
            ->withTimestamps();
    }
    public function categories(): MorphToMany
    {
        return $this->morphToMany(DataCategory::class, 'categoryable', 'categoryables')
            ->withTimestamps();
    }

    public function owner()
    {
        return $this->belongsTo(Contact::class, 'owner_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
}
