<?php

namespace App\Models\Tenant;

use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\Auth;
use App\Traits\TenantCommonModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Traits\CleansUpMorphRelationsTrait;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Tenant Lead Model
 *
 * Represents a CRM lead within the tenant context.
 * 
 * Includes contact information, associations, and relations
 * with stages, priorities, ratings, organizations, socials, etc.
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
 * @property string|null $url
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
 * @property-read string $first_letter
 * @property-read string $get_lead_name
 * @property-read array $get_lead_stats
 *
 * @property-read \Illuminate\Database\Eloquent\Collection $stages
 * @property-read \Illuminate\Database\Eloquent\Collection $sources
 * @property-read \Illuminate\Database\Eloquent\Collection $tasks
 * @property-read \Illuminate\Database\Eloquent\Collection $designations
 * @property-read \Illuminate\Database\Eloquent\Collection $products
 * @property-read \Illuminate\Database\Eloquent\Collection $ratings
 * @property-read \Illuminate\Database\Eloquent\Collection $priorities
 * @property-read \Illuminate\Database\Eloquent\Collection $categories
 * @property-read \Illuminate\Database\Eloquent\Collection $associates
 * @property-read \Illuminate\Database\Eloquent\Collection $organization
 * @property-read \Illuminate\Database\Eloquent\Collection $socials
 * @property-read \Illuminate\Database\Eloquent\Collection $tags
 * @property-read \Illuminate\Database\Eloquent\Collection $employeeSizes
 * @property-read \Illuminate\Database\Eloquent\Collection $preferableTimes
 * @property-read \App\Models\Tenant\Contact|null $owner
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class Lead extends Model
{
    use HasFactory, Notifiable, HasUlids, LogsActivity;
    use CleansUpMorphRelationsTrait, TenantCommonModelTrait;
    /* -------------------- PRIMARY KEY CONFIG -------------------- */

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    /* -------------------- MASS ASSIGNABLE ATTRIBUTES -------------------- */

    protected $fillable = [
        'creator_id',
        'owner_id',
        'unique_id',
        'salutation',
        'first_name',
        'last_name',
        'nickname',
        'dob',
        'email',
        'url',
        'telephone',
        'mobile_phone',
        'alt_mobile_phone',
        'fax',
        'website',
        'details',
        'is_active',
        'icon',
        'preferred_contact_method',
        'is_sample'
    ];

    /* -------------------- APPENDED ACCESSORS -------------------- */
    protected $appends = [
        'model_time',
        'actions_links',
        'first_letter',
        'get_designation',
        'get_organization',
        'get_last_stage',
        'get_lead_name',
        'get_lead_stats',
        'get_lead_source',
        'get_lead_rating',
        'get_lead_priority',
        'get_preferred_time',
        'get_lead_socials',
        'get_emp_size',
        'get_category',
        'get_tags',
        'get_tag_names',
        'get_associates',
        'get_salutation',
        'get_associated_persons',
        'get_ai_payload',
        'get_ai_analysis'
    ];

    public function getActivitylogOptions(): LogOptions
    {

        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(function (string $eventName) {
                $userName = Auth::user()?->name ?? 'System';
                $date = _dateFormat($this->created_at, 'd M Y, h:i:A');
                return "{$date} - Lead '{$this->nickname}' was created by user '{$userName}'";
            })
            ->useLogName(LEAD);
    }

    /* -------------------- ACCESSORS -------------------- */

    protected function modelTime(): Attribute
    {
        return new Attribute(
            get: fn() => [
                'create_diff'       => $this->created_at->diffForHumans(),
                'create_formatted'  => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                'create_date'  => _dateFormat($this->created_at, 'd M Y'),
                'create_date_only' => _dateFormat($this->created_at, 'd M Y'),
                'update_diff'       => $this->updated_at->diffForHumans(),
                'update_formatted'  => _dateFormat($this->updated_at, 'd M, Y (h:i A)'),
                'update_date'  => _dateFormat($this->updated_at, 'd M Y'),
            ]
        );
    }

    protected function actionsLinks(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'edit'   => $this->id
                    ? route('tenant.leads.edit', ['lead' => $this->id, 'tenant' => tenant('id')])
                    : null,
                'delete' => null,
            ]
        );
    }

    protected function getLeadName(): Attribute
    {
        return Attribute::make(
            get: fn() => ($this->first_name || $this->last_name)
                ? $this->get_salutation . ' ' . "{$this->nickname} ( {$this->first_name} {$this->last_name})"
                : $this->get_salutation . '' . $this->nickname ?? ''
        );
    }

    protected function getLeadStats(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'primary' => [
                    [
                        'label' => 'Lead id',
                        'value' => $this->unique_id,
                        'icon'  => 'id',
                    ],
                    [
                        'label' => 'Lead owner',
                        'value' => $this->relationLoaded('owner')
                            ? ($this->owner?->nickname ?? '')
                            : '',
                        'icon'  => 'usersOwner',
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
                        'value' => $this->get_organization?->name ?? 'N/A',
                        'icon'  => 'organization',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Designation',
                        'value' => $this->get_designation?->name ?? 'N/A',
                        'icon'  => 'designation',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Stage',
                        'value' => @$this->get_last_stage?->label,
                        'icon'  => 'stage',
                        'summary' => '1000' . ' days in stage'
                    ],
                    [
                        'label' => 'Lead life',
                        'value' => ceil($this->created_at->floatDiffInDays(now())) . ' days',
                        'icon'  => 'heart',
                        'summary' => 'Created: ' . $this->model_time['create_date_only']
                    ],
                    [
                        'label' => 'Lead priority',
                        'value' => @$this->get_lead_priority?->name ?: 'N/A',
                        'icon'  => 'priority',
                        'summary' => '',

                    ],

                    [
                        'label' => 'Lead rating',
                        'value' => @$this->get_lead_rating?->name ?: 'N/A',
                        'icon'  => 'rating',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Lead source',
                        'value' => @$this->get_lead_source?->name ?: 'N/A',
                        'icon'  => 'source',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Preferred contact method',
                        'value' => _preferredContactMethod($this->preferred_contact_method, false) ?: 'N/A',
                        'icon'  => 'contactMethod',
                        'summary' => 'How to communicate with lead'
                    ],
                    [
                        'label' => 'Industry type',
                        'value' => @$this->get_category?->name ?: 'N/A',
                        'icon'  => 'industryType',
                        'summary' => ''
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
                    'name' => ucwords($this->get_lead_name),
                    'summary' => $this->details ? _getSubString($this->details, 170, true, options: ['preserveWords' => true]) : "",
                    'details' => $this->details,
                    'created_at' => $this->model_time['create_diff'] ?: 'N/A',
                    'updated_at' => $this->model_time['update_diff'] ?: 'N/A',
                    'first_latter' => $this->first_letter['letter'] ?: '',
                ]

            ]
        );
    }


    protected function firstLetter(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'letter'  => $this->nickname ? Str::substr($this->nickname, 0, 1) : '',
                'bgColor' => $this->nickname
                    ? _getAlphabeticalColorName(Str::substr($this->nickname, 0, 1))
                    : 'gray',
            ]
        );
    }

    protected function getLastStage(): Attribute
    {
        return Attribute::make(

            get: fn() => $this->relationLoaded('stages')
                ? $this->stages->sortByDesc(fn($stage) => $stage->pivot->created_at)->first()
                : ''
        );
    }

    protected function getLeadSource(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('sources')
                ? $this->sources->first()
                : ''
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

    protected function getLeadRating(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('ratings')
                ? $this->ratings->sortByDesc('pivot.created_at')->first()
                : ''
        );
    }

    protected function getLeadPriority(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('priorities')
                ? $this->priorities->sortByDesc('pivot.created_at')->first()
                : ''
        );
    }

    protected function getCategory(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('categories')
                ? $this->categories->first()
                : ''
        );
    }

    protected function getAssociates(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('associates')
                ? $this->associates->pluck('id')->toArray()
                : ''
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


    protected function getOrganization(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('organizations')
                ? $this->organizations?->first()
                : ""
        );
    }

    protected function getLeadSocials(): Attribute
    {
        return Attribute::make(
            get: fn() =>
            $this->relationLoaded('socials')
                ? $this->socials->mapWithKeys(fn($item) => [
                    $item->id => [
                        'name'  => $item->name ?? '',
                        'icon'  => $item->icon ?? '',
                        'order' => $item->order ?? 0,
                        'value' => $item->pivot->url ?? '',
                    ],
                ])->toArray()
                : []
        );
    }


    protected function getTags(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('tags')
                ? $this->tags ?? collect()
                : ""
        );
    }

    protected function getTagNames(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('tags')
                ? $this->tags->pluck('name')->toArray()
                : ""
        );
    }

    protected function getEmpSize(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('employeeSizes')
                ? $this->employeeSizes->first()
                : ""
        );
    }

    protected function getPreferredTime(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('preferableTimes')
                ? $this->preferableTimes->first()
                : ""
        );
    }

    protected function getSalutation(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->salutation != 4 ?  _salutations($this->salutation) : ''
        );
    }

    protected function getAiPayload(): Attribute
    {
        return Attribute::make(
            get: function () {
                $tasks = $this->relationLoaded('tasks') ? $this->tasks : collect();
                $notes = $this->relationLoaded('notes') ? $this->notes : collect();
                $leadName = $this->get_lead_name ?? $this->nickname ?? '';
                return $this->getAiPayloadData(entityType: LEAD, entityDisplayName: $leadName, tasks: $tasks, notes: $notes);
            }
        );
    }

    protected function getAiAnalysis(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('aiAnalysis')
                ? $this->formatAiAnalysis($this->aiAnalysis->sortByDesc('created_at')->first())
                : $this->formatAiAnalysis()
        );
    }

    /**
     * Format selected AiAnalysis fields into a clean key-value array.
     *
     * @param \App\Models\AiAnalysis|null $analysis
     * @return array
     */
    protected function formatAiAnalysis($analysis = null): array
    {
        if (!$analysis) {
            return ['hasAiAnalysis' => false];
        }

        return [
            'hasAiAnalysis'     => true,
            'summary'           => $analysis->summary,
            'current_position'  => $analysis->current_position,
            'next_best_action'  => $analysis->next_best_action,
            'meta'              => $analysis->meta ?? [],
            'created_at'        => $analysis->model_time['create_formatted'],
        ];
    }


    /* -------------------- RELATIONSHIPS --------------------
     *
     * address()          → One-to-one polymorphic relation. A lead can have one address record.
     *
     * stages()           → Many-to-many polymorphic relation. A lead can be assigned to multiple stages 
     *                      (through stageables pivot) with extra pivot data like causer_id, duration, etc.
     *
     * sources()          → Many-to-many polymorphic relation. A lead can originate from multiple data sources.
     *
     * tasks()            → Many-to-many polymorphic relation. A lead can be linked with many tasks.
     *
     * designations()     → Many-to-many polymorphic relation. A lead can be connected to multiple designations.
     *
     * products()         → Many-to-many polymorphic relation. A lead can be associated with multiple products.
     *
     * ratings()          → Many-to-many polymorphic relation. A lead can be given one or more ratings.
     *
     * priorities()       → Many-to-many polymorphic relation. A lead can have one or more assigned priorities.
     *
     * categories()       → Many-to-many polymorphic relation. A lead can belong to one or more data categories.
     *
     * associates()       → Many-to-many polymorphic relation. A lead can have multiple associated contacts 
     *                      (through associatables pivot table).
     *
     * organization()     → Many-to-many polymorphic relation. A lead can belong to one or more organizations.
     *
     * socials()          → Many-to-many polymorphic relation. A lead can have multiple social links with 
     *                      an extra pivot field (url).
     *
     * tags()             → Many-to-many polymorphic relation. A lead can be tagged with multiple tags.
     *
     * employeeSizes()    → Many-to-many polymorphic relation. A lead can be linked to different employee sizes 
     *                      (like small, medium, large companies).
     *
     * preferableTimes()  → Many-to-many polymorphic relation. A lead can have preferred contact times 
     *                      (morning, afternoon, evening, etc.).
     *
     * owner()            → Standard belongs-to relation. A lead belongs to one contact who is the owner.
     * opportunityables()      → Attach lead with opportunityables
     *
     * ------------------------------------------------------- */


    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function stages(): MorphToMany
    {
        return $this->morphToMany(Stage::class, 'stageable', 'stageables', 'stageable_id', 'stage_id')
            ->using(Stageable::class)
            ->withPivot('id', 'causer_id', 'stage_id', 'stageable_id', 'duration', 'created_at', 'updated_at')
            ->withTimestamps();
    }

    public function sources(): MorphToMany
    {
        return $this->morphToMany(
            DataSource::class,
            'sourceable',
            'sourceables',
            'sourceable_id',
            'data_source_id'
        )->withTimestamps();
    }

    public function tasks(): MorphToMany
    {
        return $this->morphToMany(Task::class, 'taskable', 'taskables', 'taskable_id', 'task_id')
            ->withTimestamps();
    }

    public function designations(): MorphToMany
    {
        return $this->morphToMany(DataDesignation::class, 'designationable')->withTimestamps();
    }

    public function products(): MorphToMany
    {
        return $this->morphToMany(Product::class, 'productable')
            ->withPivot(['face_value', 'customized_value'])
            ->withTimestamps();
    }

    public function ratings(): MorphToMany
    {
        return $this->morphToMany(DataRating::class, 'ratingable')->withTimestamps();
    }

    public function priorities(): MorphToMany
    {
        return $this->morphToMany(DataPriority::class, 'priorityable')->withTimestamps();
    }

    public function categories(): MorphToMany
    {
        return $this->morphToMany(DataCategory::class, 'categoryable')->withTimestamps();
    }

    public function associates(): MorphToMany
    {
        return $this->morphToMany(Contact::class, 'associatable', 'associatables', 'associatable_id', 'contact_id')
            ->withTimestamps();
    }

    public function organizations(): MorphToMany
    {
        return $this->morphToMany(Organization::class, 'organizationable', 'organizationables', 'organizationable_id', 'organization_id')->withTimestamps();
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
        return $this->morphToMany(SocialLink::class, 'socialable', 'socialables', 'socialable_id', 'social_link_id')
            ->withTimestamps()
            ->withPivot(['url']);
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable')->withTimestamps();
    }

    public function employeeSizes(): MorphToMany
    {
        return $this->morphToMany(
            DataEmpSize::class,
            'employee_sizeable',
            'employee_sizeables',
            'employee_sizeable_id',
            'employee_size_id'
        )->withTimestamps();
    }

    public function preferableTimes(): MorphToMany
    {
        return $this->morphToMany(
            DataContactTime::class,
            'preferred_contact_timeable',
            'preferred_contact_timeables',
            'preferred_contact_timeable_id',
            'data_contact_time_id'
        )->withTimestamps();
    }

    public function contacts(): MorphToMany
    {
        return $this->morphedByMany(Contact::class, 'leadable', 'leadables', 'lead_id', 'leadable_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'owner_id', 'id');
    }

    // public function opportunityables(): MorphToMany
    // {
    //     return $this->morphToMany(
    //         DataContactTime::class,
    //         'opportunityable',
    //         'opportunityables',
    //         'opportunityable_id',
    //         'opportunity_id'
    //     )->withTimestamps();
    // }
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

    public function notes(): MorphToMany
    {
        return $this->morphToMany(Note::class, 'noteable', 'noteables')
            ->withTimestamps()
            ->select('notes.*');
    }

    public function aiAnalysis(): MorphMany
    {
        return $this->morphMany(AiAnalysis::class, 'analysisable')->chaperone();
    }

    /* -------------------- BOOT EVENTS -------------------- */

    protected static function booted(): void
    {
        static::creating(function ($lead) {
            if (empty($lead->unique_id)) {
                $lead->unique_id = _generateUniqueId('Lead', 'unique_id', 'LEAD', 8);
            }
        });

        self::bootCleansUpMorphRelations([
            ['associatables', 'associatable_type', 'associatable_id'],
            ['socialables', 'socialable_type', 'socialable_id'],
            ['taggables', 'taggable_type', 'taggable_id'],
            ['addresses', 'addressable_type', 'addressable_id'],
            ['stageables', 'stageable_type', 'stageable_id'],
            ['priorityables', 'priorityable_type', 'priorityable_id'],
            ['categoryables', 'categoryable_type', 'categoryable_id'],
            ['contactables', 'contactable_type', 'contactable_id'],
            ['ratingables', 'ratingable_type', 'ratingable_id'],
            ['productables', 'productable_type', 'productable_id'],
        ], Lead::class);
    }
}
