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
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Project extends Model
{
    use HasFactory, Notifiable, HasUlids, LogsActivity;
    use CleansUpMorphRelationsTrait, TenantCommonModelTrait;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Fillable props
     *
     * @var array
     */
    protected $fillable = [
        'owner_id',
        'causer_id',
        'name',
        'details',
        'is_active',
        'is_sample',
    ];

    /**
     * Appended props
     *
     * @var array
     */
    protected $appends = ['model_time', 'owner_name', 'first_letter', 'actions_links', 'get_last_stage', 'get_project_stats', 'tag_name', 'get_category_name', 'get_tags', 'get_project_name', 'get_associated_persons', 'get_ai_payload', 'get_ai_analysis', 'get_status', 'get_associates_name', 'get_tags_name', 'get_category'];

    /**
     * Get model time
     */
    protected function modelTime(): Attribute
    {
        return new Attribute(
            get: fn() => ['create_diff' => $this->created_at->diffForHumans(), 'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'), 'update_diff' => $this->updated_at->diffForHumans(), 'update_formatted' => _dateFormat($this->updated_at, 'd M, Y (h:i A)'), 'create_date_only' => _dateFormat($this->created_at, 'd M Y'),]
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

    protected function actionsLinks(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'edit'   => $this->id
                    ? route('tenant.projects.edit', [
                        'project' => $this->id,
                        'tenant'      => tenant('id'),
                    ])
                    : null,
                'delete' => null,
            ]
        );
    }

    protected function getLastStage(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('stages')
                ? $this->stages?->sortByDesc(fn($stage) => $stage->pivot?->created_at)->first()
                : ""
        );
    }
    protected function tagName(): Attribute
    {
        return Attribute::make(
            get: fn() =>
            $this->relationLoaded('tags')
                ? ($this->tags?->first()?->name ?? '')
                : ''
        );
    }
    protected function getProjectName(): Attribute
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


    protected function ownerName(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('owner')
                ? ($this->owner?->nickname ?? '')
                : ''
        );
    }



    public function getActivitylogOptions(): LogOptions
    {

        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(function (string $eventName) {
                $userName = Auth::user()?->name ?? 'System';
                $date = _dateFormat($this->created_at, 'd M Y, h:i:A');
                return "{$date} - Project '{$this->name}' was created by user '{$userName}'";
            })
            ->useLogName(PROJECT);
    }


    protected function getCategoryName(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('categories')
                ? $this->categories?->first()?->only(['id', 'type', 'name'])
                : ""
        );
    }
    protected function getCategory(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('categories')
                ? $this->categories?->first()
                : ""
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
    protected function getProjectStats(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'primary' => [
                    [
                        'label' => 'Project owner',
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
                        'label' => 'Category',
                        'value' => $this->get_project_name ?? 'N/A',
                        'icon'  => 'category',
                        'summary' => ''
                    ],
                    [
                        'label' => 'Stage',
                        'value' => @$this->get_last_stage?->label,
                        'icon'  => 'stage',
                        'summary' => '1000' . ' days in stage'
                    ],
                    [
                        'label' => 'Project life',
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
                    'name' => ucwords($this->get_project_name),
                    'summary' => $this->details ? _getSubString($this->details, 170, true, options: ['preserveWords' => true]) : "",
                    'details' => $this->details,
                    'created_at' => $this->model_time['create_diff'] ?: 'N/A',
                    'updated_at' => $this->model_time['update_diff'] ?: 'N/A'
                ]
            ]
        );
    }

    protected function getAiPayload(): Attribute
    {
        return Attribute::make(
            get: function () {
                $tasks = $this->relationLoaded('tasks') ? $this->tasks : collect();
                $notes = $this->relationLoaded('notes') ? $this->notes : collect();
                $projectName = $this->get_project_name ?? $this->nickname ?? '';
                return $this->getAiPayloadData(entityType: PROJECT, entityDisplayName: $projectName, tasks: $tasks, notes: $notes);
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


    /* -------------------- RELATIONSHIPS --------------------
     *
     *
     * stages()           → Many-to-many polymorphic relation. A lead can be assigned to multiple stages 
     *                      (through stageables pivot) with extra pivot data like causer_id, duration, etc.
     * 
     * ratings()          → Many-to-many polymorphic relation. A lead can be given one or more ratings.
     * 
     * categories()       → Many-to-many polymorphic relation. A lead can belong to one or more data categories.
     *
     * associates()       → Many-to-many polymorphic relation. A lead can have multiple associated contacts 
     *                      (through associatables pivot table).
     * 
     * tags()             → Many-to-many polymorphic relation. A lead can be tagged with multiple tags.
     *
     * owner()            → Standard belongs-to relation. A lead belongs to one contact who is the owner.
     *
     * ------------------------------------------------------- */


    public function stages(): MorphToMany
    {
        return $this->morphToMany(Stage::class, 'stageable', 'stageables', 'stageable_id', 'stage_id')
            ->using(Stageable::class)
            ->withPivot('id', 'causer_id', 'stage_id', 'stageable_id', 'duration', 'created_at', 'updated_at')
            ->withTimestamps();
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable', 'taggables')
            ->withTimestamps();
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

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'owner_id', 'id');
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

    public function aiAnalysis(): MorphMany
    {
        return $this->morphMany(AiAnalysis::class, 'analysisable')->chaperone();
    }

    public function opportunities(): MorphToMany
    {
        return $this->morphedByMany(
            Opportunity::class,
            'projectable',
            'projectables',
            'project_id',
            'projectable_id'
        )->withTimestamps();
    }
    public function organizations(): MorphToMany
    {
        return $this->morphedByMany(
            Organization::class,
            'projectable',
            'projectables',
            'project_id',
            'projectable_id',
        )->withTimestamps();
    }
    public function contacts(): MorphToMany
    {
        return $this->morphedByMany(
            Contact::class,
            'projectable',
            'projectables',
            'project_id',
            'projectable_id'
        )->withTimestamps();
    }
    public function leads(): MorphToMany
    {
        return $this->morphedByMany(
            Lead::class,
            'projectable',
            'projectables'
        )
            ->withTimestamps();
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
     * - `associatables`   where `associatable_type = Task::class`
     * - `stageables`      where `stageable_type = Task::class`
     * - `priorityables`   where `priorityable_type = Task::class`
     * - `categoryables`   where `categoryable_type = Task::class`
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
            ['categoryables', 'categoryable_type', 'categoryable_id'],
            ['taggables', 'taggable_type', 'taggable_id'],
        ], Project::class);

        self::deleteFromPivotTables([
            'projectables'    => 'project_id'
        ]);
    }
}
