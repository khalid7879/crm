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
use App\Models\Tenant\Opportunityable;
use App\Traits\TenantCommonModelTrait;
use App\Models\Tenant\Organizationable;
use Illuminate\Support\Facades\Validator;

/**
 * TenantLeadService - Lead resource management for tenants
 * Handles CRUD operations, stage changes, and formatted label-value lists
 * 
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class TenantLeadService extends BaseModelService
{
    use TenantCommonTrait;
    use TenantCommonModelTrait;
    public function __construct(Lead $model, private TenantLeadStageService $dataStage, private TenantIndustryTypeService $dataCategory, private TenantLeadSourceService $dataSource, private TenantLeadRatingService $dataRating, private TenantUserService $tenantUserService, private TenantDataDesignationService $dataDesignationService, private TenantSocialLinkService $dataSocialPlatform, private OrganizationModelService $organizationService, private TenantLeadPriorityService $dataPriority, private TagModelService $tagService, private TenantEmpSizeService $empSizeService, private TenantContactTimeService $contactTimeService, private TenantRevenueService $revenueTypeModelService, private CountryService $countyModelService)
    {
        parent::__construct($model);
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
            'owner_id' => ['required'],
            'creator_id' => ['required'],
            'alt_mobile_phone' =>  [
                'nullable',
                'regex:/^[0-9]{5,20}$/',
            ],
            'associates' => ['nullable'],
            'data_category_id' => ['nullable', 'string'],
            'data_designation_id' => ['nullable', 'string'],
            'data_priority_id' => ['nullable', 'string'],
            'data_rating_id' => ['nullable', 'string'],
            'data_source_id' => ['nullable', 'string'],
            'details' => ['nullable'],
            'email' => [
                'nullable',
                'string',
                'email',
                'min:5',
                'max:100',
            ],
            'employees_count' => ['nullable', 'string'],
            'fax' => ['nullable', 'string', 'max:100'],
            'first_name' => ['nullable', 'string', 'max:50'],
            'is_active' => ['required'],
            'last_name' => ['nullable', 'string', 'max:50'],
            'mobile_phone' => [
                'nullable',
                'regex:/^[0-9]{5,20}$/',
            ],
            'nickname' => [
                'required',
                'string',
                'min:1',
                'max:50',
            ],
            'organization' => ['nullable', 'string', 'max:500'],
            'preferred_contact_method' => ['required'],
            'preferred_contact_time' => ['nullable', 'string'],
            'salutation' => ['required'],
            'social_links' => ['nullable'],
            'stage_id' => ['required'],
            'tags' => ['nullable'],
            'telephone' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'url'],

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
            'nickname.required' => __('Field can not be empty'),
            'nickname.min' => __('Minimum character length', ['min' => 1]),
            'nickname.max' => __('Maximum character length', ['max' => 50]),
            'first_name.max' => __('Maximum character length', ['max' => 50]),
            'last_name.max' => __('Maximum character length', ['max' => 50]),
            'organization.max' => __('Maximum character length', ['max' => 500]),
            'email.min' => __('Minimum character length', ['min' => 5]),
            'email.max' => __('Maximum character length', ['max' => 100]),
            'email.email' => __('Must be a valid email'),
            'telephone.max' => __('Maximum character length', ['max' => 100]),
            'mobile_phone.regex' => __('Mobile number must be between 5 and 20 digits and contain numbers only'),
            'alt_mobile_phone.regex' => __('Alternate mobile number must be between 5 and 20 digits and contain numbers only'),
            'fax.max' => __('Maximum character length', ['max' => 100]),
            'website.url' => __('Must be a valid url'),
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
     * @author 
     * Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doResourceStore(array $inputs): Lead|string
    {
        try {
            ## Filter allowed fields for lead creation
            $modelInputs = collect($inputs)->only([
                'creator_id',
                'owner_id',
                'salutation',
                'first_name',
                'last_name',
                'nickname',
                'email',
                'telephone',
                'mobile_phone',
                'alt_mobile_phone',
                'fax',
                'website',
                'employees_count',
                'details',
                'is_active',
                'preferred_contact_method'
            ])->toArray();

            ## Create or update lead
            $model = !empty($inputs['id'])
                ? tap($this->model->findOrFail($inputs['id']))->update($modelInputs)
                : $this->model->create($modelInputs);

            if (!$model) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            ## Attach related models
            $this->attachRelations($model, $inputs, $modelInputs['creator_id']);

            return $model;
        } catch (Throwable $th) {
            if ($th->getCode() === '23000') {
                throw new Exception(MISSING_FIELD);
            }

            throw new Exception($th->getMessage());
        }
    }

    /**
     * Handle attaching all related models for a lead.
     *
     * @param  \App\Models\Tenant\Lead  $model
     * @param  array  $inputs
     * @param  int|string|null  $creatorId
     * @return void
     */
    protected function attachRelations(Lead $model, array $inputs, int|string|null $creatorId): void
    {
        ## Associates (users → contacts)
        if (!empty($inputs['associates']) && is_array($inputs['associates'])) {
            $associates = $inputs['associates'];
            $this->doAttachWithParentModel($model, $associates, 'associates');
        }

        ## Social links
        if (!empty($inputs['social_links']) && is_array($inputs['social_links'])) {
            $this->doAttachWithParentModel($model, $inputs['social_links'], 'socials');
        }

        ## Organization
        if (!empty($inputs['organization'])) {
            $organization = $this->organizationService->doResourceStore([
                'name'       => $inputs['organization'],
                'is_active'  => true,
                'causer_id' => $creatorId,
                'owner_id'   => $creatorId,
            ]);
            $this->doAttachWithParentModel($model, $this->organizationService->getSingleModel($organization?->id), 'organizations');
        }

        ## Direct field relations
        $relations = [
            'data_designation_id'   => 'designations',
            'data_rating_id'        => 'ratings',
            'data_category_id'      => 'categories',
            'data_source_id'        => 'sources',
            'data_priority_id'      => 'priorities',
            'employees_count'       => 'employeeSizes',
            'preferred_contact_time' => 'preferableTimes',
        ];

        foreach ($relations as $field => $relation) {
            if (!empty($inputs[$field])) {
                $childModel = $inputs[$field];

                ## Special handling for rating (fetch model)
                if ($field === 'data_rating_id') {
                    $childModel = $this->dataRating->getSingleModel($inputs[$field]);
                }

                $this->doAttachWithParentModel($model, $childModel, $relation);
            }
        }

        ## Tags
        if (!empty($inputs['tags']) && is_array($inputs['tags'])) {
            $tags = $this->tagService->doResourceStoreAll($inputs['tags']);
            $this->doAttachWithParentModel($model, $tags, 'tags');
        }

        ## Stage
        if (!empty($inputs['stage_id'])) {
            $this->doAttachWithParentModel(
                parentModel: $model,
                childModel: $inputs['stage_id'],
                relationalMethod: 'stages',
                additionalInputs: ['causer_id' => $creatorId],
                syncType: 'attach'
            );
        }
    }


    /**
     * Resource list
     * 
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function resourceList($requests = []): mixed
    {
        try {
            return $this->getPaginatedModels([...$requests, 'with' =>
            [
                'designations',
                'organizations',
                'owner.userReference',
                'stages',
                'preferableTimes',
                'socials',
                'address',
                'sources',
                'tasks',
                'products',
                'ratings',
                'priorities',
                'categories',
                'tags',
                'employeeSizes',
                'associates'
            ]]);
        } catch (Throwable $th) {
            throw new Exception($th->getMessage() . 'Line: ' . $th->getLine());
        }
    }


    /**
     * Get resource dependencies
     * 
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getModelDependencies($model = null): array
    {
        $data = [];

        $data['dataStages'] = $this->dataStage->getStagesByType(['type' => 'lead', 'default' => $model?->get_last_stage?->id, 'exclude' => 'Converted']);
        $data['dataStagesForTask'] = $this->dataStage->getStagesByType(['type' => 'task']);
        $data['dataStagesForOpportunities'] = $this->dataStage->getStagesByType(['type' => 'OPPORTUNITY']);
        $data['dataStagesForProject'] = $this->dataStage->getStagesByType(['type' => 'PROJECT']);


        $data['dataSalutations'] = [
            'list' => _salutations(),
            'default' => $model?->salutation ?? '4'
        ];

        $data['dataGenders'] = [
            'list' => _genders(),
            'default' => ''
        ];

        $data['dataContactMethods'] = [
            'list' => _preferredContactMethod(),
            'default' => '1'
        ];

        ## Fetch all categories in one query
        $categories = $this->dataCategory->getPaginatedModels([
            'orderBy'    => 'name',
            'orderType'  => 'asc',
            'isPaginate' => false,
            'isActive'   => true,
            'wheres'     => ['type' => [INDUSTRY, 'TASK', 'PRODUCT', 'OPPORTUNITY', 'PROJECT']],
        ])->groupBy('type');

        ## Now structure them
        $data['dataCategories'] = [
            'list'    => $categories->get(INDUSTRY)?->pluck('name', 'id')->toArray() ?? [],
            'default' => '',
        ];

        $data['dataCategoriesForTasks'] = [
            'list'    => $categories->get('TASK')?->pluck('name', 'id')->toArray() ?? [],
            'default' => '',
        ];

        $data['dataCategoriesForProducts'] = [
            'list'    => $categories->get('PRODUCT')?->pluck('name', 'id')->toArray() ?? [],
            'default' => '',
        ];

        $data['dataCategoriesForOpportunities'] = [
            'list'    => $categories->get('OPPORTUNITY')?->pluck('name', 'id')->toArray() ?? [],
            'default' => '',
        ];

        $data['dataCategoriesForProject'] = [
            'list'    => $categories->get('PROJECT')?->pluck('name', 'id')->toArray() ?? [],
            'default' => '',
        ];

        $dataSourceList = $this->dataSource->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false, 'isActive' => true])->pluck('name', 'id')->toArray();

        $data['dataSources'] = [
            'list' => $dataSourceList,
            'default' => collect(array_filter($dataSourceList, function ($value) {
                return strtolower($value) === 'web';
            }))->keys()->first()
        ];

        $data['dataRatings'] = $this->dataRating->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false, 'isActive' => true])->pluck('name', 'id')->toArray();

        $data['dataDesignations'] = $this->dataDesignationService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false, 'isActive' => true,])->pluck('name', 'id')->toArray();


        $data['dataSocial'] = $this->dataSocialPlatform->formatByKeys($model);

        $data['organizations'] = $this->organizationService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])->pluck('name', 'id')->toArray();

        $dataPriorities = $this->dataPriority->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])->pluck('name', 'id')->toArray();
        $data['dataPriorities'] = [
            'list' => $dataPriorities,
            'default' => collect(array_filter($dataPriorities, function ($value) {
                return strtolower($value) === 'low';
            }))->keys()->first() ?? ""
        ];

        $usersContactReferenceList = $this->tenantUserService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false, 'wheres' => ['is_active' => true], 'with' => ['contactReference']])->toArray();

        ## old code
        // $formattedList = collect($usersContactReferenceList)->mapWithKeys(function ($item) {
        //     return [
        //         $item['get_contact_reference']['id'] ?? null => $item['name'] ?? null,
        //     ];
        // })->filter(fn($value, $key) => $key !== null)->toArray();

        ## New formatting to handle multiple contact references
        $formattedList = collect($usersContactReferenceList)
            ->flatMap(function ($item) {
                return collect($item['contact_reference'] ?? [])
                    ->mapWithKeys(fn($contact) => [
                        $contact['id'] => $item['name'] ?? null
                    ]);
            })
            ->toArray();

        $causerRecContact = $this->tenantUserService->getSingleModel(
            modelOrId: _getAuthInformation('id'),
            with: ['contactReference']
        );

        $data['tenantUsers']  = [
            'list' => $formattedList,
            'authUser' =>  $causerRecContact?->get_contact_reference['id'] ?? null
        ];

        $data['dataEmpSizes'] = [
            'list' => $this->empSizeService->getPaginatedModels(['orderBy' => 'size', 'orderType' => 'asc', 'isPaginate' => false])->pluck('name', 'id')->toArray(),
            'default' => ''
        ];

        $data['dataContactTimes'] = [
            'list' => $this->contactTimeService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])->pluck('name', 'id')->toArray(),
            'default' => ''
        ];

        $data['dataRelatedTypes'] = [
            'list' => [
                'LEAD' => 'Lead',
                'PROJECT' => 'Project',
                'OPPORTUNITY' => 'Opportunity',
                'CONTACT' => 'Contact',
            ],
            'default' => LEAD
        ];

        $data['dataRevenueTypes'] = [
            'list' => $this->revenueTypeModelService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])->pluck('name', 'id')->toArray(),
            'default' => ''
        ];

        $data['dataCurrencies'] = [
            'list' => $this->countyModelService->getCurrencyByKeyValue(),
            'default' => ''
        ];


        $data['dataCountries'] = [
            'list' => $this->countyModelService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])
                ->pluck('name', 'id')
                ->toArray(),
            'default' => ''
        ];


        $data['dataCities'] = [
            'list' => [],
            'default' => ''
        ];


        return $data;
    }


    /**
     * Updating old stage and creating new on
     * 
     * @param array $inputs
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doResourceChangeStage(array $inputs = []): mixed
    {
        try {
            if (!count($inputs)) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            $model = $this->model->with(['stages'])->find($inputs['stageable_id']);
            $causerId = $this->usersContactReference(_getAuthInformation('id'));

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
            $this->doAttachWithParentModel(parentModel: $model, childModel: $inputs['stage_id'], relationalMethod: 'stages', additionalInputs: ['causer_id' => $causerId], syncType: 'attach', updateExisting: false);

            return true;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage());
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
                DB::raw("CONCAT(nickname, ' (', first_name, ' ', last_name, ')') as label")
            )
            ->when($searchText, function ($query, $searchText) {
                $query->where(function ($q) use ($searchText) {
                    $q->where('first_name', 'like', "%{$searchText}%")
                        ->orWhere('last_name', 'like', "%{$searchText}%")
                        ->orWhere('nickname', 'like', "%{$searchText}%");
                });
            })
            ->get()
            ->each->setAppends([]);
    }

    /**
     * Retrieve dependency information for a given resource before deletion.
     * * @author Mamun Hossen
     */
    public function resourceDeleteDependencyData(array $inputs): array
    {
        try {
            return $this->getDeleteDependencyData(LEAD, $inputs);
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
            return $this->deleteDependency(LEAD, $dependency);
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), ' Line: ' . $th->getLine());
        }
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
     * Generate leads graph report based on the specified type
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getLeadsChartReport(string $type): array
    {
        return match ($type) {
            'LEADS_BY_MONTH'           => $this->getLeadsByMonthReport(),
            'LEADS_BY_SOURCE'          => $this->getLeadsBySourceReport(),
            'LEADS_BY_STAGES'          => $this->getLeadsByStagesReport(),
            'LEADS_BY_CONVERSION_RATE' => $this->getLeadsByConversionRateReport(),
            'LEADS_BY_TOP_OWNERS'      => $this->getLeadsByTopOwnersReport(),
            // 'LEADS_BY_STATUS'          => $this->getLeadsByStatusReport(),
            // 'LEADS_BY_AGING'           => $this->getLeadsByAgingReport(),
            // 'LEADS_BY_TREND'           => $this->getLeadsByTrendReport(),

            default => throw new Exception("Invalid lead report type: $type"),
        };
    }


    /**
     * Generate a report of new leads created over the last 12 months,
     * including the current month. Automatically spans across years.
     *
     * Returns a list of the last 12 months with lead counts (0 if none),
     * formatted like: "Dec 24", "Jan 25", etc.
     *
     * @return array
     *
     * @example
     * [
     *   { "index": 1, "month": "Dec 24", "year": 2024, "total_leads": 3 },
     *   { "index": 2, "month": "Jan 25", "year": 2025, "total_leads": 10 },
     *   ...
     * ]
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getLeadsByMonthReport(): array
    {
        ## Determine date range: last 12 months including current month
        $endDate = now()->startOfMonth();
        $startDate = $endDate->copy()->subMonths(11);

        ## Fetch lead counts grouped by year and month
        $monthlyLeads = DB::table('leads')
            ->selectRaw('
            YEAR(created_at) as year,
            MONTH(created_at) as month_number,
            COUNT(*) as total_leads
        ')
            ->whereBetween('created_at', [$startDate, $endDate->copy()->endOfMonth()])
            ->groupBy('year', 'month_number')
            ->orderBy('year')
            ->orderBy('month_number')
            ->get();

        ## Build report for each of the last 12 months
        $runningTotal = 0;

        $report = collect(range(0, 11))->map(function ($i) use ($startDate, $monthlyLeads, &$runningTotal) {
            $date = $startDate->copy()->addMonths($i);
            $year = $date->year;
            $monthNumber = $date->month;

            ## Find monthly lead count
            $found = $monthlyLeads->first(function ($item) use ($year, $monthNumber) {
                return $item->year == $year && $item->month_number == $monthNumber;
            });

            $totalLeads = $found->total_leads ?? 0;

            ## Update cumulative total
            $runningTotal += $totalLeads;

            return [
                'index'             => $i + 1,
                'labelShort'        => $date->format('M y'),
                'labelLong'         => $date->format('M Y'),
                'info'              => $year,
                'count'             => $totalLeads,
                'cumulative_total'  => $runningTotal,
            ];
        })->values()->toArray();

        return [
            'title' => 'Leads by month',
            'info'  => 'A sum of leads by month',
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
     * Get a report of leads grouped by their data source.
     *
     * Each item in the report includes an enhanced structure:
     * - index: Sequential number starting from 1
     * - labelShort: Short label of the source name
     * - labelLong: Full label of the source name
     * - info: Additional info (in this case, source name)
     * - count: Number of leads from this source
     * - cumulative_total: Running total of leads up to this source
     *
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getLeadsBySourceReport(): array
    {
        $result = DB::table('data_sources')
            ->leftJoin('sourceables', function ($join) {
                $join->on('data_sources.id', '=', 'sourceables.data_source_id')
                    ->where('sourceables.sourceable_type', '=', Lead::class);
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
            'title'                 => 'Leads by source',
            'info'                  => 'A sum of leads by source',
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
     * Get a report of leads grouped by their data source.
     *
     * Each item in the report includes an enhanced structure:
     * - index: Sequential number starting from 1
     * - labelShort: Short label of the source name
     * - labelLong: Full label of the source name
     * - info: Additional info (in this case, source name)
     * - count: Number of leads from this source
     * - cumulative_total: Running total of leads up to this source
     * 
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getLeadsByStagesReport(): array
    {
        $result = DB::table('stages')->whereType('LEAD')
            ->leftJoin('stageables', function ($join) {
                $join->on('stages.id', '=', 'stageables.stage_id')
                    ->where('stageables.stageable_type', '=', Lead::class);
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
            'title'                 => 'Leads by stages',
            'info'                  => 'A sum of leads by stage',
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
     * Get a report of lead conversion statistics.
     *
     * This report summarizes how many leads were converted into opportunities.
     *
     * Returned structure:
     * - title: Report title
     * - info: Description text
     * - value: Conversion rate (%)
     * - items: List of statistical rows (2D array)
     *      Each row includes:
     *          - index: Sequential number
     *          - labelShort: Short label for UI
     *          - labelLong: Optional long description
     *          - info: Additional info text
     *          - count: Count for this row
     *          - cumulative_total: Running total
     * - jsComponent: Used for frontend chart rendering
     * - chartAdditionalProps: Additional chart config
     *
     * @return array
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getLeadsByConversionRateReport(): array
    {
        ## Total leads
        $totalLeads = DB::table('leads')->count();

        ## Leads that have at least one opportunity
        $convertedLeads = DB::table('opportunityables')
            ->where(function ($q) {
                $q->where('opportunityable_type', 'Lead')
                    ->orWhere('opportunityable_type', 'App\\Models\\Tenant\\Lead')
                    ->orWhere('opportunityable_type', 'like', '%Lead%');
            })
            ->distinct('opportunityable_id')
            ->count('opportunityable_id');

        ## Total number of opportunities linked to converted leads
        $totalConvertedOpportunities = DB::table('opportunityables')
            ->where(function ($q) {
                $q->where('opportunityable_type', 'Lead')
                    ->orWhere('opportunityable_type', 'App\\Models\\Tenant\\Lead')
                    ->orWhere('opportunityable_type', 'like', '%Lead%');
            })
            ->count();

        ## Conversion rate (%)
        $conversionRate = $totalLeads > 0
            ? ($convertedLeads / $totalLeads) * 100
            : 0;

        ## Stats rows
        $stats = [
            [
                'index'            => 1,
                'labelShort'       => 'Total leads',
                'labelLong'        => '',
                'info'             => '',
                'count'            => $totalLeads,
                'cumulative_total' => $totalLeads,
            ],
            [
                'index'            => 2,
                'labelShort'       => 'Converted leads',
                'labelLong'        => '',
                'info'             => '',
                'count'            => $convertedLeads,
                'cumulative_total' => $convertedLeads,
            ],
            [
                'index'            => 3,
                'labelShort'       => 'Converted opportunities',
                'labelLong'        => '',
                'info'             => '',
                'count'            => $totalConvertedOpportunities,
                'cumulative_total' => $totalConvertedOpportunities,
            ],
        ];

        ## Final report
        return [
            'title'                 => 'Leads conversion ratio',
            'info'                  => 'Shows how many leads converted into opportunities',
            'value'                 => round($conversionRate, 2),
            'items'                 => $stats,
            'jsComponent'           => 'CreateNeedlePieChart',
            'chartAdditionalProps'  => [
                'height' => '150px',
                'width'  => '100%',
                'conversionRate' => round($conversionRate),
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
    public function getLeadsByTopOwnersReport(): array
    {
        ## Total leads
        $totalLeads = DB::table('leads')->count();

        ## Group leads by owner and join with contacts to get nickname
        $rows = DB::table('leads')
            ->leftJoin('contacts', 'contacts.id', '=', 'leads.owner_id')
            ->select(
                'leads.owner_id',
                DB::raw('COUNT(leads.id) AS lead_count'),
                'contacts.nickname'
            )
            ->groupBy('leads.owner_id', 'contacts.nickname')
            ->orderByDesc('lead_count')
            ->get();

        ## Build report rows
        $stats = [];
        $cumulative = 0;
        $index = 1;

        foreach ($rows as $row) {

            $cumulative += $row->lead_count;

            ## Use nickname or fallback to owner_id
            $label = $row->nickname
                ? ucwords($row->nickname)
                : 'User: ' . $row->owner_id;

            $stats[] = [
                'index'            => $index++,
                'labelShort'       => $label,
                'labelLong'        => '',
                'info'             => '',
                'count'            => $row->lead_count,
                'cumulative_total' => $cumulative,
            ];
        }
        $sortedStats = collect($stats)->sortBy('labelShort')->values()->toArray();

        ## Final response
        return [
            'title'                 => 'Top users by lead generation',
            'info'                  => 'Users who own the most leads in the system',
            'value'                 => $totalLeads,
            'items'                 => $sortedStats,
            'jsComponent'           => 'CreateBarVerticalChart',
            'chartAdditionalProps'  => [
                'barSize' => 30,
                'height' => 550,
                'showCartesianGrid' => true
            ],
        ];
    }


    public function getLeadsLinkData($searchText = '')
    {
        try {

            return $this->getModelData(
                columns: ['id', 'nickname', 'created_at'],
                limit: 10,
                orderBy: 'created_at',
                orderType: 'DESC',
                searchText: $searchText,
            )->map(function ($item) {
                return [
                    'label' => $item->nickname,
                    'value' => $item->id,
                ];
            });
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }

    public function addLeadsLink(array $inputs)
    {
        try {
            $relatedToId   = $inputs['related_to_id'] ?? null;
            $relatedToType = $inputs['related_to_type'] ?? null;
            $leadIds    = $inputs['lead_ids'] ?? null;     

            if (empty($leadIds)) throw new Exception('Lead is empty !');

            $models = $this->model::whereIn('id', $leadIds)->get();

            if ($models->isEmpty()) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            if ($relatedToType && $relatedToId) {
                $relationMethods = [
                    PROJECT => 'projects',
                    ORGANIZATION => 'organizations',
                    OPPORTUNITY => 'opportunities',
                ];
                $relation = $relationMethods[$relatedToType] ?? null;

                if (!$relation) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

                if ($relation) {
                    $childModel = $this->getChildModel($relatedToType, $relatedToId);
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
            return false;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), $th->getLine(), $th);
        }
    }

    public function leadsUnlink($inputs)
    {
        try {
            $baseId = $inputs['base_id'] ?? null;
            $parentId = $inputs['parent_id'] ?? null;
            $relatedToType = $inputs['related_to_type'] ?? null;

            if (!$relatedToType) throw new Exception('Related to type is empty');
            if (!$baseId) throw new Exception('Base ID is empty');
            if (!$parentId) throw new Exception('Parent ID is empty');

            $relatedToTypes = [
                PROJECT,
                ORGANIZATION,
                OPPORTUNITY,
            ];

            if (!in_array($relatedToType, $relatedToTypes)) {
                throw new Exception('Related to type not found');
            }

            ## Map relationship types to their pivot models and column names
            $pivotConfig = [
                PROJECT => [
                    'model' => Projectable::class,
                    'base_column' => 'project_id',
                    'parent_column' => 'projectable_id',
                    'base_model' => Project::class,
                ],
                ORGANIZATION => [
                    'model' => Organizationable::class,
                    'base_column' => 'organization_id',
                    'parent_column' => 'organizationable_id',
                    'base_model' => Organization::class,
                ],
                OPPORTUNITY => [
                    'model' => Opportunityable::class,
                    'base_column' => 'opportunity_id',
                    'parent_column' => 'opportunityable_id',
                    'base_model' => Opportunity::class,
                ],
            ];

            $config = $pivotConfig[$relatedToType] ?? null;

            if (!$config) throw new Exception('Pivot configuration not found');

            $baseModel = $config['base_model']::find($baseId);
            if (!$baseModel) throw new Exception('Base model not found');

            $result = $config['model']::where($config['base_column'], $baseId)
                ->where($config['parent_column'], $parentId)
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
