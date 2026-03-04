<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Traits\TenantCommonTrait;
use App\Models\Tenant\Opportunity;
use App\Models\Tenant\Projectable;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant\Opportunityable;
use App\Traits\TenantCommonModelTrait;
use App\Models\Tenant\Organizationable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

/**
 *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class TenantOpportunityService extends BaseModelService
{
    use TenantCommonTrait;
    use TenantCommonModelTrait;

    public function __construct(
        Opportunity $model,
        TenantUserService $tenantUserService,
        OrganizationModelService $organizationService,
        TenantIndustryTypeService $dataCategory,
        TenantLeadStageService $dataStage,
        TenantProductService $productService,
        TenantLeadSourceService $dataSource,
        TenantLeadService $leadModelService,
        TenantLeadPriorityService $dataPriorityService,
        TenantRevenueService $revenueTypeModelService,
        CountryService $countyModelService,
        TenantProjectService $tenantProjectService,
        TenantDataDesignationService $dataDesignationService,
        TenantSocialLinkService $dataSocialPlatform
    ) {
        parent::__construct($model);
        $this->tenantUserService = $tenantUserService;
        $this->organizationService = $organizationService;
        $this->dataCategory = $dataCategory;
        $this->dataStage = $dataStage;
        $this->productService = $productService;
        $this->dataSource = $dataSource;
        $this->leadModelService = $leadModelService;
        $this->dataPriorityService = $dataPriorityService;
        $this->revenueTypeModelService = $revenueTypeModelService;
        $this->countyModelService = $countyModelService;
        $this->tenantProjectService = $tenantProjectService;
        $this->dataDesignationService = $dataDesignationService;
        $this->dataSocialPlatform = $dataSocialPlatform;
    }

    /**
     * Return predefined opportunity routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return  [
            'opportunityList'        => 'tenant.opportunity.index',
            'opportunityCreate'      => 'tenant.opportunity.create',
            'opportunityStore'       => 'tenant.opportunity.store',
            'opportunityEdit'        => 'tenant.opportunity.edit',
            'opportunityUpdate'      => 'tenant.opportunity.update',
            'opportunityShow'        => 'tenant.opportunity.show',
            'opportunityDelete'      => 'tenant.opportunity.destroy',
            'opportunityChangeStage' => 'tenant.opportunity.change.stage',
            'opportunityLinkData'       => 'tenant.opportunity.link.data',
            'addOpportunityLink'         => 'tenant.opportunity.add.link',
            'opportunityUnLink'          => 'tenant.opportunity.unlink',
            'opportunityWiseDependency' => 'tenant.opportunity.wise.dependency',
            'opportunityDeleteWithDependency' => 'tenant.opportunity.delete.with.dependency',
            'attachmentsStore'  => 'tenant.attachments.store',
            'attachmentsShow'   => 'tenant.attachments.show',
            'attachmentsDelete' => 'tenant.attachments.destroy',
            'attachmentsDataUpdate' => 'tenant.attachments.data.update',
            'handleSampleData'       => 'tenant.opportunity.handle.sample.data',
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
            'organizationUpdate'     => 'tenant.organization.update',
            'organizationShow'       => 'tenant.organization.show',
            'organizationDelete'     => 'tenant.organization.destroy',
            'organizationsLinkData'  => 'tenant.organization.link.data',
            'addOrganizationsLink'   => 'tenant.organization.add.link',
            'organizationUnLink'     => 'tenant.organization.unlink',
            'projectsUpdate'         => 'tenant.projects.update',
            'projectsShow'           => 'tenant.projects.show',
            'projectsDelete'         => 'tenant.projects.destroy',
            'projectsLinkData'       => 'tenant.projects.link.data',
            'addProjectsLink'        => 'tenant.projects.add.link',
            'projectUnLink'          => 'tenant.projects.unlink',
            'getLabelValueFormattedList'    => 'tenant.opportunity.getLabelValueFormattedList',
            'dataRelatedRoutes'             => [
                'LEAD'                      => 'tenant.leads.getLabelValueFormattedList',
                'PROJECT'                   => 'tenant.leads.getLabelValueFormattedList',
                'OPPORTUNITY'               => 'tenant.opportunity.getLabelValueFormattedList',
                'CONTACT'                   => 'tenant.leads.getLabelValueFormattedList',
            ],
        ];
    }


    /**
     * Resource list
     * 
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function resourceList($requests = []): mixed
    {
        try {
            return $this->getPaginatedModels([...$requests, 'with' => ['organizations', 'stages', 'categories', 'associates', 'tags', 'products', 'tasks', 'notes', 'owner']]);
        } catch (Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource edit related list
     * 
     *  @author Mamun Hossen
     */
    public function opportunityEditRelatedData($model)
    {
        try {
            $modelData = $this->getSingleModel(
                $model,
                [
                    'associates',
                    'categories',
                    'tags',
                    'stages',
                    'products',
                    'tasks',
                    'tasks.stages',
                    'tasks.categories',
                    'tasks.priorities',
                    'notes',
                    'owner',
                    'sources',
                    'aiAnalysis',
                    'attachmentFiles',
                    'opportunityables',
                    'contacts.owner',
                    'organizations.owner',
                    'organizations.contacts',
                    'projects.owner',
                    'projects.stages',
                    'leads.owner.userReference',
                    'leads.designations',
                    'leads.organizations',
                    'leads.stages',
                    'leads.contacts',
                ]
            );
            $dependencyData = $this->getModelDependencies(
                OPPORTUNITY,
                $modelData,
                [
                    USER,
                    ORGANIZATION,
                    DATA_CATEGORY,
                    DATA_REVENUE,
                    CURRENCY,
                    STAGE,
                    PRODUCT,
                    DATA_SOURCE,
                    DATA_PRIORITY,
                    DATA_RELATED_TYPE,
                    SALUTATION,
                    DATA_DESIGNATION,
                    COUNTRY,
                    CITY,
                    SOCIAL_LINK
                ]
            );

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
            $modelData['organizations_report'] = $modelData->organizations->sortByDesc('created_at')->values();
            $modelData['projects_report'] = $modelData->projects->sortByDesc('created_at')->values();
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
        } catch (Throwable $th) {
            throw $th;
        }
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
            'date_forecast' => ['nullable', 'date'],
            'date_close' => ['nullable', 'date'],
            'progress_percent' => ['nullable'],
            'amount' => ['nullable'],
            'currency' => ['nullable'],
            'is_active' => ['required'],
            'data_category_id' => ['nullable'],
            'data_revenue_type_id' => ['nullable'],
            'organization_name' => ['nullable'],
            'data_source_id' => ['nullable'],
            'stage_id' => ['nullable'],
            'finalStepInfos' => ['nullable', 'array'],
            'opportunityable_id' => ['nullable', 'string'],
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
     * Store or update a Opportunity resource with all its associations.
     *
     * This method:
     * - Creates or updates a opportunity with the given input fields
     * - Ensures creator/owner are mapped to their corresponding contact reference
     * - Attaches related entities (associates, socials, organization, designations,
     *   ratings, categories, sources, priorities, tags, employee sizes, preferred contact times, stages)
     *
     * @param  array  $inputs  Input data for lead creation or update
     * 
     * @return \App\Models\Tenant\Opportunity|string  Returns Lead model on success or error message string
     *
     * @throws \Exception When creation or update fails
     * 
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doResourceStore(array $inputs): Opportunity|string
    {
        try {
            ## Filter allowed fields for lead creation
            $modelInputs = collect($inputs)->only([
                'causer_id',
                'owner_id',
                'name',
                'details',
                'date_forecast',
                'date_close',
                'amount',
                'currency',
                'progress_percent',
                'is_active',
                'finalStepInfos'
            ])->toArray();

            // dd($inputs);
            ## Create or update model
            $model = !empty($inputs['id'])
                ? tap($this->model->findOrFail($inputs['id']))->update($modelInputs)
                : $this->model->create($modelInputs);

            if (!$model) {
                throw new Exception(COMMON_ERROR_MSG);
            }


            ## Attach task to parent model
            if (!empty($inputs['opportunityable_id']) && !empty($inputs['related_to_type']) && $inputs['related_to_type'] != LEAD) {
                $childModel = $this->getChildModel($inputs['related_to_type'], $inputs['opportunityable_id']);
                $relationMethods = [
                    PROJECT => 'projects',
                    ORGANIZATION => 'organizations',
                ];
                $relation = $relationMethods[$inputs['related_to_type']] ?? null;
                if (!empty($inputs['opportunityable_id']) && $childModel && $relation) {
                    $this->doAttachWithParentModel(parentModel: $model, childModel: $childModel->id, relationalMethod: $relation, syncType: 'attach');
                    $childModel->touch();
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

            ## Update model last stage duration
            if ($model?->get_last_stage) {
                $pivotCreatedAt = $model->get_last_stage->pivot->created_at;

                $model->stages()
                    ->wherePivot('created_at', $pivotCreatedAt)
                    ->updateExistingPivot($model->get_last_stage->id, [
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
    protected function attachRelations(Opportunity $model, array $inputs, int|string|null $causer_id, int|string|null $owner_id): void
    {
        ## ASSOCIATES (Users → Contacts)
        if (!empty($inputs['associates']) && is_array($inputs['associates'])) {
            $this->doAttachWithParentModel(
                parentModel: $model,
                childModel: $inputs['associates'],
                relationalMethod: 'associates'
            );
        }

        ## ORGANIZATION
        if (!empty($inputs['organization_name'])) {
            $organization = $this->organizationService->doResourceStore([
                'name'       => $inputs['organization_name'],
                'is_active'  => true,
                'causer_id'  => $causer_id,
                'owner_id'   => $owner_id,
            ]);

            if ($organization?->id) {
                $this->doAttachWithParentModel(
                    parentModel: $model,
                    childModel: $organization->id,
                    relationalMethod: 'organizations'
                );
            }
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


        ## OPPORTUNITYABLE RELATION (Lead/Contact as Parent)
        $opportunityable_id = "";
        $opportunityable_type = "";
        $stageId = '';

        if (!empty($inputs['finalStepInfos'])) {
            $finalStepInfos = $inputs['finalStepInfos'];
            $opportunityable_id   = $finalStepInfos['stageable_id'] ?? null;
            $opportunityable_type = $finalStepInfos['type'] ?? null;
            $stageId = $finalStepInfos['stage_id'] ?? null;
        } else {
            if ($inputs['opportunityable_id']) {
                $opportunityable_id = $inputs['opportunityable_id'] ?? null;
                $opportunityable_type = $inputs['related_to_type'] ?? null;
            }
        }


        if ($opportunityable_id && $opportunityable_type == LEAD) {
            $parentModel = $this->leadModelService->getSingleModel($opportunityable_id);
            if ($parentModel) {
                $this->doAttachWithParentModel(
                    parentModel: $parentModel,
                    childModel: $model->id,
                    relationalMethod: 'opportunities',
                    syncType: 'attach'
                );
            }
            if ($stageId) {
                $this->doAttachWithParentModel(
                    parentModel: $parentModel,
                    childModel: $stageId,
                    relationalMethod: 'stages',
                    additionalInputs: ['causer_id' => $causer_id],
                    syncType: 'attach'
                );
            }
            $parentModel->touch();
        }

        ## DIRECT FIELD RELATIONS
        $directRelations = [
            'data_source_id'       => 'sources',
            'data_category_id'     => 'categories',
            'data_revenue_type_id' => 'revenue_types',
            'opportunity_id'       => 'revenue_types',
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
                ['label' => 'Opportunity name', 'value' => $model->name],
                ['label' => 'Opportunity created on', 'value' => _dateFormat($model->created_at, 'd M, Y')],
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
            $model = $this->getSingleModel(modelOrId: $model, with: [
                'associates',
                'organizations',
                'stages',
                'sources',
                'categories',
                'revenue_types',
            ]);

            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            ## Base fields
            $data = $model->only([
                'causer_id',
                'owner_id',
                'name',
                'details',
                'date_forecast',
                'date_close',
                'amount',
                'currency',
                'progress_percent',
                'is_active',
                'finalStepInfos'
            ]);

            ## Conditional assignments
            $data['associates'] = $model->associates ? $model->associates->pluck('id')->toArray() : [];
            $data['organization_name'] = $model->get_organization ? $model->get_organization->name : "";
            $data['data_source_id'] = $model->sources ? $model->sources->pluck('id')->toArray() : [];
            $data['data_revenue_type_id'] = $model->revenue_types ? $model->revenue_types->pluck('id')->toArray() : [];
            $data['data_category_id'] = $model->get_category_name['id'] ?? '';
            $data['stage_id'] = $model->get_last_stage->id ?? '';

            return $data;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine());
        }
    }

    /**
     * Retrieve dependency information for a given resource before deletion.
     * * @author Mamun Hossen
     */
    public function resourceDeleteDependencyData(array $inputs): array
    {
        try {
            return $this->getDeleteDependencyData(OPPORTUNITY, $inputs);
        } catch (Throwable $th) {
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
            return $this->deleteDependency(OPPORTUNITY, $dependency);
        } catch (Throwable $th) {
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
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), ' Line: ' . $th->getLine());
        }
    }


    /**
     * Generate tasks graph report based on the specified type
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getOpportunitiesChartReport(string $type): array
    {
        return match ($type) {
            OPPORTUNITIES_BY_MONTH         => $this->getOpportunitiesByMonthReport(),
            OPPORTUNITIES_BY_SOURCE        => $this->getOpportunitiesBySourceReport(),
            OPPORTUNITIES_BY_STAGES        => $this->getOpportunitiesByStagesReport(),
            OPPORTUNITIES_BY_TOP_OWNERS    => $this->getOpportunitiesTopOwnersReport(),

            default => throw new Exception("Invalid opportunities report type: $type"),
        };
    }

    /**
     * Generate a report of new opportunities created over the last 12 months,
     * including the current month. Automatically spans across years.
     *
     * Returns a list of the last 12 months with lead counts (0 if none),
     * formatted like: "Dec 24", "Jan 25", etc.
     *
     * @return array
     *
     * @example
     * [
     *   { "index": 1, "month": "Dec 24", "year": 2024, "total_opportunities": 3 },
     *   { "index": 2, "month": "Jan 25", "year": 2025, "total_opportunities": 10 },
     *   ...
     * ]
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getOpportunitiesByMonthReport(): array
    {
        ## Determine date range: last 12 months including current month
        $endDate = now()->startOfMonth();
        $startDate = $endDate->copy()->subMonths(11);

        ## Fetch lead counts grouped by year and month
        $monthlyOpportunities = DB::table('opportunities')
            ->selectRaw('
            YEAR(created_at) as year,
            MONTH(created_at) as month_number,
            COUNT(*) as total_opportunities
        ')
            ->whereBetween('created_at', [$startDate, $endDate->copy()->endOfMonth()])
            ->groupBy('year', 'month_number')
            ->orderBy('year')
            ->orderBy('month_number')
            ->get();

        ## Build report for each of the last 12 months
        $runningTotal = 0;

        $report = collect(range(0, 11))->map(function ($i) use ($startDate, $monthlyOpportunities, &$runningTotal) {
            $date = $startDate->copy()->addMonths($i);
            $year = $date->year;
            $monthNumber = $date->month;

            ## Find monthly lead count
            $found = $monthlyOpportunities->first(function ($item) use ($year, $monthNumber) {
                return $item->year == $year && $item->month_number == $monthNumber;
            });

            $totalOpportunities = $found->total_opportunities ?? 0;

            ## Update cumulative total
            $runningTotal += $totalOpportunities;

            return [
                'index'             => $i + 1,
                'labelShort'        => $date->format('M y'),
                'labelLong'         => $date->format('M Y'),
                'info'              => $year,
                'count'             => $totalOpportunities,
                'cumulative_total'  => $runningTotal,
            ];
        })->values()->toArray();

        return [
            'title' => 'Opportunities by month',
            'info'  => 'A sum of opportunities by month',
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
     * Get a report of opportunities grouped by their data source.
     *
     * Each item in the report includes an enhanced structure:
     * - index: Sequential number starting from 1
     * - labelShort: Short label of the source name
     * - labelLong: Full label of the source name
     * - info: Additional info (in this case, source name)
     * - count: Number of opportunities from this source
     * - cumulative_total: Running total of opportunities up to this source
     *
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getOpportunitiesBySourceReport(): array
    {
        $result = DB::table('data_sources')
            ->leftJoin('sourceables', function ($join) {
                $join->on('data_sources.id', '=', 'sourceables.data_source_id')
                    ->where('sourceables.sourceable_type', '=', Opportunity::class);
            })
            ->select(
                'data_sources.name as label',
                DB::raw('COUNT(sourceables.sourceable_id) as count')
            )
            ->groupBy('data_sources.id', 'data_sources.name')
            ->orderBy('data_sources.name')
            ->get();

        $runningTotal = 0;
        $items = [];

        foreach ($result as $i => $item) {
            $runningTotal += $item->count;

            $items[] = [
                'index'            => $i + 1,
                'labelShort'       => $item->label,
                'labelLong'        => $item->label,
                'info'             => $item->label,
                'count'            => (int) $item->count,
                'cumulative_total' => $runningTotal,
            ];
        }

        return [
            'title'                 => 'Opportunities by source',
            'info'                  => 'A sum of opportunities by source',
            'value'                 => $runningTotal,
            'items'                 => $items,
            'jsComponent'           => 'CreatePieChart',
            'chartAdditionalProps'  => [
                'height' => '350px',
                'width' => '100%',
                'innerRadius' => 30,
            ],
        ];
    }

    /**
     * Get a report of opportunities grouped by their data source.
     *
     * Each item in the report includes an enhanced structure:
     * - index: Sequential number starting from 1
     * - labelShort: Short label of the source name
     * - labelLong: Full label of the source name
     * - info: Additional info (in this case, source name)
     * - count: Number of opportunities from this source
     * - cumulative_total: Running total of opportunities up to this source
     * 
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getOpportunitiesByStagesReport(): array
    {
        $result = DB::table('stages')->whereType(OPPORTUNITY)
            ->leftJoin('stageables', function ($join) {
                $join->on('stages.id', '=', 'stageables.stage_id')
                    ->where('stageables.stageable_type', '=', Opportunity::class);
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
            'title'                 => 'Opportunities by stages',
            'info'                  => 'A sum of opportunities by stage',
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
     * Get a report of top users who generated the most opportunity.
     *
     * This report summarizes which users (owner_id) contributed the highest
     * number of lead records in the system, including their nickname
     * from the contacts table.
     *
     * Returned structure:
     * - title: Report title
     * - info: Description text
     * - value: Total number of opportunity across all users
     * - items: List of users sorted by highest number of opportunity
     * - jsComponent: Frontend chart renderer
     * - chartAdditionalProps: Chart configuration
     *
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getOpportunitiesTopOwnersReport(): array
    {
        ## Total opportunities in the system
        $totalOpportunities = DB::table('opportunities')->count();

        ## Group opportunities in the system by owner and join with contacts to get nickname
        $rows = DB::table('opportunities')
            ->leftJoin('contacts', 'contacts.id', '=', 'opportunities.owner_id')
            ->select(
                'opportunities.owner_id',
                DB::raw('COUNT(opportunities.id) AS opportunity_count'),
                'contacts.nickname'
            )
            ->groupBy('opportunities.owner_id', 'contacts.nickname')
            ->orderByDesc('opportunity_count')
            ->get();

        ## Build report rows
        $stats = [];
        $cumulative = 0;
        $index = 1;

        foreach ($rows as $row) {

            $cumulative += $row->opportunity_count;

            ## Use nickname or fallback to owner_id
            $label = $row->nickname
                ? ucwords($row->nickname)
                : 'User: ' . $row->owner_id;

            $stats[] = [
                'index'            => $index++,
                'labelShort'       => $label,
                'labelLong'        => '',
                'info'             => '',
                'count'            => $row->opportunity_count,
                'cumulative_total' => $cumulative,
            ];
        }
        $sortedStats = collect($stats)->sortBy('labelShort')->values()->toArray();

        ## Final response
        return [
            'title'                 => 'Top users by opportunity generation',
            'info'                  => 'Users who own the most opportunities in the system',
            'value'                 => $totalOpportunities,
            'items'                 => $sortedStats,
            'jsComponent'           => 'CreateBarVerticalChart',
            'chartAdditionalProps'  => [
                'barSize' => 30,
                'height' => 550,
                'showCartesianGrid' => true
            ],
        ];
    }

    public function getOpportunityLinkData($searchText = '')
    {
        try {

            return $this->getModelData(
                columns: ['id', 'name', 'created_at'],
                limit: 10,
                orderBy: 'created_at',
                orderType: 'DESC',
                searchText: $searchText,
                fromAction: OPPORTUNITY
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

    public function addOpportunityLink(array $inputs)
    {
        try {
            $relatedToId    = $inputs['related_to_id'] ?? null;
            $relatedToType  = $inputs['related_to_type'] ?? null;
            $opportunityIds = $inputs['opportunity_ids'] ?? null;

            if (empty($opportunityIds)) throw new Exception('Opportunity is empty !');

            $models = $this->model::whereIn('id', $opportunityIds)->get();

            if ($models->isEmpty()) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            if (empty($relatedToType || $relatedToId)) {
                throw new Exception('Related to type or id is empty !');
            }
            // dd($inputs);
            if ($relatedToType && $relatedToId) {
                $relationMethods = [
                    PROJECT => 'projects',
                    ORGANIZATION => 'organizations',
                    LEAD => 'opportunities',
                ];
                $relation = $relationMethods[$relatedToType] ?? null;

                if (!$relation) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

                if ($relation) {
                    if ($relatedToType == LEAD) {
                        $parentModel = $this->getParentModel($relatedToType, $relatedToId);
                        if (empty($parentModel)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
                        if ($parentModel) {
                            foreach ($models as $model) {
                                $this->doAttachWithParentModel(
                                    parentModel: $parentModel,
                                    childModel: $model->id,
                                    relationalMethod: $relation,
                                    syncType: 'attach'
                                );
                            }
                            $parentModel->touch();
                            return true;
                        }
                    } else {
                        $childModel = $this->getChildModel($relatedToType, $relatedToId);
                        if (empty($childModel)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
                        if ($childModel) {
                            foreach ($models as $model) {
                                $this->doAttachWithParentModel(
                                    parentModel: $model,
                                    childModel: $childModel->id,
                                    relationalMethod: $relation,
                                    syncType: 'attach'
                                );
                            }
                            $childModel->touch();
                            return true;
                        }
                    }
                }
            }
            return false;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }

    public function opportunityUnlink($inputs)
    {
        try {
            $baseId = $inputs['base_id'] ?? null;
            $opportunityId = $inputs['opportunity_id'] ?? null;
            $relatedToType = $inputs['related_to_type'] ?? null;

            // dd($inputs);

            if (!$relatedToType) throw new Exception('Related to type is empty');
            if (!$baseId) throw new Exception('Base ID is empty');
            if (!$opportunityId) throw new Exception('Opportunity ID is empty');

            $relatedToTypes = [
                PROJECT,
                ORGANIZATION,
                LEAD,
            ];
            // dd($inputs);

            if (!in_array($relatedToType, $relatedToTypes)) {
                throw new Exception('Related to type not found');
            }

            ## Map relationship types to their pivot models and column names
            $pivotConfig = [
                PROJECT => [
                    'model' => Projectable::class,
                    'base_column' => 'project_id',
                    'parent_column' => 'projectable_id',
                ],
                ORGANIZATION => [
                    'model' => Organizationable::class,
                    'base_column' => 'organization_id',
                    'parent_column' => 'organizationable_id',
                ],
                LEAD => [
                    'model' => Opportunityable::class,
                    'base_column' => 'opportunity_id',
                    'parent_column' => 'opportunityable_id',
                ],
            ];

            $config = $pivotConfig[$relatedToType] ?? null;

            if (!$config) throw new Exception('Pivot configuration not found');
            if ($relatedToType == LEAD) {
                $result = $config['model']::where($config['base_column'], $opportunityId)
                    ->where($config['parent_column'], $baseId)
                    ->first();
            } else {
                $result = $config['model']::where($config['base_column'], $baseId)
                    ->where($config['parent_column'], $opportunityId)
                    ->first();
            }
            if ($result) {
                $result->delete();
                return true;
            }

            return false;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }
}
