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
use App\Models\Tenant\Organizationable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

/**
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class OrganizationModelService extends BaseModelService
{
    use TenantCommonTrait;
    use TenantCommonModelTrait;
    /**
     * Class instance
     *
     * @param Organization $model
     */
    public function __construct(
        Organization $model,
        TenantUserService $tenantUserService,
        TenantIndustryTypeService $dataCategory,
        TenantLeadSourceService $dataSource,
        TenantLeadStageService $dataStage,
        TenantLeadPriorityService $dataPriorityService,
        TagModelService $tagService,
        TenantSocialLinkService $dataSocialPlatform,
        CountryService $countyModelService,
        TenantDataDesignationService $dataDesignationService,
        TenantRevenueService $revenueTypeModelService
    ) {
        parent::__construct($model);
        $this->tenantUserService = $tenantUserService;
        $this->dataCategory = $dataCategory;
        $this->dataSource = $dataSource;
        $this->dataStage = $dataStage;
        $this->dataPriorityService = $dataPriorityService;
        $this->tagService = $tagService;
        $this->dataSocialPlatform = $dataSocialPlatform;
        $this->countyModelService = $countyModelService;
        $this->dataDesignationService = $dataDesignationService;
        $this->revenueTypeModelService = $revenueTypeModelService;
    }


    /**
     * Return predefined organization routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return  [
            'organizationList'   => 'tenant.organization.index',
            'organizationCreate' => 'tenant.organization.create',
            'organizationStore'  => 'tenant.organization.store',
            'organizationEdit'   => 'tenant.organization.edit',
            'organizationUpdate' => 'tenant.organization.update',
            'organizationShow'   => 'tenant.organization.show',
            'organizationDelete' => 'tenant.organization.destroy',
            'organizationsLinkData'   => 'tenant.organization.link.data',
            'addOrganizationsLink'    => 'tenant.organization.add.link',
            'organizationUnLink'      => 'tenant.organization.unlink',
            'organizationChangeStage' => 'tenant.organization.change.stage',
            'countryIdWiseCity'       => 'tenant.contacts.countryId.wise.city',
            'organizationWiseDependency' => 'tenant.organization.wise.dependency',
            'organizationDeleteWithDependency' => 'tenant.organization.delete.with.dependency',
            'handleSampleData'       => 'tenant.organization.handle.sample.data',
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
            'projectsDelete'         => 'tenant.projects.destroy',
            'projectsShow'           => 'tenant.projects.show',
            'projectsLinkData'       => 'tenant.projects.link.data',
            'addProjectsLink'        => 'tenant.projects.add.link',
            'projectUnLink'          => 'tenant.projects.unlink',
            'getLabelValueFormattedList'    => 'tenant.organization.getLabelValueFormattedList',
            'dataRelatedRoutes'             => [
                'LEAD'                      => 'tenant.leads.getLabelValueFormattedList',
                'PROJECT'                   => 'tenant.projects.getLabelValueFormattedList',
                'OPPORTUNITY'               => 'tenant.opportunity.getLabelValueFormattedList',
                'CONTACT'                   => 'tenant.contacts.getLabelValueFormattedList',
                'ORGANIZATION'              => 'tenant.organization.getLabelValueFormattedList',
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
            'name' => ['required'],
            'details' => ['nullable'],
            'website' => ['nullable'],
            'mobile_number' => [
                'nullable',
                'regex:/^[0-9]{5,20}$/',
            ],
            'tags' => ['nullable', 'array'],
            'associates' => ['nullable', 'array'],
            'social_links' => ['nullable', 'array'],
            'is_active' => ['required'],
            'organizationable_id' => ['nullable'],
            'shipping_country_id' => ['nullable'],
            'shipping_city_id' => ['nullable'],
            'shipping_postal_code' => ['nullable'],
            'shipping_street' => ['nullable'],
            'billing_country_id' => ['nullable'],
            'billing_city_id' => ['nullable'],
            'billing_postal_code' => ['nullable'],
            'billing_street' => ['nullable'],
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
            'mobile_number.regex' => __('Mobile number must be between 5 and 20 digits and contain numbers only'),

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
     * @return \App\Models\Tenant\Organization|string  Returns Lead model on success or error message string
     *
     * @throws \Exception When creation or update fails
     * 
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doResourceStore(array $inputs): Organization|string
    {
        try {

            ## Filter allowed fields for lead creation
            $modelInputs = collect($inputs)->only([
                'causer_id',
                'owner_id',
                'name',
                'details',
                'website',
                'mobile_number',
                'is_active',
            ])->toArray();

            ## Create or update model
            $model = $this->getModelsByColumn('name', $modelInputs['name'])->first();
            if (!empty($inputs['id'])) {
                $model = tap($this->model->findOrFail($inputs['id']))->update($modelInputs);
            } elseif (empty($model)) {
                $model =  $this->model->create($modelInputs);
            }


            if (!$model) {
                throw new Exception(COMMON_ERROR_MSG);
            }


            ## Attach related models

            if (!empty($inputs['shipping_country_id']) && !empty($inputs['shipping_city_id'])) {
                $country = $this->countyModelService->getCountryById($inputs['shipping_country_id'])->name ?? '';
                $city    = $this->countyModelService->getCityById($inputs['shipping_city_id'])->name ?? '';

                $sPostCode = $inputs['shipping_postal_code'] ?? '';
                $sStreet   = $inputs['shipping_street'] ?? '';

                $model->address()->create([
                    'type'      => SHIPPING,
                    'country'   => $country,
                    'city'      => $city,
                    'post_code' => $sPostCode,
                    'street'    => $sStreet,
                ]);
            }

            if (!empty($inputs['billing_country_id']) && !empty($inputs['billing_city_id'])) {
                $country = $this->countyModelService->getCountryById($inputs['billing_country_id'])->name ?? '';
                $city    = $this->countyModelService->getCityById($inputs['billing_city_id'])->name ?? '';

                $bPostCode = $inputs['billing_postal_code'] ?? '';
                $bStreet   = $inputs['billing_street'] ?? '';

                $model->address()->create([
                    'type'      => BILLING,
                    'country'   => $country,
                    'city'      => $city,
                    'post_code' => $bPostCode,
                    'street'    => $bStreet,
                ]);
            }


            ## Attach task to parent model

            if (!empty($inputs['organizationable_id']) && !empty($inputs['related_to_type']) && $inputs['related_to_type'] == PROJECT) {
                $childModel = $this->getChildModel($inputs['related_to_type'], $inputs['organizationable_id']);
                $relationMethods = [
                    PROJECT => 'projects',
                ];
                $relation = $relationMethods[$inputs['related_to_type']] ?? null;
                if ($childModel) {
                    $this->doAttachWithParentModel(parentModel: $model, childModel: $childModel->id, relationalMethod: $relation, syncType: 'attach');
                    $childModel->touch();
                }
            } else {
                if (!empty($inputs['organizationable_id']) && !empty($inputs['related_to_type'])) {
                    $parentModel = $this->getParentModel($inputs['related_to_type'], $inputs['organizationable_id']);
                    if ($parentModel) {
                        $this->doAttachWithParentModel(parentModel: $parentModel, childModel: $model->id, relationalMethod: 'organizations', syncType: 'attach');
                        $parentModel->touch();
                    }
                }
            }



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
     * Handle attaching all related models for a lead.
     *
     * @param  \App\Models\Tenant\Organization  $model
     * @param  array  $inputs
     * @param  int|string|null  $creatorId
     * @return void
     */
    protected function attachRelations(Organization $model, array $inputs, int|string|null $causer_id, int|string|null $owner_id): void
    {
        try {

            ## Associates (users → contacts)
            if (!empty($inputs['associates']) && is_array($inputs['associates'])) {
                $associates = $inputs['associates'];
                $this->doAttachWithParentModel($model, $associates, 'associates');
            }

            ## Social links
            if (!empty($inputs['social_links']) && is_array($inputs['social_links'])) {
                $this->doAttachWithParentModel($model, $inputs['social_links'], 'socials');
            }


            ## Tags
            if (!empty($inputs['tags']) && is_array($inputs['tags'])) {
                $tags = $this->tagService->doResourceStoreAll($inputs['tags']);
                $this->doAttachWithParentModel($model, $tags, 'tags');
            }
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * get cities by country id
     * 
     *  @author Mamun Hossen
     */
    public function getCitiesByCountryId($inputs = [])
    {
        try {
            $countryId = $inputs['countryId'];
            $cities    = $this->countyModelService->getCitiesByCountryId($countryId);

            $dataList = [
                'list' => collect($cities)->toArray(),
                'default' => ''
            ];
            return $dataList;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }



    /**
     * Resource list
     * 
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function resourceList($requests = []): mixed
    {
        return $this->getPaginatedModels([...$requests, 'with' => ['associates', 'tags', 'owner', 'address']]);
    }

    /**
     * Resource edit related list
     * 
     *  @author Mamun Hossen
     */
    public function organizationEditRelatedData($model)
    {
        try {
            $modelData = $this->getSingleModel(
                $model,
                [
                    'associates',
                    'tags',
                    'tasks',
                    'tasks.stages',
                    'tasks.categories',
                    'tasks.priorities',
                    'notes',
                    'owner',
                    'socials',
                    'addresses',
                    'contacts.owner',
                    'opportunities.owner',
                    'opportunities.stages',
                    'leads.owner.userReference',
                    'leads.designations',
                    'leads.organizations',
                    'leads.stages',
                    'projects.owner',
                    'projects.stages',
                    'leads.contacts',
                ]
            );

            $dependencyData = $this->getModelDependencies(
                ORGANIZATION,
                $modelData,
                [
                    USER,
                    DATA_CATEGORY,
                    STAGE,
                    DATA_SOURCE,
                    DATA_PRIORITY,
                    SOCIAL_LINK,
                    COUNTRY,
                    DATA_RELATED_TYPE,
                    SALUTATION,
                    DATA_DESIGNATION,
                    CITY,
                    DATA_REVENUE,
                    CURRENCY
                ]
            );
            // dd($dependencyData);
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
            $modelData['projects_report'] = $modelData->projects->sortByDesc('created_at')->values();
            $modelData['note_report']  = $modelData->notes->sortByDesc('created_at')->values();
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

            $data =  $this->mapModelToFormData($modelData->toArray(), $dependencyData);
            return $data;
        } catch (\Throwable $th) {
            throw $th;
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
                ['label' => 'Organization name', 'value' => $model->name],
                ['label' => 'Organization created on', 'value' => _dateFormat($model->created_at, 'd M, Y')],
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
            $model = $this->getSingleModel(modelOrId: $model, with: ['associates', 'socials', 'tags', 'addresses']);

            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            ## Base fields
            $data = $model->only(['causer_id', 'owner_id', 'name', 'mobile_number', 'website', 'details', 'is_active']);

            ## Conditional assignments
            $data['associates'] = $model->associates ? $model->associates->pluck('id')->toArray() : [];
            $data['tags'] = $model->tags ? $model->tags->pluck('name')->toArray() : [];
            $data['social_links'] = $model->socials ? $model->socials->pluck('id')->toArray() : [];
            $addresses = $model->addresses ?? [];

            $this->prepareEditAddressData($data, collect($addresses)->toArray());

            return $data;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), (int)$th->getCode(), $th);
        }
    }

    /**
     * Retrieve dependency information for a given resource before deletion.
     * 
     * * @author Mamun Hossen
     */
    public function resourceDeleteDependencyData(array $inputs): array
    {
        try {
            return $this->getDeleteDependencyData(ORGANIZATION, $inputs);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Delete a resource (e.g., Project, Organization, Opportunity) and its dependencies.
     * 
     * * @author Mamun Hossen
     */
    public function resourceDeleteWithDependency(array $dependency)
    {
        try {
            // dd($dependency);
            return $this->deleteDependency(ORGANIZATION, $dependency);
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
     * Generate organizations graph report based on the specified type
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getOrganizationsChartReport(string $type): array
    {
        return match ($type) {
            ORGANIZATIONS_BY_MONTH        => $this->getOrganizationsByMonthReport(),
            ORGANIZATIONS_BY_TOP_OWNERS   => $this->getOrganizationsByTopOwnersReport(),

            default => throw new Exception("Invalid organizations report type: $type"),
        };
    }




    /**
     * Generate a report of new organizations created over the last 12 months,
     * including the current month. Automatically spans across years.
     *
     * Returns a list of the last 12 months with lead counts (0 if none),
     * formatted like: "Dec 24", "Jan 25", etc.
     *
     * @return array
     *
     * @example
     * [
     *   { "index": 1, "month": "Dec 24", "year": 2024, "total_organizations": 3 },
     *   { "index": 2, "month": "Jan 25", "year": 2025, "total_organizations": 10 },
     *   ...
     * ]
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getOrganizationsByMonthReport(): array
    {
        ## Determine date range: last 12 months including current month
        $endDate = now()->startOfMonth();
        $startDate = $endDate->copy()->subMonths(11);

        ## Fetch lead counts grouped by year and month
        $monthlyLeads = DB::table('organizations')
            ->selectRaw('
            YEAR(created_at) as year,
            MONTH(created_at) as month_number,
            COUNT(*) as total_organizations
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

            $totalOrganizations = $found->total_organizations ?? 0;

            ## Update cumulative total
            $runningTotal += $totalOrganizations;

            return [
                'index'             => $i + 1,
                'labelShort'        => $date->format('M y'),
                'labelLong'         => $date->format('M Y'),
                'info'              => $year,
                'count'             => $totalOrganizations,
                'cumulative_total'  => $runningTotal,
            ];
        })->values()->toArray();

        return [
            'title' => 'Organizations by month',
            'info'  => 'A sum of organizations by month',
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
    public function getOrganizationsByTopOwnersReport(): array
    {
        ## Total opportunities in the system
        $totalOpportunities = DB::table('organizations')->count();

        ## Group opportunities in the system by owner and join with contacts to get nickname
        $rows = DB::table('organizations')
            ->leftJoin('contacts', 'contacts.id', '=', 'organizations.owner_id')
            ->select(
                'organizations.owner_id',
                DB::raw('COUNT(organizations.id) AS organization_count'),
                'contacts.nickname'
            )
            ->groupBy('organizations.owner_id', 'contacts.nickname')
            ->orderByDesc('organization_count')
            ->get();

        ## Build report rows
        $stats = [];
        $cumulative = 0;
        $index = 1;

        foreach ($rows as $row) {

            $cumulative += $row->organization_count;

            ## Use nickname or fallback to owner_id
            $label = $row->nickname
                ? ucwords($row->nickname)
                : 'User: ' . $row->owner_id;

            $stats[] = [
                'index'            => $index++,
                'labelShort'       => $label,
                'labelLong'        => '',
                'info'             => '',
                'count'            => $row->organization_count,
                'cumulative_total' => $cumulative,
            ];
        }
        $sortedStats = collect($stats)->sortBy('labelShort')->values()->toArray();

        ## Final response
        return [
            'title'                 => 'Top users by organization generation',
            'info'                  => 'Users who own the most organization in the system',
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

    public function getOrganizationsLinkData($searchText = '')
    {
        try {

            return $this->getModelData(
                columns: ['id', 'name', 'created_at'],
                limit: 10,
                orderBy: 'created_at',
                orderType: 'DESC',
                searchText: $searchText,
                fromAction: ORGANIZATION
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

    public function addOrganizationsLink(array $inputs)
    {
        try {
            $relatedToId    = $inputs['related_to_id'] ?? null;
            $relatedToType  = $inputs['related_to_type'] ?? null;
            $organizationIds = $inputs['organization_ids'] ?? null;

            if (empty($organizationIds)) throw new Exception('Organization is empty !');

            // dd($inputs);

            $models = $this->model::whereIn('id', $organizationIds)->get();

            if ($models->isEmpty()) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            if (empty($relatedToType || $relatedToId)) {
                throw new Exception('Related to type or id is empty !');
            }
            // dd($models);
            if ($relatedToType && $relatedToId) {
                $allTypes = [
                    LEAD,
                    OPPORTUNITY,
                    PROJECT
                ];

                if (!in_array($relatedToType, $allTypes)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

                if ($relatedToType == PROJECT) {
                    foreach ($models as $model) {
                        $childModel = $this->getChildModel($relatedToType, $relatedToId);
                        if (empty($childModel)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
                        if ($childModel) {
                            $this->doAttachWithParentModel(
                                parentModel: $model,
                                childModel: $childModel->id,
                                relationalMethod: 'projects',
                                syncType: 'attach'
                            );
                            $childModel->touch();
                        }
                    }
                    return true;
                }

                $parentModel = $this->getParentModel($relatedToType, $relatedToId);
                if (empty($parentModel)) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
                if ($parentModel) {
                    foreach ($models as $model) {
                        $this->doAttachWithParentModel(
                            parentModel: $parentModel,
                            childModel: $model->id,
                            relationalMethod: 'organizations',
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

    public function organizationUnlink($inputs)
    {
        try {
            $baseId = $inputs['base_id'] ?? null;
            $organizationId = $inputs['organization_id'] ?? null;
            $relatedToType = $inputs['related_to_type'] ?? null;

            if (!$relatedToType) throw new Exception('Related to type is empty');
            if (!$baseId) throw new Exception('Base ID is empty');
            if (!$organizationId) throw new Exception('Organization ID is empty');

            $relatedToTypes = [
                PROJECT,
                LEAD,
                OPPORTUNITY,
                ORGANIZATION,
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

            if ($relatedToType == PROJECT) {
                $result = Projectable::where('project_id', $baseId)
                    ->where('projectable_id', $organizationId)
                    ->first();
            } else {
                $result = Organizationable::where('organization_id', $organizationId)
                    ->where('organizationable_id', $baseId)
                    ->first();
            }
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
