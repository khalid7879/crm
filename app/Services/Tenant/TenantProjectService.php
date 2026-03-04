<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Project;
use App\Traits\TenantCommonTrait;
use App\Models\Tenant\Opportunity;
use App\Models\Tenant\Projectable;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant\Organization;
use App\Traits\TenantCommonModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class TenantProjectService extends BaseModelService
{
    use TenantCommonTrait;
    use TenantCommonModelTrait;
    public function __construct(
        Project $model,
        TenantUserService $tenantUserService,
        TagModelService $tagService,
        TenantIndustryTypeService $dataCategory,
        TenantLeadStageService $dataStage,
        TenantLeadPriorityService $dataPriorityService,
        TenantSocialLinkService $dataSocialPlatform,
        TenantDataDesignationService $dataDesignationService,
        CountryService $countyModelService,
        OrganizationModelService $organizationService,
        TenantLeadSourceService $dataSource,
        TenantRevenueService $revenueTypeModelService
    ) {
        parent::__construct($model);
        $this->tenantUserService = $tenantUserService;
        $this->tagService = $tagService;
        $this->dataCategory = $dataCategory;
        $this->dataStage = $dataStage;
        $this->dataPriorityService = $dataPriorityService;
        $this->dataSocialPlatform = $dataSocialPlatform;
        $this->dataDesignationService = $dataDesignationService;
        $this->countyModelService = $countyModelService;
        $this->organizationService = $organizationService;
        $this->dataSource = $dataSource;
        $this->revenueTypeModelService = $revenueTypeModelService;
    }

    /**
     * Return predefined module routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'projectsList'   => 'tenant.projects.index',
            'projectsCreate' => 'tenant.projects.create',
            'projectsStore'  => 'tenant.projects.store',
            'projectsEdit'   => 'tenant.projects.edit',
            'projectsUpdate' => 'tenant.projects.update',
            'projectsShow'   => 'tenant.projects.show',
            'projectsDelete' => 'tenant.projects.destroy',
            'projectsLinkData' => 'tenant.projects.link.data',
            'addProjectsLink'  => 'tenant.projects.add.link',
            'projectUnLink'   => 'tenant.projects.unlink',
            'projectsWiseDependency' => 'tenant.projects.wise.dependency',
            'projectsDeleteWithDependency' => 'tenant.projects.delete.with.dependency',
            'projectsStatusChange' => 'tenant.projects.status.change',
            'projectsChangeStage'  => 'tenant.projects.change.stage',
            'handleSampleData'     => 'tenant.projects.handle.sample.data',
            'tasksStore'             => 'tenant.tasks.store',
            'tasksStore'             => 'tenant.tasks.store',
            'tasksShow'              => 'tenant.tasks.show',
            'tasksDelete'            => 'tenant.tasks.destroy',
            'tasksChangeStage'       => 'tenant.tasks.changeStageAndProgressPercent',
            'tasksUpdate'            => 'tenant.tasks.update',
            'taskHistoryData'        => 'tenant.tasks-history.data',
            'notesStore'             => 'tenant.notes.store',
            'notesUpdate'            => 'tenant.notes.update',
            'notesShow'              => 'tenant.notes.show',
            'notesDelete'            => 'tenant.notes.destroy',
            'contactsShow'           => 'tenant.contacts.show',
            'contactsUpdate'         => 'tenant.contacts.update',
            'contactsDelete'         => 'tenant.contacts.destroy',
            'contactsLinkData'       => 'tenant.contacts.link.data',
            'addContactLink'         => 'tenant.contacts.add.link',
            'contactUnLink'          => 'tenant.contacts.unlink',
            'leadsLinkData'          => 'tenant.leads.link.data',
            'addLeadsLink'           => 'tenant.leads.add.link',
            'leadsUnLink'            => 'tenant.leads.unlink',
            'opportunityUpdate'      => 'tenant.opportunity.update',
            'opportunityShow'        => 'tenant.opportunity.show',
            'opportunityDelete'      => 'tenant.opportunity.destroy',
            'opportunityLinkData'    => 'tenant.opportunity.link.data',
            'addOpportunityLink'     => 'tenant.opportunity.add.link',
            'opportunityUnLink'      => 'tenant.opportunity.unlink',
            'organizationUpdate'     => 'tenant.organization.update',
            'organizationShow'       => 'tenant.organization.show',
            'organizationDelete'     => 'tenant.organization.destroy',
            'organizationsLinkData'  => 'tenant.organization.link.data',
            'addOrganizationsLink'   => 'tenant.organization.add.link',
            'organizationUnLink'     => 'tenant.organization.unlink',
            'getLabelValueFormattedList'    => 'tenant.projects.getLabelValueFormattedList',
            'dataRelatedRoutes'             => [
                'LEAD'                      => 'tenant.leads.getLabelValueFormattedList',
                'PROJECT'                   => 'tenant.projects.getLabelValueFormattedList',
                'OPPORTUNITY'               => 'tenant.opportunity.getLabelValueFormattedList',
                'CONTACT'                   => 'tenant.leads.getLabelValueFormattedList',
            ],

        ];
    }

    /**
     * Validate incoming inputs
     * 
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            $this->rules(),
            $this->messages(),
        )->validate();
    }


    /**
     * Validation rules
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'id' => ['nullable', 'string'],
            'causer_id' => ['nullable', 'string'],
            'owner_id' => ['nullable', 'string'],
            'name' => ['required', 'string', 'max:500'],
            'details' => ['nullable'],
            'is_active' => ['required'],
            'data_category_id' => ['nullable'],
            'stage_id' => ['nullable'],
            'tags' => ['nullable'],
            'finalStepInfos' => ['nullable', 'array'],
            'projectable_id' => ['nullable', 'string'],
            'related_to_type' => ['nullable', 'string'],

        ];
    }

    /**
     * Validation custom messages
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'name.required' => __('Field can not be empty'),
            'name.min' => __('Minimum character length', ['min' => 2]),
            'name.max' => __('Maximum character length', ['max' => 500]),
        ];
    }

    /**
     * Store or update a Lead resource with all its associations.
     *
     * This method:
     * - Creates or updates a lead with the given input fields
     * - Ensures creator/owner are mapped to their corresponding contact reference
     * - Attaches related entities (associates, socials, organization, designations,
     *   ratings, categories, sources, priorities, tags, employee sizes, preferred contact times, stages)
     *
     * @param  array  $inputs  Input data for lead creation or update
     * 
     * @return \App\Models\Tenant\Lead|string  Returns Lead model on success or error message string
     *
     * @throws \Exception When creation or update fails
     * 
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doResourceStore(array $inputs): Project|string
    {
        try {
            // dd($inputs);
            ## Filter allowed fields for lead creation
            $modelInputs = collect($inputs)->only([
                'causer_id',
                'owner_id',
                'name',
                'details',
                'is_active',
            ])->toArray();

            ## Create or update model
            $model = !empty($inputs['id'])
                ? tap($this->model->findOrFail($inputs['id']))->update($modelInputs)
                : $this->model->create($modelInputs);

            if (!$model) {
                throw new Exception(COMMON_ERROR_MSG);
            }


            if (!empty($inputs['projectable_id']) && !empty($inputs['related_to_type'])) {
                $parentModel = $this->getParentModel($inputs['related_to_type'], $inputs['projectable_id']);
                if (!empty($inputs['projectable_id']) && $parentModel) {
                    $this->doAttachWithParentModel(parentModel: $parentModel, childModel: $model->id, relationalMethod: 'projects', syncType: 'attach');
                    $parentModel->touch();
                }
            }

            ## Attach related models
            $this->attachRelations($model, $inputs, $modelInputs['causer_id'], $modelInputs['owner_id']);


            return $model;
        } catch (Throwable $th) {
            if ($th->getCode() === '23000') {
                throw new Exception(MISSING_FIELD);
            }

            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceList($requests): mixed
    {
        try {
            return $this->getPaginatedModels([...$requests, 'with' => ['owner', 'tags', 'stages', 'categories']]);
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }


    /**
     * Resource edit related list
     * 
     *  @author Mamun Hossen
     */
    public function projectEditRelatedData($model)
    {
        try {
            $modelData = $this->getSingleModel(
                $model,
                [
                    'associates',
                    'categories',
                    'notes',
                    'tags',
                    'stages',
                    'tasks',
                    'tasks.stages',
                    'tasks.categories',
                    'tasks.priorities',
                    'owner',
                    'aiAnalysis',
                    'contacts.owner',
                    'opportunities.owner',
                    'opportunities.organizations',
                    'opportunities.stages',
                    'organizations.owner',
                    'leads.owner.userReference',
                    'leads.designations',
                    'leads.organizations',
                    'leads.stages',
                    'leads.contacts',
                    'organizations.contacts',

                ]
            );

            $dependencyData = $this->getModelDependencies(PROJECT, $modelData, [USER, DATA_CATEGORY, STAGE, TAG, DATA_RELATED_TYPE, DATA_PRIORITY, SALUTATION, SOCIAL_LINK, DATA_DESIGNATION, COUNTRY, CITY, DATA_REVENUE, DATA_SOURCE, ORGANIZATION, CURRENCY]);

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

            $modelData['contacts_report'] = $modelData->contacts->sortByDesc('created_at')->values();
            $modelData['opportunities_report'] = $modelData->opportunities->sortByDesc('created_at')->values();
            $modelData['organizations_report'] = $modelData->organizations->sortByDesc('created_at')->values();
            $modelData['note_report'] = $modelData->notes->sortByDesc('created_at')->values();
            $modelData['leads_report'] = $modelData->leads->sortByDesc('created_at')->values();
            $modelData['leads_contacts_report'] = $modelData->leads
                ->flatMap(function ($lead) {
                    return $lead->contacts->map(function ($contact) use ($lead) {
                        $contact->lead_id = $lead->id;
                        $contact->lead_name = $lead->nickname;
                        return $contact;
                    });
                })
                ->sortByDesc('created_at')
                ->values();
            $modelData['organizations_contacts_report'] = $modelData->organizations
                ->flatMap(function ($organization) {
                    return $organization->contacts->map(function ($contact) use ($organization) {
                        $contact->organization_id = $organization->id;
                        $contact->organization_name = $organization->name;
                        return $contact;
                    });
                })
                ->sortByDesc('created_at')
                ->values();

            $data =  $this->mapModelToFormData($modelData->toArray(), $dependencyData);

            return $data;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    /**
     * Updating old stage and creating new on
     * 
     * @param array $inputs
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doResourceChangeStage(array $inputs = []): mixed
    {
        // dd($inputs);
        try {
            if (!count($inputs)) {
                throw new Exception(COMMON_ERROR_MSG);
            }
            // dd($inputs);

            $model = $this->model->with(['stages'])->find($inputs['stageable_id']);
            $causerId = $this->usersContactReference(_getAuthInformation('id'));
            $note = $inputs['details'] ?? '';

            // dd($model->get_last_stage['pivot']['created_at']);
            ## Update model last stage duration
            if ($model?->get_last_stage) {
                $pivotCreatedAt = $model->get_last_stage->pivot->created_at;

                $model->stages()
                    ->wherePivot('created_at', $pivotCreatedAt)
                    ->updateExistingPivot($model->get_last_stage['id'], [
                        'updated_at' => now(),
                        'duration'   => _getTotalDaysBetweenDays($pivotCreatedAt),
                        'causer_id'  => $causerId,
                    ]);
            }

            ## Attach new stage to lead
            $this->doAttachWithParentModel(parentModel: $model, childModel: $inputs['stage_id'], relationalMethod: 'stages', additionalInputs: ['causer_id' => $causerId, 'note' => $note], syncType: 'attach', updateExisting: false);

            return true;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    /**
     * Handle attaching all related models for an Opportunity.
     *
     * @param  \App\Models\Tenant\Opportunity  $model
     * @param  array  $inputs
     * @param  int|string|null  $causer_id
     * @param  int|string|null  $owner_id
     * @return void
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    protected function attachRelations(Project $model, array $inputs, int|string|null $causer_id, int|string|null $owner_id): void
    {
        ## ASSOCIATES (Users → Contacts)
        if (!empty($inputs['associates']) && is_array($inputs['associates'])) {
            $this->doAttachWithParentModel(
                parentModel: $model,
                childModel: $inputs['associates'],
                relationalMethod: 'associates'
            );
        }


        ## STAGE RELATION
        if (!empty($inputs['stage_id'])) {
            $this->doAttachWithParentModel(
                parentModel: $model,
                childModel: $inputs['stage_id'],
                relationalMethod: 'stages',
                additionalInputs: ['causer_id' => $causer_id],
                syncType: 'attach'
            );
        }

        ## Tags
        if (!empty($inputs['tags']) && is_array($inputs['tags'])) {
            $tags = $this->tagService->doResourceStoreAll($inputs['tags']);
            $this->doAttachWithParentModel($model, $tags, 'tags');
        }
        ## DIRECT FIELD RELATIONS
        $directRelations = [
            'data_category_id'     => 'categories',
        ];

        foreach ($directRelations as $field => $relation) {
            if (!empty($inputs[$field])) {
                $this->doAttachWithParentModel(
                    parentModel: $model,
                    childModel: $inputs[$field],
                    relationalMethod: $relation
                );
            }
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
                ['label' => 'Project name', 'value' => $model->name],
                ['label' => 'Project created on', 'value' => _dateFormat($model->created_at, 'd M, Y')],
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
            $model = $this->getSingleModel(modelOrId: $model, with: ['stages', 'categories', 'associates', 'tags']);
            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            ## Base fields
            $data = $model->only(['causer_id', 'owner_id', 'details', 'name', 'is_active']);

            ## Conditional assignments
            $data['data_category_id'] = is_array($model->get_category_name) && isset($model->get_category_name['id']) ? $model->get_category_name['id'] : '';
            $data['associates'] = $model->associates ? $model->associates->pluck('id')->toArray() : [];
            $data['tags'] = $model->tags ? $model->tags->pluck('name')->toArray() : [];
            $data['stage_id']  = $model->get_last_stage->id ?? '';
            // $data['model'] = $model;

            return $data;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), (int)$th->getCode(), $th);
        }
    }

    /**
     * Retrieve dependency information for a given resource before deletion.
     * * @author Mamun Hossen
     */
    public function resourceDeleteDependencyData(array $inputs): array
    {
        try {
            return $this->getDeleteDependencyData(PROJECT, $inputs);
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
            return $this->deleteDependency(PROJECT, $dependency);
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
     * Generate projects graph report based on the specified type
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getProjectsChartReport(string $type): array
    {
        return match ($type) {
            PROJECTS_BY_MONTH         => $this->getProjectsByMonthReport(),
            PROJECTS_BY_TOP_OWNERS    => $this->getProjectsByTopOwnersReport(),
            PROJECTS_BY_CATEGORY      => $this->getProjectsByCategoryReport(),
            PROJECTS_BY_STAGES        => $this->getProjectsByStagesReport(),

            default => throw new Exception("Invalid projects report type: $type"),
        };
    }


    /**
     * Generate a report of new projects created over the last 12 months,
     * including the current month. Automatically spans across years.
     *
     * Returns a list of the last 12 months with lead counts (0 if none),
     * formatted like: "Dec 24", "Jan 25", etc.
     *
     * @return array
     *
     * @example
     * [
     *   { "index": 1, "month": "Dec 24", "year": 2024, "total_projects": 3 },
     *   { "index": 2, "month": "Jan 25", "year": 2025, "total_projects": 10 },
     *   ...
     * ]
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getProjectsByMonthReport(): array
    {
        ## Determine date range: last 12 months including current month
        $endDate = now()->startOfMonth();
        $startDate = $endDate->copy()->subMonths(11);

        ## Fetch lead counts grouped by year and month
        $monthlyProjects = DB::table('projects')
            ->selectRaw('
            YEAR(created_at) as year,
            MONTH(created_at) as month_number,
            COUNT(*) as total_projects
        ')
            ->whereBetween('created_at', [$startDate, $endDate->copy()->endOfMonth()])
            ->groupBy('year', 'month_number')
            ->orderBy('year')
            ->orderBy('month_number')
            ->get();

        ## Build report for each of the last 12 months
        $runningTotal = 0;

        $report = collect(range(0, 11))->map(function ($i) use ($startDate, $monthlyProjects, &$runningTotal) {
            $date = $startDate->copy()->addMonths($i);
            $year = $date->year;
            $monthNumber = $date->month;

            ## Find monthly lead count
            $found = $monthlyProjects->first(function ($item) use ($year, $monthNumber) {
                return $item->year == $year && $item->month_number == $monthNumber;
            });

            $totalProjects = $found->total_projects ?? 0;

            ## Update cumulative total
            $runningTotal += $totalProjects;

            return [
                'index'             => $i + 1,
                'labelShort'        => $date->format('M y'),
                'labelLong'         => $date->format('M Y'),
                'info'              => $year,
                'count'             => $totalProjects,
                'cumulative_total'  => $runningTotal,
            ];
        })->values()->toArray();

        return [
            'title' => 'Projects by month',
            'info'  => 'A sum of projects by month',
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
     * Get a report of top users who generated the most leads.
     *
     * This report summarizes which users (owner_id) contributed the highest
     * number of lead records in the system, including their nickname
     * from the contacts table.
     *
     * Returned structure:
     * - title: Report title
     * - info: Description text
     * - value: Total number of leads across all users
     * - items: List of users sorted by highest number of leads
     * - jsComponent: Frontend chart renderer
     * - chartAdditionalProps: Chart configuration
     *
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getProjectsByTopOwnersReport(): array
    {
        ## Total projects in the system
        $totalProjects = DB::table('projects')->count();

        ## Group opportunities in the system by owner and join with contacts to get nickname
        $rows = DB::table('projects')
            ->leftJoin('contacts', 'contacts.id', '=', 'projects.owner_id')
            ->select(
                'projects.owner_id',
                DB::raw('COUNT(projects.id) AS project_count'),
                'contacts.nickname'
            )
            ->groupBy('projects.owner_id', 'contacts.nickname')
            ->orderByDesc('project_count')
            ->get();

        ## Build report rows
        $stats = [];
        $cumulative = 0;
        $index = 1;

        foreach ($rows as $row) {

            $cumulative += $row->project_count;

            ## Use nickname or fallback to owner_id
            $label = $row->nickname
                ? ucwords($row->nickname)
                : 'User: ' . $row->owner_id;

            $stats[] = [
                'index'            => $index++,
                'labelShort'       => $label,
                'labelLong'        => '',
                'info'             => '',
                'count'            => $row->project_count,
                'cumulative_total' => $cumulative,
            ];
        }
        $sortedStats = collect($stats)->sortBy('labelShort')->values()->toArray();

        ## Final response
        return [
            'title'                 => 'Top users by project generation',
            'info'                  => 'Users who own the most projects in the system',
            'value'                 => $totalProjects,
            'items'                 => $sortedStats,
            'jsComponent'           => 'CreateBarVerticalChart',
            'chartAdditionalProps'  => [
                'barSize' => 30,
                'height' => 550,
                'showCartesianGrid' => true
            ],
        ];
    }

    public function getProjectsByCategoryReport(): array
    {
        $result = DB::table('data_categories')->whereType(PROJECT)
            ->leftJoin('categoryables', function ($join) {
                $join->on('data_categories.id', '=', 'categoryables.data_category_id')
                    ->where('categoryables.categoryable_type', '=', Project::class);
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
            'title'                 => 'Projects by category',
            'info'                  => 'A sum of projects by category',
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
     * Get a report of projects grouped by their data source.
     *
     * Each item in the report includes an enhanced structure:
     * - index: Sequential number starting from 1
     * - labelShort: Short label of the source name
     * - labelLong: Full label of the source name
     * - info: Additional info (in this case, source name)
     * - count: Number of projects from this source
     * - cumulative_total: Running total of projects up to this source
     * 
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getProjectsByStagesReport(): array
    {
        $result = DB::table('stages')->whereType(PROJECT)
            ->leftJoin('stageables', function ($join) {
                $join->on('stages.id', '=', 'stageables.stage_id')
                    ->where('stageables.stageable_type', '=', Project::class);
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
            'title'                 => 'Projects by stages',
            'info'                  => 'A sum of projects by stage',
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

    public function getProjectsLinkData($searchText = '')
    {
        try {

            return $this->getModelData(
                columns: ['id', 'name', 'created_at'],
                limit: 10,
                orderBy: 'created_at',
                orderType: 'DESC',
                searchText: $searchText,
                fromAction: PROJECT
            )->map(function ($item) {
                return [
                    'label' => $item->name,
                    'value' => $item->id,
                ];
            });
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }

    public function addProjectsLink(array $inputs)
    {
        try {
            $relatedToId    = $inputs['related_to_id'] ?? null;
            $relatedToType  = $inputs['related_to_type'] ?? null;
            $projectIds     = $inputs['project_ids'] ?? null;

            if (empty($projectIds)) throw new Exception('Project is empty !');

            // dd($inputs);

            $models = $this->model::whereIn('id', $projectIds)->get();

            if ($models->isEmpty()) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            if (empty($relatedToType || $relatedToId)) {
                throw new Exception('Related to type or id is empty !');
            }
            // dd($models);
            if ($relatedToType && $relatedToId) {
                $allTypes = [
                    PROJECT,
                    ORGANIZATION,
                    LEAD,
                    OPPORTUNITY,
                ];

                if (!in_array($relatedToType, $allTypes)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

                $parentModel = $this->getParentModel($relatedToType, $relatedToId);
                if (empty($parentModel)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
                if ($parentModel) {
                    foreach ($models as $model) {
                        $this->doAttachWithParentModel(
                            parentModel: $parentModel,
                            childModel: $model->id,
                            relationalMethod: 'projects',
                            syncType: 'attach'
                        );
                    }
                    $parentModel->touch();
                    return true;
                }
            }
            return false;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }

    public function projectUnlink($inputs)
    {
        try {
            $baseId = $inputs['base_id'] ?? null;
            $projectId = $inputs['project_id'] ?? null;
            $relatedToType = $inputs['related_to_type'] ?? null;

            if (!$relatedToType) throw new Exception('Related to type is empty');
            if (!$baseId) throw new Exception('Base ID is empty');
            if (!$projectId) throw new Exception('Project ID is empty');

            $relatedToTypes = [
                PROJECT,
                ORGANIZATION,
                LEAD,
                OPPORTUNITY,
            ];
            // dd($inputs);

            if (!in_array($relatedToType, $relatedToTypes)) {
                throw new Exception('Related to type not found');
            }

            $baseModelMap = [
                PROJECT      => Project::class,
                LEAD         => Lead::class,
                OPPORTUNITY  => Opportunity::class,
                ORGANIZATION => Organization::class,
            ];

            $baseModel = $baseModelMap[$relatedToType]::find($baseId);

            if (!$baseModel) throw new Exception('Base model not found');

            $result = Projectable::where('project_id', $projectId)
                ->where('projectable_id', $baseId)
                ->first();

            if ($result) {
                $result->delete();
                $baseModel->touch();
                return true;
            }

            return false;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }
}
