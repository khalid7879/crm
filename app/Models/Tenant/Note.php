<?php

namespace App\Models\Tenant;

use App\Traits\CleansUpMorphRelationsTrait;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Note Model
 *
 * Represents a note entity related to leads, tasks, opportunities, etc.
 *
 * Key Features:
 *  - Uses ULIDs for primary key
 *  - Tracks creation via Spatie Activity Log
 *  - Automatically cleans morph relations on delete
 *  - Provides a causer_name attribute for the note author
 *
 * @author Mamun
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class Note extends Model
{
    use HasFactory, Notifiable, HasUlids, LogsActivity;
    use CleansUpMorphRelationsTrait;

    /* --------------------------------------------------------------------------
        MODEL CONFIGURATION
    -------------------------------------------------------------------------- */
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'causer_id',
        'owner_id',
        'title',
        'details',
        'date_reminder',
        'is_active',
    ];

    /***
     * Accessors automatically appended to the model's array / JSON form
     */
    protected $appends = ['get_causer'];

    /* --------------------------------------------------------------------------
        ACTIVITY LOG CONFIGURATION
    -------------------------------------------------------------------------- */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(function (string $eventName) {
                $userName = Auth::user()?->name ?? 'System';
                $date = _dateFormat($this->created_at, 'd M Y, h:i:A');
                return "{$date} - Note '{$this->title}' was {$eventName} by '{$userName}'";
            })
            ->useLogName(NOTE);
    }

    /* --------------------------------------------------------------------------
        ACCESSORS / MUTATORS
    -------------------------------------------------------------------------- */

    /**
     * Return the causer's nickname if the relationship is preloaded.
     * Avoids N+1 by not triggering additional queries.
     */
    protected function getCauser(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('causer')
                ? ($this->causer?->nickname ?? '')
                : ''
        );
    }

    /* */

    /**
     *  --------------------------------------------------------------------------
     *   RELATIONSHIPS
     *--------------------------------------------------------------------------
     * - **causer()** → `belongsTo(Contact::class, 'causer_id')`  
     *   The contact or user who created this note.
     * 
     * - **associates()** → `morphToMany(Contact::class, 'associatable', 'associatables', 'associatable_id', 'contact_id')`  
     *   Contacts (users) associated with this note via the polymorphic `associatables` pivot table.
     * 
     * - **opportunities()** → `morphToMany(Opportunity::class, 'noteable')`  
     *   Opportunities linked to this note via the polymorphic `noteables` pivot table.
     */
    public function causer()
    {
        return $this->belongsTo(Contact::class, 'causer_id');
    }

    public function associates(): MorphToMany
    {
        return $this->morphToMany(Contact::class, 'associatable', 'associatables', 'associatable_id', 'contact_id')
            ->withTimestamps();
    }

    public function opportunities(): MorphToMany
    {
        return $this->morphToMany(Opportunity::class, 'noteable')->withTimestamps();
    }

    /* --------------------------------------------------------------------------
        MODEL EVENTS
    -------------------------------------------------------------------------- */

    /**
     * Automatically clean related pivot records when a note is deleted.
     */
    protected static function booted(): void
    {
        self::bootCleansUpMorphRelations([
            ['associatables', 'associatable_type', 'associatable_id'],
        ], Note::class);

        static::deleting(function ($note) {
            DB::table('noteables')
                ->where('note_id', $note->id)
                ->delete();
        });
    }
}
