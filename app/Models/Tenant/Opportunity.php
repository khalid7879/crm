<?php

namespace App\Models\Tenant;

use Carbon\Carbon;
use App\Models\Tenant\Note;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use App\Models\Tenant\Organization;
use Illuminate\Support\Facades\Auth;
use App\Traits\TenantCommonModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use App\Traits\CleansUpMorphRelationsTrait;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Tenant Opportunity Model
 *
 * Represents a sales opportunity within the tenant CRM context.
 *
 * Stores opportunity information including owner, associates, categories, 
 * stages, tags, revenue types, tasks, notes, products, organizations, etc.
 *
 * @property string $id
 * @property string $causer_id
 * @property string|null $owner_id
 * @property string $name
 * @property string|null $details
 * @property string|null $date_forecast
 * @property string|null $date_close
 * @property float|null $amount
 * @property string|null $currency
 * @property int $progress_percent
 * @property bool $is_active
 *
 * @property-read array $model_time
 * @property-read array $first_letter
 * @property-read array $actions_links
 * @property-read \App\Models\Tenant\Organization|null $get_organization
 * @property-read \App\Models\Tenant\Stage|null $get_last_stage
 * @property-read \App\Models\Tenant\DataCategory|null $get_category
 * @property-read \Illuminate\Database\Eloquent\Collection $get_tags
 * @property-read array $get_tag_names
 * @property-read array $get_associates
 * @property-read string $owner_name
 *
 * @property-read \Illuminate\Database\Eloquent\Collection $organization
 * @property-read \Illuminate\Database\Eloquent\Collection $categories
 * @property-read \Illuminate\Database\Eloquent\Collection $associates
 * @property-read \Illuminate\Database\Eloquent\Collection $tags
 * @property-read \Illuminate\Database\Eloquent\Collection $stages
 * @property-read \Illuminate\Database\Eloquent\Collection $tasks
 * @property-read \Illuminate\Database\Eloquent\Collection $notes
 * @property-read \Illuminate\Database\Eloquent\Collection $products
 * @property-read \Illuminate\Database\Eloquent\Collection $sources
 * @property-read \Illuminate\Database\Eloquent\Collection $revenue_types
 * @property-read \App\Models\Tenant\Contact|null $owner
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class Opportunity extends Model
{
    use HasFactory, Notifiable, HasUlids, LogsActivity;
    use CleansUpMorphRelationsTrait, TenantCommonModelTrait;

    /* -------------------- PRIMARY KEY CONFIG -------------------- */

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    /* -------------------- MASS ASSIGNABLE ATTRIBUTES -------------------- */

    protected $fillable = [
        'causer_id',
        'owner_id',
        'name',
        'details',
        'date_forecast',
        'date_close',
        'progress_percent',
        'amount',
        'currency',
        'is_active',
        'is_sample'
    ];

    /* -------------------- APPENDED ACCESSORS -------------------- */

    protected $appends = [
        'model_time',
        'first_letter',
        'actions_links',
        'get_organization',
        'get_last_stage',
        'get_category',
        'get_tags',
        'get_tag_names',
        'get_associates',
        'owner_name',
        'get_opportunity_stats',
        'get_opportunity_source',
        'forecast_date',
        'close_date',
        'currency_with_amount',
        'get_category_name',
        'get_ai_payload',
        'get_ai_analysis',
        'get_associates_name',
        'get_status',
        'get_overdue_status',
        'get_opportunity_type',
        'get_parent_link',
        'get_associated_persons',
    ];

    // protected $casts = [
    //     'date_forecast'    => 'datetime',
    //     'date_close'       => 'datetime',
    //     'progress_percent' => 'float',
    // ];

    /* -------------------- ACCESSORS -------------------- */

    public function getActivitylogOptions(): LogOptions
    {

        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(function (string $eventName) {
                $userName = Auth::user()?->name ?? 'System';
                $date = _dateFormat($this->created_at, 'd M Y, h:i:A');
                return "{$date} - Opportunity '{$this->name}' was created by user '{$userName}'";
            })
            ->useLogName(OPPORTUNITY);
    }

    protected function modelTime(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at
                ? [
                    'create_diff'      => $this->created_at?->diffForHumans(),
                    'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                    'create_date_only' => _dateFormat($this->created_at, 'd M Y'),
                    'update_diff'      => $this->updated_at?->diffForHumans(),
                    'update_formatted' => _dateFormat($this->updated_at, 'd M, Y (h:i A)'),
                ]
                : []
        );
    }

    protected function forecastDate(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->date_forecast ? _dateFormat($this->date_forecast, 'd-M-Y') : ""
        );
    }
    protected function closeDate(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->date_close ? _dateFormat($this->date_close, 'd-M-Y') : ""
        );
    }

    protected function dateForecast(): Attribute
    {
        return new Attribute(
            // set: fn($value) => $value ? $value : now(),
            get: fn($value) => !empty($value) ? _dateFormat($value, 'Y-m-d') : ''
        );
    }
    protected function dateClose(): Attribute
    {
        return new Attribute(
            // set: fn($value) => $value ? $value : now(),
            get: fn($value) => !empty($value) ? _dateFormat($value, 'Y-m-d') : ''
        );
    }
    protected function currencyWithAmount(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->amount ? $this->currency . $this->amount : $this->amount
        );
    }
    protected function firstLetter(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'letter'  => Str::substr($this->name ?? '', 0, 1),
                'bgColor' => _getAlphabeticalColorName(Str::substr($this->name ?? '', 0, 1)),
            ]
        );
    }

    protected function getOrganization(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('organizations')
                ? $this->organizations->first()
                : ""
        );
    }

    protected function getLastStage(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('stages')
                ? $this->stages->sortByDesc(fn($stage) => $stage->pivot->created_at)->first()
                : ""
        );
    }

    protected function getCategory(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('categories')
                ? $this->categories->first()
                : ""
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

    protected function getAssociates(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('associates')
                ? $this->associates->pluck('id')->toArray()
                : ""
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

    protected function actionsLinks(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'edit'   => $this->id
                    ? route('tenant.opportunity.edit', [
                        'opportunity' => $this->id,
                        'tenant'      => tenant('id'),
                    ])
                    : null,
                'delete' => null,
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

    protected function getOpportunityStats(): Attribute
    {
        return Attribute::make(
            get: function() {
                $related = $this->get_opportunity_type ?? 'N/A';
                $icon = 'opportunity';

                if ($related === 'Lead') {
                    $related =  $this->leads()?->first()?->nickname ??  '';
                    $icon = 'lead';
                }

                if ($related === 'Opportunity') {
                    $related =  $this->opportunities()?->first()?->name ??  '';
                    $icon = 'opportunity';
                }

                if ($related === 'Contact') {
                    $related =  $this->contacts()?->first()?->nickname ??  '';
                    $icon = 'contact';
                }
                if ($related === 'Organization') {
                    $related =  $this->organizations()?->first()?->name ??  '';
                    $icon = 'organization';
                }

                if ($related === 'Project') {
                    $related =  $this->projects()?->first()?->name ??  '';
                    $icon = 'project';
                }
                return [
                    'primary' => [

                        [
                            'label' => 'Lead owner',
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
                            'label' => 'Opportunity type',
                            'value' => empty($this->get_opportunity_type) ? 'N/A' : $this->get_opportunity_type,
                            'icon'  => $icon,
                            'summary' => $related,
                            'link' => $this->get_parent_link
                        ],
                        [
                            'label' => 'Amount',
                            'value' => $this->currency_with_amount,
                            'icon'  => 'dolor',
                            'summary' => 'Weighted forecast: ' .  $this->currency_with_amount
                        ],
                        [
                            'label' => 'Stage',
                            'value' => @$this->get_last_stage?->label,
                            'icon'  => 'stage',
                            'summary' => '1000' . ' days in stage'
                        ],
                        [
                            'label' => 'Time to close',
                            'value' => round(now()->floatDiffInDays($this->date_forecast)) . ' days',
                            'icon'  => 'date',
                            'summary' => 'Expected close date: ' .  ($this->date_forecast ? _dateFormat($this->date_forecast, 'd M Y') : "N/A"),

                        ],
                        [
                            'label' => 'Expected close date',
                            'value' => $this->date_forecast ? _dateFormat($this->date_forecast, 'd M Y') : "N/A",
                            'icon'  => 'date',
                            'summary' => 'Created: ' .  $this->model_time['create_date_only']
                        ],
                        [
                            'label' => 'Lifetime',
                            'value' => round(now()->floatDiffInDays($this->date_forecast)) . ' days',
                            'icon'  => 'date',
                            'summary' => 'Created: ' .  $this->model_time['create_date_only']
                        ],

                    ],
                    'modelData' => [
                        'name' => ucwords($this->name),
                        'summary' => $this->details ? _getSubString($this->details, 170, true, options: ['preserveWords' => true]) : "",
                        'details' => $this->details,
                        'created_at' => $this->model_time['create_diff'] ?: 'N/A',
                        'updated_at' => $this->model_time['update_diff'] ?: 'N/A',
                        'first_latter' => $this->first_letter['letter'] ?: '',
                    ]
                ];
            }
        );
    }

    protected function getOpportunitySource(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('sources')
                ? $this->sources->first()
                : ''
        );
    }

    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn($value) => ucfirst($value)
        );
    }
    protected function getCategoryName(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('categories')
                ? $this->categories?->first()?->only(['id', 'type', 'name'])
                : ""
        );
    }

    protected function getAiPayload(): Attribute
    {
        return Attribute::make(
            get: function () {
                $tasks = $this->relationLoaded('tasks') ? $this->tasks : collect();
                $notes = $this->relationLoaded('notes') ? $this->notes : collect();
                $opportunityName = $this->name ?? '';
                return $this->getAiPayloadData(entityType: OPPORTUNITY, entityDisplayName: $opportunityName, tasks: $tasks, notes: $notes);
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

    protected function getStatus(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) => ($attributes['is_active'] ?? 0) ? 'Active' : 'Inactive'
        );
    }
    protected function getOverdueStatus(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                $closeDate    = $attributes['date_close'] ?? null;
                $forecastDate = $attributes['date_forecast'] ?? null;

                if ($forecastDate) {
                    $result = Carbon::parse($forecastDate)->isPast() ? 'Yes' : 'No';

                    if ($result == 'Yes' && $closeDate) {
                        if ($forecastDate >= $closeDate) {
                            return 'No';
                        } else {
                            return 'Yes';
                        }
                    }

                    return $result;
                }

                return 'No';
            }
        );
    }

    protected function getOpportunityType(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('opportunityables') && $this->opportunityables?->first()?->opportunityable_type
                ? class_basename($this->opportunityables->first()->opportunityable_type)
                : ''
        );
    }

    protected function getParentLink(): Attribute
    {
        return Attribute::make(
            get: function () {

                $related = $this->get_opportunity_type ?? 'N/A';
                $link = '';

                if ($related === 'Lead') {
                    $id = $this->leads()?->first()?->id ?? '';
                    $link = route('tenant.leads.edit', ['lead' => $id, 'tenant' => tenant('id')]);
                }

                if ($related === 'Contact') {
                    $id = $this->contacts()?->first()?->id ?? '';
                    $link = route('tenant.contacts.edit', ['contact' => $id,  'tenant' => tenant('id')]);
                }

                if ($related === 'Organization') {
                    $id = $this->organizations()?->first()?->id ?? '';
                    $link = route('tenant.organization.edit', ['organization' => $id,  'tenant' => tenant('id')]);
                }

                if ($related === 'Project') {
                    $id = $this->projects()?->first()?->id ?? '';
                    $link = route('tenant.projects.edit', ['project'=> $id, 'tenant'=> tenant('id')]);
                }

                return $link;
            }
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




    /**
     * -------------------- RELATIONSHIPS --------------------
     * owner()
     *    - Each lead belongs to a user (the owner of the lead).
     *
     * leadType()
     *    - Each lead belongs to a lead type, categorizing the nature of the lead.
     *
     * stage()
     *    - Each lead belongs to a stage, representing its current status in the pipeline.
     *
     * rating()
     *    - Each lead belongs to a rating, showing how strong or valuable the lead is.
     *
     * source()
     *    - Each lead belongs to a source, indicating where it originated (e.g., website, referral).
     *
     * industry()
     *    - Each lead belongs to an industry, providing business context for the lead.
     *
     * country()
     *    - Each lead belongs to a country, used for geographical segmentation.
     *
     * tags()
     *    - A lead can have many tags (many-to-many), allowing flexible categorization.
     *
     * customFieldValues()
     *    - A lead can have many custom field values (polymorphic relation),
     *      used for dynamic, tenant-defined fields.
     *
     * activities()
     *    - A lead can have many activities (morphMany), such as calls, emails, or meetings.
     *
     * opportunities()
     *    - A lead can have many opportunities (morphMany), linking the lead to potential deals.
     *
     * associates()
     *    - A lead can have many associates (many-to-many users),
     *      representing users who are linked to the lead besides the owner.
     */

    public function categories(): MorphToMany
    {
        return $this->morphToMany(DataCategory::class, 'categoryable', 'categoryables')
            ->withTimestamps()
            ->select('data_categories.*');
    }

    public function associates(): MorphToMany
    {
        return $this->morphToMany(Contact::class, 'associatable', 'associatables', 'associatable_id', 'contact_id')
            ->withTimestamps()
            ->select('contacts.*');
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable', 'taggables')
            ->withTimestamps()
            ->select('tags.*');
    }

    public function stages(): MorphToMany
    {
        return $this->morphToMany(Stage::class, 'stageable', 'stageables', 'stageable_id', 'stage_id')
            ->using(Stageable::class)
            ->withPivot('id', 'causer_id', 'duration', 'created_at', 'updated_at')
            ->withTimestamps()
            ->select('stages.*');
    }

    public function products(): MorphToMany
    {
        return $this->morphToMany(Product::class, 'productable', 'productables')
            ->withTimestamps()
            ->select('products.*');
    }

    public function tasks(): MorphToMany
    {
        return $this->morphToMany(Task::class, 'taskable', 'taskables')
            ->withTimestamps()
            ->select('tasks.*');
    }

    public function notes(): MorphToMany
    {
        return $this->morphToMany(Note::class, 'noteable', 'noteables')
            ->withTimestamps()
            ->select('notes.*');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'owner_id', 'id');
    }

    public function sources(): MorphToMany
    {
        return $this->morphToMany(DataSource::class, 'sourceable', 'sourceables')
            ->withTimestamps();
    }

    public function revenue_types(): MorphToMany
    {
        return $this->morphToMany(DataRevenue::class, 'revenue_typeable', 'revenue_typeables', 'revenue_typeable_id', 'data_revenue_type_id')
            ->withTimestamps();
    }

    public function aiAnalysis(): MorphMany
    {
        return $this->morphMany(AiAnalysis::class, 'analysisable')->chaperone();
    }

    public function attachmentFiles(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachmentable');
    }

    public function opportunityables()
    {
        return $this->hasMany(Opportunityable::class, 'opportunity_id');
    }


    public function leads(): MorphToMany
    {
        return $this->morphedByMany(
            Lead::class,
            'opportunityable',
            'opportunityables',
            'opportunity_id',
            'opportunityable_id',
        )->withTimestamps();
    }

    public function contacts(): MorphToMany
    {
        return $this->morphedByMany(
            Contact::class,
            'opportunityable',
            'opportunityables',
            'opportunity_id',
            'opportunityable_id',
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
            ['stageables', 'stageable_type', 'stageable_id'],
            ['sourceables', 'sourceable_type', 'sourceable_id'],
            ['categoryables', 'categoryable_type', 'categoryable_id'],
            ['organizationables', 'organizationable_type', 'organizationable_id'],

        ], Opportunity::class);

        self::deleteFromPivotTables([
            'opportunityables'    => 'opportunity_id'
        ]);
    }
}
