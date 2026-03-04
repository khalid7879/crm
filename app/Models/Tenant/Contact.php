<?php

namespace App\Models\Tenant;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Traits\CleansUpMorphRelationsTrait;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Tenant Contact Model
 *
 * Represents an individual contact (person) within the tenant CRM context.
 * 
 * Stores personal and communication details, and maintains relationships with
 * leads, organizations, socials, tags, and other CRM entities.
 *
 * @property string $id
 * @property string $creator_id
 * @property string|null $owner_id
 * @property string $unique_id
 * @property string|null $salutation
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string|null $nickname
 * @property string|null $dob
 * @property string|null $email
 * @property string|null $telephone
 * @property string|null $mobile_phone
 * @property string|null $alt_mobile_phone
 * @property string|null $fax
 * @property string|null $website
 * @property string|null $details
 * @property bool $is_active
 * @property string|null $icon
 * @property string|null $preferred_contact_method
 *
 * @property-read array $model_time
 * @property-read array $actions_links
 * @property-read array $get_tags
 * @property-read array $get_tag_names
 * @property-read array $get_associates
 * @property-read array $get_opportunity_socials
 * @property-read string $first_letter
 * @property-read string $contact_name
 *
 * @property-read \Illuminate\Database\Eloquent\Collection $leads
 * @property-read \Illuminate\Database\Eloquent\Collection $organizations
 * @property-read \Illuminate\Database\Eloquent\Collection $socials
 * @property-read \Illuminate\Database\Eloquent\Collection $tags
 * @property-read \Illuminate\Database\Eloquent\Collection $associates
 * @property-read \App\Models\Tenant\Contact|null $owner
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class Contact extends Model
{
    use HasFactory, Notifiable, HasUlids;
    use CleansUpMorphRelationsTrait;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'causer_id',
        'owner_id',
        'salutation',
        'mobile_number',
        'email',
        'dob',
        'details',
        'is_parent_user_deleted',
        'is_delete',
        'nickname',
        'details',
        'first_name',
        'last_name',
        'nickname',

    ];

    protected $appends = [
        'model_time',
        'first_letter',
        'actions_links',
        'get_organization',
        'get_deleted_status',
        'get_designation',
        'get_tags',
        'get_tag_names',
        'get_associates',
        'get_user_reference',
        'owner_name',
        'get_contact_stats',
        'get_associated_persons',
        'lead_owner_and_associate',
        'project_owner_and_associate',
        'opportunity_owner_and_associate',
        'organization_owner_and_associate',
        'contact_owner_and_associate',
        'task_owner_and_associate',
        'note_owner_and_associate',
        'get_causer_lead',
        'get_causer_task',
        'get_causer_contact',
        'get_causer_opportunity',
        'get_causer_organization',
        'get_causer_project',
        'get_causer_note',
        'get_contactable_id',
        'get_contact_type',
    ];

    /** -------------------- ATTRIBUTE ACCESSORS --------------------
     * model_time           → Human-readable created_at / updated_at
     * first_letter         → First character of title with background color
     * actions_links        → Frontend edit/delete route URLs
     * get_organization     → First related organization (if loaded)
     * get_tags             → Collection of tags (if loaded)
     * get_tag_names        → Array of tag names (if loaded)
     * get_associates       → Array of associate IDs (if loaded)
     * get_user_reference  → Read-only direct user reference as an owner
     * ------------------------------------------------------------- */

    protected function modelTime(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'create_diff'      => $this->created_at?->diffForHumans(),
                'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                'create_date_only' => _dateFormat($this->created_at, 'd-M-Y'),
                'update_diff'      => $this->updated_at?->diffForHumans(),
                'update_formatted' => _dateFormat($this->updated_at, 'd M, Y (h:i A)'),
            ]
        );
    }

    protected function firstLetter(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'letter'  => Str::substr($this->nickname, 0, 1),
                'bgColor' => _getAlphabeticalColorName(Str::substr($this->nickname, 0, 1)),
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
    protected function getDeletedStatus(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) => ($attributes['is_delete'] ?? 0) ? 'Yes' : 'No'
        );
    }


    protected function getOrganization(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('organization')
                ? $this->organization->first()
                : ''
        );
    }

    protected function getTags(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) =>
            $this->relationLoaded('tags')
                ? $this->tags->pluck('name')->implode(', ')
                : ''
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
                'edit'   => route('tenant.contacts.edit', [
                    'contact' => $this->id,
                    'tenant'  => tenant('id'),
                ]),
                'delete' => '',
            ]
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

    protected function getContactStats(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'primary' => [
                    [
                        'label' => 'Contact owner',
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
                        'label' => 'Contact',
                        'value' => $this->nickname ?? 'N/A',
                        'icon'  => 'contact',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Mobile',
                        'value' => $this->mobile_number ?? 'N/A',
                        'icon'  => 'mobile',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Email',
                        'value' => $this->email ?? 'N/A',
                        'icon'  => 'email',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Contact life',
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
                    'name' => ucwords($this->nickname),
                    'summary' => $this->details ? _getSubString($this->details, 170, true, options: ['preserveWords' => true]) : "",
                    'details' => $this->details,
                    'created_at' => $this->model_time['create_diff'] ?: 'N/A',
                    'updated_at' => $this->model_time['update_diff'] ?: 'N/A'
                ]
            ]
        );
    }

    protected function getUserReference(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('userReference')
                ? (
                    $this->userReference->isNotEmpty()
                    ? [
                        'id'        => $this->userReference->first()->id,
                        'name'      => $this->userReference->first()->name,
                        'routeName' => '',
                    ]
                    : [
                        'id'        => '',
                        'name'      => '<del class="text-error">User deleted</del>',
                        'routeName' => '',
                    ]
                )
                : [
                    'id'        => '',
                    'name'      => '<del class="text-error">User deleted</del>',
                    'routeName' => '',
                ]
        );
    }
    protected function getDesignation(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('designations')
                ? $this->designations->first()
                : ''
        );
    }

    protected function leadOwnerAndAssociate(): Attribute
    {

        return Attribute::make(
            get: function () {
                $owner = $this->relationLoaded('leadOwner')
                    ? $this->leadOwner->count()
                    : 0;

                $associate = $this->relationLoaded('leads')
                    ? $this->leads->count()
                    : 0;

                return [
                    'owner'      => $owner,
                    'associate'  => $associate,
                    'actualData' => $owner . '/' . $associate,
                    'hoverData'  => 'Owner-' . $owner . '/Associate-' . $associate,
                ];
            }
        );
    }

    protected function projectOwnerAndAssociate(): Attribute
    {
        return Attribute::make(
            get: function () {
                $owner = $this->relationLoaded('projectOwner')
                    ? $this->projectOwner->count()
                    : 0;

                $associate = $this->relationLoaded('projects')
                    ? $this->projects->count()
                    : 0;

                return [
                    'owner'      => $owner,
                    'associate'  => $associate,
                    'actualData' => $owner . '/' . $associate,
                    'hoverData'  => 'Owner-' . $owner . '/Associate-' . $associate,
                ];
            }
        );
    }
    protected function opportunityOwnerAndAssociate(): Attribute
    {
        return Attribute::make(
            get: function () {
                $owner = $this->relationLoaded('opportunityOwner')
                    ? $this->opportunityOwner->count()
                    : 0;

                $associate = $this->relationLoaded('opportunity')
                    ? $this->opportunity->count()
                    : 0;

                return [
                    'owner'      => $owner,
                    'associate'  => $associate,
                    'actualData' => $owner . '/' . $associate,
                    'hoverData'  => 'Owner-' . $owner . '/Associate-' . $associate,
                ];
            }
        );
    }

    protected function contactOwnerAndAssociate(): Attribute
    {

        return Attribute::make(
            get: function () {
                $owner = $this->relationLoaded('contactOwner')
                    ? $this->contactOwner->count()
                    : 0;

                $associate = $this->relationLoaded('contacts')
                    ? $this->contacts->count()
                    : 0;

                return [
                    'owner'      => $owner,
                    'associate'  => $associate,
                    'actualData' => $owner . '/' . $associate,
                    'hoverData'  => 'Owner-' . $owner . '/Associate-' . $associate,
                ];
            }
        );
    }
    protected function taskOwnerAndAssociate(): Attribute
    {
        return Attribute::make(
            get: function () {
                $owner = $this->relationLoaded('taskOwner')
                    ? $this->taskOwner->count()
                    : 0;

                $associate = $this->relationLoaded('taskAssociate')
                    ? $this->taskAssociate->count()
                    : 0;

                return [
                    'owner'      => $owner,
                    'associate'  => $associate,
                    'actualData' => $owner . '/' . $associate,
                    'hoverData'  => 'Owner-' . $owner . '/Associate-' . $associate,
                ];
            }
        );
    }
    protected function noteOwnerAndAssociate(): Attribute
    {
        return Attribute::make(
            get: function () {
                $owner = $this->relationLoaded('noteOwner')
                    ? $this->noteOwner->count()
                    : 0;

                $associate = $this->relationLoaded('noteAssociate')
                    ? $this->noteAssociate->count()
                    : 0;

                return [
                    'owner'      => $owner,
                    'associate'  => $associate,
                    'actualData' => $owner . '/' . $associate,
                    'hoverData'  => 'Owner-' . $owner . '/Associate-' . $associate,
                ];
            }
        );
    }

    protected function organizationOwnerAndAssociate(): Attribute
    {
        return Attribute::make(
            get: function () {
                $owner = $this->relationLoaded('organizationOwner')
                    ? $this->organizationOwner->count()
                    : 0;

                $associate = $this->relationLoaded('organizations')
                    ? $this->organizations->count()
                    : 0;

                return [
                    'owner'      => $owner,
                    'associate'  => $associate,
                    'actualData' => $owner . '/' . $associate,
                    'hoverData'  => 'Owner-' . $owner . '/Associate-' . $associate,
                ];
            }
        );
    }
    protected function getCauserLead(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('leadCauser')
                ? $this->leadCauser->count()
                : 0
        );
    }
    protected function getCauserTask(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('taskCauser')
                ? $this->taskCauser->count()
                : 0
        );
    }
    protected function getCauserContact(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('contactCauser')
                ? $this->contactCauser->count()
                : 0
        );
    }
    protected function getCauserOpportunity(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('opportunityCauser')
                ? $this->opportunityCauser->count()
                : 0
        );
    }
    protected function getCauserOrganization(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('organizationCauser')
                ? $this->organizationCauser->count()
                : 0
        );
    }
    protected function getCauserProject(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('projectCauser')
                ? $this->projectCauser->count()
                : 0
        );
    }
    protected function getCauserNote(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('noteCauser')
                ? $this->noteCauser->count()
                : 0
        );
    }

    protected function getContactableId(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('contactables')
                ? $this->contactables?->first()?->contactable_id
                : ""
        );
    }
    protected function getContactType(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('contactables') && $this->contactables?->first()?->contactable_type
                ? class_basename($this->contactables->first()->contactable_type)
                : ''
        );
    }



    /** -------------------- RELATIONSHIPS --------------------
     *
     * organization()       → A contact can belong to multiple organizations.
     * associates()         → A contact can have multiple associated contacts.
     * tags()               → A contact can be tagged with multiple tags.
     * socials()            → A contact can have multiple social links (with URL pivot).
     * owner()              → A contact belongs to one owner contact.
     * address()            → A contact can have one address record.
     *
     * leads()              → A contact can be associated with multiple leads.
     * opportunity()        → A contact can be associated with multiple opportunities.
     * tasks()              → A contact can be associated with multiple tasks.
     * note()               → A contact can be associated with multiple notes.
     * organizations()      → A contact can be associated with multiple organizations (via associatables).
     * contacts()           → A contact can be associated with other contacts.
     *
     * leadOwner()          → A contact can be the owner of multiple leads.
     * opportunityOwner()   → A contact can be the owner of multiple opportunities.
     * taskOwner()          → A contact can be the owner of multiple tasks.
     * noteOwner()          → A contact can be the owner of multiple notes.
     * organizationOwner()  → A contact can be the owner of multiple organizations.
     * contactOwner()       → A contact can be the owner of multiple contacts.
     *
     * userReference()      → A contact can be linked to multiple users via contact_users pivot.
     * ------------------------------------------------------- */

    public function organization(): MorphToMany
    {
        return $this->morphToMany(
            Organization::class,
            'organizationable',
            'organizationables',
        )->withTimestamps()
            ->select('organizations.*');
    }

    public function associates(): MorphToMany
    {
        return $this->morphToMany(Contact::class, 'associatable', 'associatables', 'contact_id', 'associatable_id')
            ->withTimestamps()
            ->select('contacts.*');
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable', 'taggables')
            ->withTimestamps()
            ->select('tags.*');
    }

    public function socials(): MorphToMany
    {
        return $this->morphToMany(SocialLink::class, 'socialable', 'socialables')
            ->withTimestamps()
            ->withPivot(['url'])
            ->select('social_links.*');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'owner_id', 'id');
    }

    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function addresses(): MorphMany
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    public function leads(): MorphToMany
    {
        return $this->morphToMany(
            Lead::class,
            'leadable',
            'leadables',
            'leadable_id',
            'lead_id'
        )->withTimestamps();
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

    public function opportunity(): MorphToMany
    {
        return $this->morphedByMany(Opportunity::class, 'associatable', 'associatables', 'contact_id', 'associatable_id');
    }
    public function taskAssociate(): MorphToMany
    {
        return $this->morphedByMany(Task::class, 'associatable', 'associatables', 'contact_id', 'associatable_id');
    }
    public function noteAssociate(): MorphToMany
    {
        return $this->morphedByMany(Note::class, 'associatable', 'associatables', 'contact_id', 'associatable_id');
    }

    public function tasks(): MorphToMany
    {
        return $this->morphToMany(Task::class, 'taskable', 'taskables', 'taskable_id', 'task_id')
            ->withTimestamps();
    }

    public function notes(): MorphToMany
    {
        return $this->morphToMany(Note::class, 'noteable', 'noteables')
            ->withTimestamps()
            ->select('notes.*');
    }

    public function organizations(): MorphToMany
    {
        return $this->morphToMany(
            Organization::class,
            'organizationable',
            'organizationables',
            'organizationable_id',
            'organization_id'
        )->withTimestamps();
    }

    public function opportunities(): MorphToMany
    {
        return $this->morphToMany(
            Opportunity::class,
            'opportunityable',
            'opportunityables',
            'opportunityable_id',
            'opportunity_id'
        )->withTimestamps();
    }

    public function contacts(): MorphToMany
    {
        return $this->morphedByMany(Contact::class, 'associatable', 'associatables', 'contact_id', 'associatable_id');
    }

    public function leadOwner()
    {
        return $this->hasMany(Lead::class, 'owner_id', 'id');
    }

    public function opportunityOwner()
    {
        return $this->hasMany(Opportunity::class, 'owner_id', 'id');
    }

    public function taskOwner()
    {
        return $this->hasMany(Task::class, 'owner_id', 'id');
    }

    public function noteOwner()
    {
        return $this->hasMany(Note::class, 'owner_id', 'id');
    }

    public function organizationOwner()
    {
        return $this->hasMany(Organization::class, 'owner_id', 'id');
    }
    public function projectOwner()
    {
        return $this->hasMany(Project::class, 'owner_id', 'id');
    }

    public function contactOwner(): HasMany
    {
        return $this->hasMany(Contact::class, 'owner_id', 'id');
    }

    public function userReference(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'contact_users', 'contact_id', 'user_id')
            ->withTimestamps();
    }

    public function causer(): HasMany
    {
        return $this->hasMany(Contact::class, 'causer_id', 'id');
    }
    public function designations(): MorphToMany
    {
        return $this->morphToMany(DataDesignation::class, 'designationable')->withTimestamps();
    }

    public function leadCauser()
    {
        return $this->hasMany(Lead::class, 'creator_id', 'id');
    }

    public function taskCauser()
    {
        return $this->hasMany(Task::class, 'causer_id', 'id');
    }
    public function contactCauser()
    {
        return $this->hasMany(
            Contact::class,
            'causer_id',
            'id',
        );
    }
    public function opportunityCauser()
    {
        return $this->hasMany(
            Opportunity::class,
            'causer_id',
            'id',
        );
    }
    public function organizationCauser()
    {
        return $this->hasMany(
            Organization::class,
            'causer_id',
            'id',
        );
    }
    public function projectCauser()
    {
        return $this->hasMany(
            Project::class,
            'causer_id',
            'id',
        );
    }
    public function noteCauser()
    {
        return $this->hasMany(
            Note::class,
            'causer_id',
            'id',
        );
    }

    public function contactables()
    {
        return $this->hasMany(Contactable::class, 'contact_id');
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
     * - `stageables`      where `stageable_type = Organization::class`
     * - `categoryables`        where `categoryable_type = Organization::class`
     * - `organizationables`   where `organizationable_type = Organization::class`
     * - `sourceables`   where `sourceable_type = Organization::class`
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
            ['designationables', 'designationable_type', 'designationable_id'],
            ['opportunityables', 'opportunityable_type', 'opportunityable_id'],
            ['leadables', 'leadable_type', 'leadable_id'], 

        ], Contact::class);
    }
}
