<?php

namespace App\Models;

use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    use LogsActivity;
    use HasFactory, Notifiable, HasUlids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'guard_name',
        'module_id',
        'is_active',
    ];
    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn($value) => Str::slug($value, '-'),
            // get: fn($value) => Str::headline(str_replace('-', ' ', $value)),
        );
    }
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

    public function getActivitylogOptions(): LogOptions
    {

        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "This {$this->id} model has been {$eventName}")
            ->useLogName(PERMISSION);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id', 'id');
    }
}
