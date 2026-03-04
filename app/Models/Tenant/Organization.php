<?php

namespace App\Models\Tenant;

use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Traits\CleansUpMorphRelationsTrait;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Class Organization
 *
 * Represents a tenant's organization.
 * Provides relationships to leads, contacts, opportunities, associates, tags, socials, and address.
 * Appended attributes are used for frontend display and convenience.
 *
 * @package App\Models\Tenant
 *
 * @property string $id
 * @property string $name
 * @property bool $is_active
 * @property bool $hidden
 * @property string|null $creator_id
 * @property string|null $owner_id
 * @property string|null $phone
 * @property string|null $website
 * @property string|null $description
 * 
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class Organization extends Model
{
    use HasFactory, Notifiable, HasUlids, LogsActivity;
    use CleansUpMorphRelationsTrait;

    /** ---------------- PRIMARY KEY SETTINGS ---------------- */
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    /** ---------------- MASS ASSIGNABLE ---------------- */
    protected $fillable = [
        'name',
        'is_active',
        'hidden',
        'causer_id',
        'owner_id',
        'mobile_number',
        'website',
        'details',
        'is_sample'
    ];

    /** ---------------- APPENDED ATTRIBUTES ---------------- */
    protected $appends = [
        'model_time',
        'actions_links',
        'first_letter',
        'get_opportunity_socials',
        'get_tags',
        'get_tag_names',
        'get_associates',
        'owner_name',
        'get_organization_stats',
        'get_organization_name',
        'get_associated_persons',
        'get_associates_name',
        'get_tags_name',
        'get_status'
    ];

    /** ---------------- ATTRIBUTE ACCESSORS ----------------
     * Provides additional attributes for frontend convenience:
     * - model_time: human-readable created_at / updated_at
     * - first_letter: first character of name with background color
     * - get_tags: collection of tags (if loaded)
     * - get_tag_names: array of tag names (if loaded)
     * - get_associates: array of associate IDs (if loaded)
     * - actions_links: frontend edit/delete URLs
     * - get_opportunity_socials: mapped social links (if loaded)
     * - owner_name: owner's nickname (if loaded)
     */

    public function getActivitylogOptions(): LogOptions
    {

        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(function (string $eventName) {
                $userName = Auth::user()?->name ?? 'System';
                $date = _dateFormat($this->created_at, 'd M Y, h:i:A');
                return "{$date} - Organization '{$this->title}' was created by user '{$userName}'";
            })
            ->useLogName(ORGANIZATION);
    }

    protected function modelTime(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'create_diff'      => $this->created_at?->diffForHumans(),
                'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                'update_diff'      => $this->updated_at?->diffForHumans(),
                'update_formatted' => _dateFormat($this->updated_at, 'd M, Y (h:i A)'),
                'create_date_only' => _dateFormat($this->created_at, 'd-M-Y'),
            ]
        );
    }

    protected function firstLetter(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'letter'  => Str::substr($this->name, 0, 1),
                'bgColor' => _getAlphabeticalColorName(Str::substr($this->name, 0, 1)),
            ]
        );
    }

    protected function getTags(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('tags')
                ? $this->tags
                : collect()
        );
    }

    protected function getTagNames(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('tags')
                ? $this->tags->pluck('name')->toArray()
                : []
        );
    }

    protected function getAssociates(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('associates')
                ? $this->associates->pluck('id')->toArray()
                : []
        );
    }

    protected function actionsLinks(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'edit'   => route('tenant.organization.edit', [
                    'organization' => $this->id,
                    'tenant'       => tenant('id'),
                ]),
                'delete' => '',
            ]
        );
    }

    protected function getOpportunitySocials(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('socials')
                ? collect($this->socials)->mapWithKeys(fn($item) => [
                    $item->id => [
                        "name"  => $item->name,
                        "icon"  => $item->icon,
                        "order" => $item->order,
                        "value" => $item->pivot->url ?? "",
                    ],
                ])->toArray()
                : []
        );
    }

    protected function getOrganizationName(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->name ?? ''
        );
    }
    protected function getAssociatedPersons(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('associates')
                ? $this->associates
                ->sortBy('nickname')
                ->map(fn($person) => [
                    'avatar'      => '',
                    'icon'        => '',
                    'name'        => $person->nickname ?? $person->name ?? '',
                    'designation' => $person->designation ?? '',
                    'email'       => $person->email ?? '',
                ])->values()->toArray()
                : []
        );
    }

    protected function getOrganizationStats(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'primary' => [
                    [
                        'label' => 'Organization owner',
                        'value' => $this->relationLoaded('owner')
                            ? ($this->owner?->nickname ?? '')
                            : '',
                        'icon'  => 'usersOwner',
                    ],

                    [
                        'label' => 'Created at',
                        'value' => $this->model_time['create_formatted'] ?? '',
                        'icon'  => 'date',
                    ],
                    [
                        'label' => 'Last modified',
                        'value' => $this->model_time['update_formatted'] ?? '',
                        'icon'  => 'date',
                    ],
                ],
                'secondary' => [
                    [
                        'label' => 'Associates',
                        'value' => $this->relationLoaded('associates')
                            ? $this->associates->count()
                            : 0,
                        'icon'  => 'users',
                    ],
                    [
                        'label' => 'Tasks',
                        'value' => $this->relationLoaded('tasks')
                            ? $this->tasks->count()
                            : 0,
                        'icon'  => 'task',
                    ],
                    [
                        'label' => 'Notes',
                        'value' =>  $this->relationLoaded('notes')
                            ? $this->notes->count()
                            : 0,
                        'icon'  => 'note',
                    ],
                ],
                'overview' => [

                    [
                        'label' => 'Organization',
                        'value' => $this->get_organization_name ?? 'N/A',
                        'icon'  => 'organization',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Mobile',
                        'value' => $this->mobile_number ?? 'N/A',
                        'icon'  => 'mobile',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Organization life',
                        'value' => ceil($this->created_at->floatDiffInDays(now())) . ' days',
                        'icon'  => 'heart',
                        'summary' => 'Created: ' . $this->model_time['create_date_only']
                    ],

                    [
                        'label' => 'Created at',
                        'value' => $this->model_time['create_diff'] ?: 'N/A',
                        'icon'  => 'dateCreated',
                        'summary' => $this->model_time['create_formatted'] ?: ""
                    ],
                    [
                        'label' => 'Last modified',
                        'value' => $this->model_time['update_diff'] ?: 'N/A',
                        'icon'  => 'dateUpdated',
                        'summary' => $this->model_time['update_formatted'] ?: ""
                    ],


                ],

                'modelData' => [
                    'name' => ucwords($this->get_organization_name),
                    'summary' => $this->details ? _getSubString($this->details, 170, true, options: ['preserveWords' => true]) : "",
                    'details' => $this->details,
                    'created_at' => $this->model_time['create_diff'] ?: 'N/A',
                    'updated_at' => $this->model_time['update_diff'] ?: 'N/A'
                ]
            ]
        );
    }

    protected function ownerName(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('owner')
                ? ($this->owner?->nickname ?? '')
                : ''
        );
    }
    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn($value) => ucfirst($value)
        );
    }

    protected function getAssociatesName(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('associates')
                ? $this->associates->pluck('nickname')->implode(', ')
                : ''
        );
    }

    protected function getTagsName(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) =>
            $this->relationLoaded('tags')
                ? $this->tags->pluck('name')->implode(', ')
                : ''
        );
    }

    protected function getStatus(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) => ($attributes['is_active'] ?? 0) ? 'Active' : 'Inactive'
        );
    }


    /** ---------------- RELATIONSHIPS ----------------
     * Eloquent relationships:
     * - leads: MorphToMany with Lead
     * - contacts: MorphToMany with Contact
     * - opportunities: MorphToMany with Opportunity
     * - associates: MorphToMany with Contact (associates)
     * - tags: MorphToMany with Tag
     * - socials: MorphToMany with SocialLink
     * - address: MorphOne with Address
     * - owner: BelongsTo Contact
     */
    public function leads(): MorphToMany
    {
        return $this->morphedByMany(Lead::class, 'organizationable', 'organizationables')
            ->withTimestamps();
    }

    public function contacts(): MorphToMany
    {
        return $this->morphedByMany(Contact::class, 'organizationable', 'organizationables',  'organization_id', 'organizationable_id')
            ->withTimestamps();
    }


    public function associates(): MorphToMany
    {
        return $this->morphToMany(Contact::class, 'associatable', 'associatables', 'associatable_id', 'contact_id')
            ->withTimestamps();
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable', 'taggables')
            ->withTimestamps();
    }
    public function projects(): MorphToMany
    {
        return $this->morphToMany(
            Project::class,
            'projectable',
            'projectables',
            'projectable_id',
            'project_id'
        )->withTimestamps();
    }

    public function socials(): MorphToMany
    {
        return $this->morphToMany(SocialLink::class, 'socialable', 'socialables')
            ->withTimestamps()
            ->withPivot('url');
    }

    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function addresses(): MorphMany
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'owner_id', 'id');
    }

    public function notes(): MorphToMany
    {
        return $this->morphToMany(Note::class, 'noteable', 'noteables')
            ->withTimestamps()
            ->select('notes.*');
    }
    public function tasks(): MorphToMany
    {
        return $this->morphToMany(Task::class, 'taskable', 'taskables')
            ->withTimestamps()
            ->select('tasks.*');
    }

    ## Relation with Opportunity for Organization Model stored in organizationables table
    public function opportunities(): MorphToMany
    {
        return $this->morphedByMany(
            Opportunity::class,
            'organizationable',
            'organizationables',
            'organization_id',
            'organizationable_id'
        )->withTimestamps();
    }

    public function opportunity(): MorphToMany
    {
        return $this->morphToMany(
            Opportunity::class,
            'organizationable',
            'organizationables',
        )->withTimestamps();
    }



    /**
     * The "booted" method of the Task model.
     *
     * Hooks into the model's deleting event and ensures that all
     * polymorphic pivot table entries related to the Task are also
     * deleted. This helps maintain database integrity by cleaning
     * up associations automatically when a Task is removed.
     *
     * Specifically, it deletes rows from:
     * - `associatables`   where `associatable_type = Organization::class`
     * - `socialables`      where `socialable_type = Organization::class`
     * - `taggables`        where `taggable_type = Organization::class`
     * - `addresses`   where `addressable_type = Organization::class`
     *
     * @return void
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    protected static function booted(): void
    {
        self::bootCleansUpMorphRelations([
            ['associatables', 'associatable_type', 'associatable_id'],
            ['socialables', 'socialable_type', 'socialable_id'],
            ['taggables', 'taggable_type', 'taggable_id'],
            ['addresses', 'addressable_type', 'addressable_id'],
            ['projectables', 'projectable_type', 'projectable_id'],
        ], Organization::class);

        self::deleteFromPivotTables([
            'organizationables'    => 'organization_id'
        ]);
    }
}
