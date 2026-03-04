<?php

namespace App\Models\Tenant;

use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;


class SocialLink extends Model
{
    use HasFactory, Notifiable, HasUlids, LogsActivity;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Mass assignable props
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'icon',
        'order',
        'is_active',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['model_time'];

    /* ======================================================
     |  ATTRIBUTE ACCESSORS
     |  - modelTime        → Human readable timestamps
     ====================================================== */
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
     * Activity log
     *
     * @return LogOptions
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "This {$this->id} model has been {$eventName}")
            ->useLogName(SOCIAL_LINK);
    }


    /**
     * Get related leads
     *
     * @return MorphToMany
     */
    public function leads(): MorphToMany
    {
        return $this->morphedByMany(Lead::class, 'socialable');
    }


    /**
     * Get related organization
     *
     * @return MorphToMany
     */
    public function organization(): MorphToMany
    {
        return $this->morphedByMany(Organization::class, 'socialable');
    }

    /**
     * Get related contact
     *
     * @return MorphToMany
     */
    public function contacts(): MorphToMany
    {
        return $this->morphedByMany(Contact::class, 'socialable');
    }
}
