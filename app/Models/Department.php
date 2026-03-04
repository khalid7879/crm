<?php

namespace App\Models;

use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

/**
 * Class Department
 *
 * Represents a department that can have many users associated with it.
 * Tracks activity logs using Spatie Activity Log.
 *
 * @package App\Models
 */
class Department extends Model
{
    use LogsActivity;
    use HasFactory, Notifiable, HasUlids;

    /**
     * Primary key type and settings
     */
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Mass assignable fields
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'is_active',
    ];


    public $touches = ['userDepartment'];

    /**
     * Accessors that should be appended to model's array/json
     *
     * @var array<int, string>
     */
    protected $appends = ['model_time', 'total_user', 'first_letter'];

    /* --------------------------------------------------------------------------
       ATTRIBUTE ACCESSORS / MUTATORS
       --------------------------------------------------------------------------
       - firstLetter: formatted first letter with bgColor
       - modelTime: formatted creation and update info
       - totalUser: count total users in this department
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

    protected function totalUser(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('userDepartment')
                ? $this->userDepartment->count()
                : ""
        );
    }

    /**
     * Activity log options for Spatie Activitylog
     *
     * @return \Spatie\Activitylog\LogOptions
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(
                fn(string $eventName) => "This department ({$this->id}) has been {$eventName}"
            )
            ->useLogName(DEPARTMENT);
    }

    /**
     * Relationship: Users that belong to this department
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     * 
     *   related model  pivot table, foreign key on pivot for Department, foreign key on pivot for User
     */

    public function userDepartment(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_departments',
            'department_id',
            'user_id'
        )->withTimestamps();
    }


    /**
     * Get and set associate (users)
     */
    public function associates(): MorphToMany
    {
        return $this->morphToMany(User::class, 'associatable')->withTimestamps();
    }
}
