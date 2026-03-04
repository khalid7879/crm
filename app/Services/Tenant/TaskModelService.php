<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Models\Tenant\Task;
use App\Models\Tenant\TaskHistory;
use App\Traits\TenantCommonTrait;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\DB;
use App\Traits\TenantCommonModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

/**
 * TaskModelService
 *
 * Handles CRUD, validation, formatting, and pivot attachments for Task resources.
 *
 * Responsibilities:
 *  - Validate incoming task data
 *  - Create/update tasks
 *  - Attach related models (associates, stage, priority, category, parent model)
 *  - Change stage and progress percent
 *  - Format task data for display
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class TaskModelService extends BaseModelService
{
    use TenantCommonTrait;
    use TenantCommonModelTrait;
    /**
     * Constructor
     *
     * @param Task $model
     * @param TenantLeadService $leadModelService
     * @param TenantLeadStageService $dataStage
     */
    public function __construct(
        Task $model,
        private TenantUserService $tenantUserService,
        private TenantLeadService $leadModelService,
        private TenantLeadStageService $dataStage,
        private OrganizationModelService $organizationService,
        private TenantIndustryTypeService $dataCategory,
        private TenantLeadPriorityService $dataPriorityService,
        private TenantOpportunityService $opportunityModelService,
        private TenantProjectService $tenantProjectService,
        private ContactModelService $contactModelService
    ) {
        parent::__construct($model);
        $this->tenantUserService = $tenantUserService;
        $this->leadModelService = $leadModelService;
        $this->dataStage = $dataStage;
        $this->organizationService = $organizationService;
        $this->dataCategory = $dataCategory;
        $this->dataPriorityService = $dataPriorityService;
        $this->contactModelService = $contactModelService;
    }

    /**
     * Return predefined task routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'tasksList'   => 'tenant.tasks.index',
            'tasksCreate' => 'tenant.tasks.create',
            'tasksStore'  => 'tenant.tasks.store',
            'tasksEdit'   => 'tenant.tasks.edit',
            'tasksShow'   => 'tenant.tasks.show',
            'tasksUpdate' => 'tenant.tasks.update',
            'tasksDelete' => 'tenant.tasks.destroy',
            'taskHistoryData'  => 'tenant.tasks-history.data',
            'tasksChangeStage' => 'tenant.tasks.changeStageAndProgressPercent',
            'tasksWiseDependency' => 'tenant.tasks.wise.dependency',
            'handleSampleData' => 'tenant.tasks.handle.sample.data',
            'tasksDeleteWithDependency' => 'tenant.tasks.delete.with.dependency',
            'notesStore'       => 'tenant.notes.store',
            'notesUpdate'      => 'tenant.notes.update',
            'notesShow'        => 'tenant.notes.show',
            'notesDelete'      => 'tenant.notes.destroy',
            'opportunityUpdate'             => 'tenant.opportunity.update',
            'opportunityShow'               => 'tenant.opportunity.show',
            'opportunityDelete'             => 'tenant.opportunity.destroy',
            'opportunityUnLink'             => 'tenant.opportunity.unlink',
            'getLabelValueFormattedList'    => 'tenant.tasks.getLabelValueFormattedList',
            'dataRelatedRoutes'             => [
                'LEAD'                      => 'tenant.leads.getLabelValueFormattedList',
                'PROJECT'                   => 'tenant.projects.getLabelValueFormattedList',
                'OPPORTUNITY'               => 'tenant.opportunity.getLabelValueFormattedList',
                'CONTACT'                   => 'tenant.contacts.getLabelValueFormattedList',
                'ORGANIZATION'              => 'tenant.organization.getLabelValueFormattedList',
                'TASK'                      => 'tenant.tasks.getLabelValueFormattedList',
            ],
        ];
    }

    /**
     * Validate task inputs
     *
     * @param array $inputs
     * @return array
     */
    public function doResourceValidation(array $inputs)
    {
        ## Perform validation using defined rules and messages
        return Validator::make($inputs, $this->rules(), $this->messages())->validate();
    }

    /**
     * Validation rules for tasks
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'associates' => ['nullable'],
            'causer_id' => ['required'],
            'data_category_id' => ['nullable'],
            'data_priority_id' => ['required'],
            'date_due' => ['nullable', 'string'],
            'date_reminder' => ['nullable', 'string'],
            'date_start' => ['nullable', 'string'],
            'details' => ['nullable'],
            'is_active' => ['required'],
            'name' => ['required', 'string', 'max:500'],
            'owner_id' => ['required'],
            'progress_percent' => ['required'],
            'related_to_type' => ['required'],
            'stage_id' => ['required'],
            'taskable_id' => ['nullable'],
        ];
    }

    /**
     * Custom validation messages
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'name.required' => __('Task name can not be empty'),
        ];
    }

    /**
     * Store or update a Task resource
     *
     * Handles:
     *  - Extracting allowed fields
     *  - Resolving `causer_id` and `owner_id` via usersContactReference
     *  - Creating/updating task
     *  - Attaching related models: associates, stage, priority, category
     *  - Attaching task to parent model (Lead/Project/Opportunity/etc.)
     *
     * @param array $inputs Task input data
     * @return Task|string Newly created or updated task
     * @throws Exception
     */
    public function doResourceStore(array $inputs): Task|string
    {
        $model = null;

        // dd($inputs);

        try {
            ## Extract only allowed fields
            $modelInputs = collect($inputs)->only([
                'causer_id',
                'owner_id',
                'name',
                'details',
                'date_start',
                'date_due',
                'date_reminder',
                'progress_percent',
                'is_active',
            ])->toArray();

            ## Create or update task
            if (!empty($inputs['id'])) {
                $model = $this->model->findOrFail($inputs['id']);
                $model->update($modelInputs);
            } else {
                $model = $this->model->create($modelInputs);
            }

            if (!$model) throw new Exception(COMMON_ERROR_MSG);

            ## Attach associates
            if (!empty($inputs['associates']) && is_array($inputs['associates'])) {
                $associates = $inputs['associates'];
                // dd($associates);
                $this->doAttachWithParentModel(parentModel: $model, childModel: $associates, relationalMethod: 'associates', syncType: 'sync');
            }

            ## Attach stage
            if (!empty($inputs['stage_id'])) {
                $this->doAttachWithParentModel(parentModel: $model, childModel: $inputs['stage_id'], relationalMethod: 'stages', additionalInputs: ['causer_id' => $modelInputs['causer_id']], syncType: 'sync');
            }

            ## Attach priority
            if (!empty($inputs['data_priority_id'])) {
                $this->doAttachWithParentModel(parentModel: $model, childModel: $inputs['data_priority_id'], relationalMethod: 'priorities', syncType: 'sync');
            }

            ## Attach category
            if (!empty($inputs['data_category_id'])) {
                $this->doAttachWithParentModel(parentModel: $model, childModel: $inputs['data_category_id'], relationalMethod: 'categories', syncType: 'sync');
            }

            ## Attach task to parent model
            if (!empty($inputs['taskable_id'])) {
                $parentModel = $this->getTasksParentModel($inputs['related_to_type'], $inputs['taskable_id']);
                if (!empty($inputs['taskable_id']) && $parentModel) {
                    $this->doAttachWithParentModel(parentModel: $parentModel, childModel: $model->id, relationalMethod: 'tasks', syncType: 'attach');
                }
                $parentModel->touch();
            }
            ## when related_to_type is TASK and taskable_id is empty 
            if(empty(($inputs['taskable_id'])) && !empty($inputs['related_to_type']) == TASK){
                $parentModel = $this->getTasksParentModel($inputs['related_to_type'], $model->id);
                if ($parentModel) {
                    $this->doAttachWithParentModel(parentModel: $parentModel, childModel: $model->id, relationalMethod: 'tasks', syncType: 'attach');
                }
            }
            $modelInputs['task_id'] = $model->id;
            $this->storeTaskHistory($modelInputs, $inputs);
            return $model;
        } catch (Throwable $th) {
            ## Delete newly created task on failure
            if (empty($inputs['id'])) $model?->delete();

            if ($th->getCode() === 23000) throw new Exception(MISSING_FIELD);

            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Retrieve paginated task list
     *
     * @param array $requests
     * @return mixed
     */
    public function resourceList(array $requests = []): mixed
    {
        ## Fetch paginated tasks with relations
        try {
            return $this->getPaginatedModels([...$requests, 'with' => [
                'associates',
                'stages',
                'priorities',
                'categories',
                'taskables',
            ]]);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Retrieve parent model for a task
     *
     * @param string $parentType Parent type (LEAD, PROJECT, etc.)
     * @param string $parentId Parent model ID
     * @return mixed
     * @throws Exception
     */
    public function getTasksParentModel(string $parentType, string $parentId): mixed
    {
        // dd($parentType,$parentId);

        ## Map parent types to model services
        $parents = ['LEAD' => $this->leadModelService, 'OPPORTUNITY' => $this->opportunityModelService, 'PROJECT' => $this->tenantProjectService, 'ORGANIZATION' => $this->organizationService, 'CONTACT' => $this->contactModelService];

        try {

            if ($parentType == TASK) {
                $model = $this->getSingleModel($parentId);
            } else {
                if (!isset($parents[$parentType])) throw new Exception("Task related to type '{$parentType}' is not supported.");
                $model = $parents[$parentType]->getSingleModel($parentId);
            }

            if (!$model) throw new Exception("Task related model not found for ID {$parentId}.");

            return $model;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), 0, $th);
        }
    }

    /**
     * Change task stage and progress percent
     *
     * @param array $inputs ['id' => taskId, 'value' => progressPercent]
     * @return mixed
     * @throws Exception
     */
    public function changeStageAndProgressPercent(array $inputs = []): mixed
    {
        try {
            if (!count($inputs)) throw new Exception(COMMON_ERROR_MSG);

            ## Destructure inputs
            ['id' => $id, 'value' => $value] = $inputs;

            ## Retrieve task
            $model = $this->model->findOrFail($id);

            ## Update progress
            $model->progress_percent = $value;
            $model->save();

            ## Update stage
            $stage = $this->dataStage->model
                ->where(['type' => 'TASK', 'stage_percent' => $value])
                ->orderBy('order', 'asc')
                ->first();

            if ($model && $stage) {
                $this->doAttachWithParentModel(parentModel: $model, childModel: $stage->id, relationalMethod: 'stages', additionalInputs: ['causer_id' =>             $modelInputs['owner_id']  = $this->usersContactReference(_getAuthInformation('id'))], syncType: 'sync');
            }

            return $model;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    /**
     * Get formatted task data (minimal)
     *
     * @param Model|string|int $model
     * @return array
     * @throws Exception
     */
    public function getModelFormattedData(Model|string|int $model): array
    {
        try {
            ## Fetch model and hide appended attributes
            $model = $this->getSingleModel(modelOrId: $model, selects: ['id', 'name', 'created_at'])?->makeHidden($this->model->getAppends());
            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            ## Return formatted array
            return [
                ['label' => 'Task name', 'value' => $model->name],
                ['label' => 'Task created on', 'value' => _dateFormat($model->created_at, 'd M, Y')],
            ];
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), $th->getCode(), $th);
        }
    }

    /**
     * Get formatted task data (full)
     *
     * @param Model|string|int $model
     * @return array
     * @throws Exception
     */
    public function getModelFormattedDataAll(Model|string|int $model): array
    {
        try {
            $model = $this->getSingleModel(modelOrId: $model, with: ['stages', 'categories', 'priorities', 'associates', 'taskables.taskable']);
            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            ## Base fields
            $data = $model->only(['causer_id', 'owner_id', 'date_due', 'date_reminder', 'date_start', 'details', 'name', 'progress_percent']);

            ## Conditional assignments
            $data['data_category_id'] =  $model->get_category_name['id'] ??  '';
            $data['stage_id'] = is_array($model->getLastStage->toArray()) && isset($model->getLastStage['id']) ? $model->getLastStage['id'] : '';
            $data['data_priority_id'] = is_array($model->get_priority) && isset($model->get_priority['details']['id']) ? $model->get_priority['details']['id'] : '';
            $data['associates'] = $model->associates ? $model->associates->pluck('id')->toArray() : [];
            $data['related_to_type'] = $model->get_task_type
                ? strtoupper($model->get_task_type)
                : "TASK";
            $data['taskable_id'] = $model->get_taskable_id ?? "";


            return $data;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), (int)$th->getCode(), $th);
        }
    }

    /**
     * Resource edit related list
     * 
     *  @author Mamun Hossen
     */
    public function taskEditRelatedData($model)
    {
        try {
            $modelData = $this->getSingleModel(
                $model,
                [
                    'associates',
                    'tasks.stages',
                    'tasks.priorities',
                    'stages',
                    'categories',
                    'priorities',
                    'notes',
                    'owner',
                    'taskables.taskable',
                    'leads',
                    'opportunities.owner',
                    'opportunities.stages',
                    'parentTasks.stages',
                    'parentTasks.priorities',
                    'taskHistory.stages',
                    'taskHistory.priorities',
                ]
            );

            $dependencyData = $this->getModelDependencies(TASK, $modelData, [USER, DATA_CATEGORY, DATA_PRIORITY, STAGE, DATA_RELATED_TYPE]);

            ## Group tasks by progress percent
            $tasksGrouped = $modelData->tasks->groupBy(
                fn($task) => ((int)$task->progress_percent < 100)
                    ? 'upcoming_activities'
                    : 'past_activities'
            );

            ## Prepare a summarized task report
            $modelData['tasks_report'] = collect([
                'upcoming_activities' => $tasksGrouped['upcoming_activities'] ?? collect(),
                'past_activities'     => $tasksGrouped['past_activities'] ?? collect(),
            ])->toArray();
            $modelData['note_report'] = $modelData->notes->sortByDesc('created_at')->values();
            $modelData['opportunities_report'] =  $modelData->opportunities?->sortByDesc('created_at')->values()->all();
            $modelData['parentTask_report']    =  $modelData->parentTasks?->sortByDesc('created_at')->values()->all();
            $modelData['taskHistory_report']   =  $modelData->taskHistory?->sortByDesc('created_at')->values()->all();
            
            $data =  $this->mapModelToFormData($modelData->toArray(), $dependencyData);
            return $data;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    /**
     * Retrieve dependency information for a given resource before deletion.
     * * @author Mamun Hossen
     */
    public function resourceDeleteDependencyData(array $inputs): array
    {
        try {
            return $this->getDeleteDependencyData(TASK, $inputs);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Delete a resource (e.g., Project, Organization, Opportunity) and its dependencies.
     * * @author Mamun Hossen
     */
    public function resourceDeleteWithDependency(array $dependency)
    {
        try {
            return $this->deleteDependency(TASK, $dependency);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource list with label value formation
     * 
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getLabelValueFormattedList(string $searchText = '')
    {

        return $this->model::query()
            ->select(
                'id as value',
                DB::raw("name as label")
            )
            ->when($searchText, function ($query, $searchText) {
                $query->where('name', 'like', "%{$searchText}%");
            })
            ->get()
            ->each
            ->setAppends([]);
    }


    /**
     * Get the  sample data for a given model type.
     * 
     *@author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function handleModelSampleData(array $inputs)
    {
        try {
            if (empty($inputs['model'] || $inputs['action'])) throw new Exception('Model is empty !');
            return $this->handleSampleData($inputs['model'], $inputs['action']);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), ' Line: ' . $th->getLine());
        }
    }

    /**
     * Generate tasks graph report based on the specified type
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getTasksChartReport(string $type): array
    {
        return match ($type) {
            TASKS_BY_MONTH      => $this->getTasksByMonthReport(),
            TASKS_BY_CATEGORY   => $this->getTasksByCategoryReport(),
            TASKS_BY_STAGES     => $this->getTasksByStagesReport(),
            TASKS_BY_PRIORITY   => $this->getTasksByPriorityReport(),
            TASKS_BY_TOP_OWNERS => $this->getTasksTopOwnersReport(),

            default => throw new Exception("Invalid tasks report type: $type"),
        };
    }




    /**
     * Generate a report of new tasks created over the last 12 months,
     * including the current month. Automatically spans across years.
     *
     * Returns a list of the last 12 months with lead counts (0 if none),
     * formatted like: "Dec 24", "Jan 25", etc.
     *
     * @return array
     *
     * @example
     * [
     *   { "index": 1, "month": "Dec 24", "year": 2024, "total_tasks": 3 },
     *   { "index": 2, "month": "Jan 25", "year": 2025, "total_tasks": 10 },
     *   ...
     * ]
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getTasksByMonthReport(): array
    {
        ## Determine date range: last 12 months including current month
        $endDate = now()->startOfMonth();
        $startDate = $endDate->copy()->subMonths(11);

        ## Fetch lead counts grouped by year and month
        $monthlyTasks = DB::table('tasks')
            ->selectRaw('
            YEAR(created_at) as year,
            MONTH(created_at) as month_number,
            COUNT(*) as total_tasks
        ')
            ->whereBetween('created_at', [$startDate, $endDate->copy()->endOfMonth()])
            ->groupBy('year', 'month_number')
            ->orderBy('year')
            ->orderBy('month_number')
            ->get();

        ## Build report for each of the last 12 months
        $runningTotal = 0;

        $report = collect(range(0, 11))->map(function ($i) use ($startDate, $monthlyTasks, &$runningTotal) {
            $date = $startDate->copy()->addMonths($i);
            $year = $date->year;
            $monthNumber = $date->month;

            ## Find monthly lead count
            $found = $monthlyTasks->first(function ($item) use ($year, $monthNumber) {
                return $item->year == $year && $item->month_number == $monthNumber;
            });

            $totalTasks = $found->total_tasks ?? 0;

            ## Update cumulative total
            $runningTotal += $totalTasks;

            return [
                'index'             => $i + 1,
                'labelShort'        => $date->format('M y'),
                'labelLong'         => $date->format('M Y'),
                'info'              => $year,
                'count'             => $totalTasks,
                'cumulative_total'  => $runningTotal,
            ];
        })->values()->toArray();

        return [
            'title' => 'Task by month',
            'info'  => 'A sum of tasks by month',
            'value' => array_sum(array_column($report, 'count')),
            'items' => $report,
            'jsComponent' => 'CreateBarChart',
            'chartAdditionalProps'  => [
                'barSize' => 30,
                'showCartesianGrid' => true
            ],
        ];
    }

    /**
     * Generate a report of tasks grouped by their categories.
     *
     * Returns a list of categories with task counts,
     * formatted for funnel chart visualization.
     *
     * @return array
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */

    public function getTasksByCategoryReport(): array
    {
        $result = DB::table('data_categories')->whereType(TASK)
            ->leftJoin('categoryables', function ($join) {
                $join->on('data_categories.id', '=', 'categoryables.data_category_id')
                    ->where('categoryables.categoryable_type', '=', Task::class);
            })
            ->select(
                'data_categories.name as labelLong',
                'data_categories.name as labelShort',
                DB::raw('COUNT(categoryables.categoryable_id) as count')
            )
            ->groupBy('data_categories.id', 'data_categories.name')
            ->orderBy('data_categories.name')
            ->get();

        $runningTotal = 0;
        $items = [];

        foreach ($result as $i => $item) {
            $runningTotal += $item->count;

            $items[] = [
                'index'            => $i + 1,
                'labelShort'       => $item->labelShort,
                'labelLong'        => $item->labelLong,
                'info'             => $item->labelLong,
                'count'            => (int) $item->count,
                'cumulative_total' => $runningTotal,
            ];
        }

        return [
            'title'                 => 'Tasks by category',
            'info'                  => 'A sum of tasks by category',
            'value'                 => $runningTotal,
            'items'                 => $items,
            'jsComponent'           => 'CreateFunnelSvgChart',
            'chartAdditionalProps'  => [
                'height' => 350,
                'width' => '100%',
                'showLabelInsideFunnel' => true,
                'autoHoverLast' => true,
            ],
        ];
    }


    /**
     * Get a report of tasks grouped by their data source.
     *
     * Each item in the report includes an enhanced structure:
     * - index: Sequential number starting from 1
     * - labelShort: Short label of the source name
     * - labelLong: Full label of the source name
     * - info: Additional info (in this case, source name)
     * - count: Number of tasks from this source
     * - cumulative_total: Running total of tasks up to this source
     * 
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getTasksByStagesReport(): array
    {
        $result = DB::table('stages')->whereType(TASK)
            ->leftJoin('stageables', function ($join) {
                $join->on('stages.id', '=', 'stageables.stage_id')
                    ->where('stageables.stageable_type', '=', Task::class);
            })
            ->select(
                'stages.name as labelLong',
                'stages.label as labelShort',
                DB::raw('COUNT(stageables.stageable_id) as count')
            )
            ->groupBy('stages.id', 'stages.name')
            ->orderBy('stages.name')
            ->get();

        $runningTotal = 0;
        $items = [];

        foreach ($result as $i => $item) {
            $runningTotal += $item->count;

            $items[] = [
                'index'            => $i + 1,
                'labelShort'       => $item->labelShort,
                'labelLong'        => $item->labelLong,
                'info'             => $item->labelLong,
                'count'            => (int) $item->count,
                'cumulative_total' => $runningTotal,
            ];
        }

        return [
            'title'                 => 'Tasks by status',
            'info'                  => 'A sum of tasks by status',
            'value'                 => $runningTotal,
            'items'                 => $items,
            'jsComponent'           => 'CreateBarVerticalChart',
            'chartAdditionalProps'  => [
                'barSize' => 30,
                'height' => 550,
                'showCartesianGrid' => true
            ],
        ];
    }

    public function getTasksByPriorityReport(): array
    {
        $result = DB::table('data_priorities')
            ->leftJoin('priorityables', function ($join) {
                $join->on('data_priorities.id', '=', 'priorityables.data_priority_id')
                    ->where('priorityables.priorityable_type', '=', Task::class);
            })
            ->select(
                'data_priorities.name as labelLong',
                'data_priorities.name as labelShort',
                DB::raw('COUNT(priorityables.priorityable_id) as count')
            )
            ->groupBy('data_priorities.id', 'data_priorities.name')
            ->orderBy('data_priorities.name')
            ->get();

        $runningTotal = 0;
        $items = [];

        foreach ($result as $i => $item) {
            $runningTotal += $item->count;

            $items[] = [
                'index'            => $i + 1,
                'labelShort'       => $item->labelShort,
                'labelLong'        => $item->labelLong,
                'info'             => $item->labelLong,
                'count'            => (int) $item->count,
                'cumulative_total' => $runningTotal,
            ];
        }

        return [
            'title'                 => 'Tasks by priority',
            'info'                  => 'A sum of tasks by priority',
            'value'                 => $runningTotal,
            'items'                 => $items,
            'jsComponent'           => 'CreateFunnelSvgChart',
            'chartAdditionalProps'  => [
                'height' => 350,
                'width' => '100%',
                'showLabelInsideFunnel' => true,
                'autoHoverLast' => true,
            ],
        ];
    }


    /**
     * Get a report of top users who generated the most tasks.
     *
     * This report summarizes which users (owner_id) contributed the highest
     * number of lead records in the system, including their nickname
     * from the contacts table.
     *
     * Returned structure:
     * - title: Report title
     * - info: Description text
     * - value: Total number of tasks across all users
     * - items: List of users sorted by highest number of tasks
     * - jsComponent: Frontend chart renderer
     * - chartAdditionalProps: Chart configuration
     *
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getTasksTopOwnersReport(): array
    {
        ## Total tasks in the system
        $totalTasks = DB::table('tasks')->count();

        ## Group tasks in the system by owner and join with contacts to get nickname
        $rows = DB::table('tasks')
            ->leftJoin('contacts', 'contacts.id', '=', 'tasks.owner_id')
            ->select(
                'tasks.owner_id',
                DB::raw('COUNT(tasks.id) AS task_count'),
                'contacts.nickname'
            )
            ->groupBy('tasks.owner_id', 'contacts.nickname')
            ->orderByDesc('task_count')
            ->get();

        ## Build report rows
        $stats = [];
        $cumulative = 0;
        $index = 1;

        foreach ($rows as $row) {

            $cumulative += $row->task_count;

            ## Use nickname or fallback to owner_id
            $label = $row->nickname
                ? ucwords($row->nickname)
                : 'User: ' . $row->owner_id;

            $stats[] = [
                'index'            => $index++,
                'labelShort'       => $label,
                'labelLong'        => '',
                'info'             => '',
                'count'            => $row->task_count,
                'cumulative_total' => $cumulative,
            ];
        }
        $sortedStats = collect($stats)->sortBy('labelShort')->values()->toArray();

        ## Final response
        return [
            'title'                 => 'Top users by tasks generation',
            'info'                  => 'Users who own the most tasks in the system',
            'value'                 => $totalTasks,
            'items'                 => $sortedStats,
            'jsComponent'           => 'CreatePieChart',
            'chartAdditionalProps'  => [
                'height' => '350px',
                'width' => '100%',
                'innerRadius' => 30,
            ],
        ];
    }


    /** 
     * Store task history
     * author: <mamunhossen149191@gmail.com>
     * @throws \Exception
     * return bool
     */
    public function storeTaskHistory(array $data, array $inputs): bool
    {
        try {
            $taskHistory = TaskHistory::create($data);
            ## Attach category
            if (!empty($inputs['data_category_id'])) {
                $this->doAttachWithParentModel(parentModel: $taskHistory, childModel: $inputs['data_category_id'], relationalMethod: 'categories', syncType: 'attach');
            }
            ## Attach associates
            if (!empty($inputs['associates']) && is_array($inputs['associates'])) {
                $associates = $inputs['associates'];
                // dd($associates);
                $this->doAttachWithParentModel(parentModel: $taskHistory, childModel: $associates, relationalMethod: 'associates', syncType: 'attach');
            }

            ## Attach stage
            if (!empty($inputs['stage_id'])) {
                $this->doAttachWithParentModel(parentModel: $taskHistory, childModel: $inputs['stage_id'], relationalMethod: 'stages', additionalInputs: ['causer_id' => $inputs['causer_id']], syncType: 'attach');
            }

            ## Attach priority
            if (!empty($inputs['data_priority_id'])) {
                $this->doAttachWithParentModel(parentModel: $taskHistory, childModel: $inputs['data_priority_id'], relationalMethod: 'priorities', syncType: 'attach');
            }
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
