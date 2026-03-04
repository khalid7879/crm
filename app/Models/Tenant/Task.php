<?php

namespace App\Models\Tenant;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Traits\LogsActivity;
use App\Traits\CleansUpMorphRelationsTrait;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * Task Model
 *
 * Represents a task in the system with relationships to users, stages, priorities, categories,
 * leads, and opportunities. Uses ULIDs as primary keys.
 * 
 * Sections:
 *  - Model Configuration: primary key, fillable, casts, appended attributes
 *  - Attribute Accessors / Mutators: model_time, last_stage, date_start
 *  - Relationships: stages, associates, priorities, categories, leads/opportunities/contacts/projects
 *  - Convenience Relationships: causer, owner
 * 
 * @author Mamun
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class Task extends Model
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
        'name',
        'details',
        'date_start',
        'date_due',
        'date_reminder',
        'progress_percent',
        'is_sample'
    ];

    protected $casts = [
        'date_start'       => 'datetime',
        'date_due'         => 'datetime',
        'date_reminder'    => 'datetime',
        'progress_percent' => 'float',
    ];

    protected $attributes = [
        'progress_percent' => 0,
        'is_active'        => 1,
    ];

    protected $appends = [
        'get_causer',
        'model_time',
        'get_last_stage',
        'get_category_name',
        'get_colored_category',
        'get_priority',
        'actions_links',
        'get_task_type',
        'get_associated_persons',
        'get_task_priority',
        'get_task_stats',
        'get_taskable_id',
        'get_associates_name',
        'get_status',
        'get_parent_link'
    ];

    /* --------------------------------------------------------------------------
        Activity Log Configuration
    -------------------------------------------------------------------------- */
    public function getActivitylogOptions(): LogOptions
    {

        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(function (string $eventName) {
                $userName = Auth::user()?->name ?? 'System';
                $date = _dateFormat($this->created_at, 'd M Y, h:i:A');
                return "{$date} - Task '{$this->name}' was created by user '{$userName}'";
            })
            ->useLogName(TASK);
    }

    /* --------------------------------------------------------------------------
       ATTRIBUTE ACCESSORS / MUTATORS
       --------------------------------------------------------------------------
       - dateDue: returns formatted created_at time
       - name: returns first letter capitalize
       - dateStart: defaults to now() if empty
       - getModelTime: formatted creation and update info
       - getLastStage: returns latest stage or ""
       - getCategoryName: returns task relational category name
       - getColoredCategory: returns task relational colorful category name
       - getPriority: returns task relational colorful priority name
    -------------------------------------------------------------------------- */

    /**
     * Return the causer's nickname if the relationship is preloaded.
     * Avoids N+1 by not triggering additional queries.
     */
    protected function getCauser(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('causer')
                ? $this->causer?->nickname ?? ''
                : ''
        );
    }

    protected function name(): Attribute
    {
        return new Attribute(
            get: fn($value) => !empty($value) ? ucfirst($value) : $value
        );
    }

    protected function details(): Attribute
    {
        return new Attribute(
            get: fn($value) => !empty($value) ? $value : ''
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

    protected function getLastStage(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('stages')
                ? $this->stages?->sortByDesc(fn($stage) => $stage->pivot?->created_at)->first()
                : ""
        );
    }

    protected function getTaskPriority(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('priorities')
                ? $this->priorities->sortByDesc('pivot.created_at')->first()
                : ''
        );
    }

    protected function getCategoryName(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('categories')
                ? $this->categories->sortByDesc('pivot.created_at')->first()
                : ""
        );
    }

    protected function getColoredCategory(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('categories')
                ? [
                    'letter' => $this->categories?->first()?->name,
                    'bgColor' => _getAlphabeticalColorName(Str::substr($this->categories?->first()?->name, 0, 1))
                ]
                : [
                    'letter' => 'Eager load category relation',
                    'bgColor' => ''
                ]
        );
    }

    protected function getPriority(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('priorities')
                ? [
                    'letter' => $this->priorities?->first()?->name,
                    'bgColor' => _getAlphabeticalColorName(Str::substr($this->priorities?->first()?->name, 0, 1)),
                    'details' => $this->priorities?->first()
                ]
                : [
                    'letter' => 'Eager load priority relation',
                    'bgColor' => '',
                    'details' => ""
                ]
        );
    }

    protected function actionsLinks(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'edit'   => $this->id
                    ? route('tenant.tasks.edit', ['task' => $this->id, 'tenant' => tenant('id')])
                    : "",
                'delete' => "",
            ]
        );
    }
    protected function getTaskType(): Attribute
    {
        return Attribute::make(
            get: fn() =>
            $this->relationLoaded('taskables') && $this->taskables->first()
                ? class_basename($this->taskables->first()->taskable_type)
                : ''
        );
    }


    protected function getTaskableId(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('taskables')
                ? $this->taskables?->first()?->taskable_id
                : ""
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
    protected function getTaskStats(): Attribute
    {
        return Attribute::make(
            get: function () {

                $related = $this->get_task_type ?? 'N/A';
                $icon = 'category';

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

                if ($related === 'Task') {
                    $related =  $this->tasks()?->first()?->name ??  '';
                    $icon = 'taskType';
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
                            'label' => 'Task owner',
                            'value' => $this->relationLoaded('owner')
                                ? ($this->owner?->nickname ?? '')
                                : '',
                            'icon'  => 'usersOwner',
                        ],
                        [
                            'label' => 'Created at',
                            'value' => $this->model_time['create_diff'] ?? '',
                            'icon'  => 'date',
                        ],
                        [
                            'label' => 'Last modified',
                            'value' => $this->model_time['update_diff'] ?? '',
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
                            'label' => 'Task',
                            'value' => $this->name ?? 'N/A',
                            'icon'  => 'task',
                            'summary' => ''
                        ],
                        [
                            'label' => 'Task type',
                            'value' => $this->get_task_type ?? 'N/A',
                            'icon'  => $icon,
                            'summary' => $related,
                            'link' => $this->get_parent_link
                        ],
                        [
                            'label' => 'Stage',
                            'value' => $this->get_last_stage?->label ?? 'N/A',
                            'icon'  => 'stage',
                            'summary' => '1000 days in stage',
                        ],
                        [
                            'label' => 'Progress',
                            'value' => $this->progress_percent . "%" ?? '0%',
                            'icon'  => 'progress',
                            'summary' => '',
                        ],
                        [
                            'label' => 'Task life',
                            'value' => ceil($this->created_at->floatDiffInDays(now())) . ' days',
                            'icon'  => 'heart',
                            'summary' => 'Created: ' . ($this->model_time['create_formatted'] ?? ''),
                        ],
                        [
                            'label' => 'Task priority',
                            'value' => $this->get_task_priority->name ?? 'N/A',
                            'icon'  => 'priority',
                            'summary' => '',
                        ],
                        [
                            'label' => 'Category',
                            'value' => $this->get_category_name->name ?? 'N/A',
                            'icon'  => 'category',
                            'summary' => '',
                        ],
                        [
                            'label' => 'Start date',
                            'value' => _dateFormat($this->date_start, 'd M Y') ?: 'N/A',
                            'icon'  => 'dateStart',
                            'summary' => '',
                        ],
                        [
                            'label' => 'Due date',
                            'value' => _dateFormat($this->date_due, 'd M Y') ?: 'N/A',
                            'icon'  => 'dateEnd',
                            'summary' => '',
                        ],
                        [
                            'label' => 'Reminder date',
                            'value' => _dateFormat($this->date_reminder, 'd M Y, H:i A') ?: 'N/A',
                            'icon'  => 'dateReminder',
                            'summary' => '',
                        ],
                        [
                            'label' => 'Created at',
                            'value' => $this->model_time['create_diff'] ?? 'N/A',
                            'icon'  => 'dateCreated',
                            'summary' => $this->model_time['create_formatted'] ?? '',
                        ],
                        [
                            'label' => 'Last modified',
                            'value' => $this->model_time['update_diff'] ?? 'N/A',
                            'icon'  => 'dateUpdated',
                            'summary' => $this->model_time['update_formatted'] ?? '',
                        ],
                    ],

                    'modelData' => [
                        'name' => ucwords($this->name),
                        'summary' => $this->details
                            ? _getSubString($this->details, 170, true, ['preserveWords' => true])
                            : "",
                        'details' => $this->details,
                        'created_at' => $this->model_time['create_formatted'] ?? 'N/A',
                        'updated_at' => $this->model_time['update_formatted'] ?? 'N/A',
                    ],
                ];
            }
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

    protected function getStatus(): Attribute
    {
        return Attribute::make(
            get: fn($value, $attributes) => ($attributes['is_active'] ?? 0) ? 'Active' : 'Inactive'
        );
    }

    protected function getParentLink(): Attribute
    {
        return Attribute::make(
            get: function () {

                $related = $this->get_task_type ?? 'N/A';
                $link = '';

                if ($related === 'Lead') {
                    $id = $this->leads()?->first()?->id ?? '';
                    $link = route('tenant.leads.edit', ['lead' => $id, 'tenant' => tenant('id')]);
                }

                if ($related === 'Opportunity') {
                    $id = $this->opportunities()?->first()?->id ?? '';
                    $link = route('tenant.opportunity.edit', ['opportunity' => $id,  'tenant' => tenant('id')]);
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
                    $link = route('tenant.projects.edit', ['project' => $id,  'tenant' => tenant('id')]);
                }

                return $link;
            }
        );
    }




    /* --------------------------------------------------------------------------
       RELATIONSHIPS
       --------------------------------------------------------------------------
       - stages: many-to-many polymorphic with pivot data
       - associates: users associated to task
       - priorities: task priorities
       - categories: task categories
       - leads: task related leads
       - opportunities: task related opportunities
       - causer: user who created the task
       - owner: user who owns the task
    -------------------------------------------------------------------------- */

    public function stages(): MorphToMany
    {
        return $this->morphToMany(Stage::class, 'stageable', 'stageables', 'stageable_id', 'stage_id')->withTimestamps();
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


    public function causer()
    {
        return $this->belongsTo(Contact::class, 'causer_id');
    }

    public function owner()
    {
        return $this->belongsTo(Contact::class, 'owner_id');
    }

    public function leads(): MorphToMany
    {
        return $this->morphedByMany(
            Lead::class,
            'taskable',
            'taskables',
            'task_id',
            'taskable_id',
        )->withTimestamps();
    }

    public function opportunities(): MorphToMany
    {
        return $this->morphedByMany(Opportunity::class, 'taskable', 'taskables', 'task_id', 'taskable_id')
            ->withTimestamps();
    }

    public function notes(): MorphToMany
    {
        return $this->morphToMany(Note::class, 'noteable', 'noteables')
            ->withTimestamps()
            ->select('notes.*');
    }

    public function contacts(): MorphToMany
    {
        return $this->morphedByMany(
            Contact::class,
            'taskable',
            'taskables',
            'task_id',
            'taskable_id',
        )->withTimestamps();
    }

    public function tasks(): MorphToMany
    {
        return $this->morphToMany(Task::class, 'taskable', 'taskables', 'taskable_id', 'task_id')
            ->withTimestamps();
    }

    public function parentTasks(): MorphToMany
    {
        return $this->morphToMany(
            Task::class,
            'taskable',
            'taskables',
            'task_id',
            'taskable_id',
        )->withTimestamps();
    }

    public function taskHistory()
    {
        return $this->hasMany(TaskHistory::class, 'task_id');
    }

    public function organizations(): MorphToMany
    {
        return $this->morphedByMany(
            Organization::class,
            'taskable',
            'taskables',
            'task_id',
            'taskable_id',
        )->withTimestamps();
    }

    public function projects(): MorphToMany
    {
        return $this->morphedByMany(
            Project::class,
            'taskable',
            'taskables',
            'task_id',
            'taskable_id',
        )->withTimestamps();
    }

    public function taskables()
    {
        return $this->hasMany(Taskable::class, 'task_id');
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
            ['priorityables', 'priorityable_type', 'priorityable_id'],
            ['categoryables', 'categoryable_type', 'categoryable_id'],
        ], Task::class);

        static::deleting(function ($model) {
            DB::table('taskables')
                ->where('task_id', $model->id)
                ->delete();
        });
    }
}
