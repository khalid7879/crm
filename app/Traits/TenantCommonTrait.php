<?php

namespace App\Traits;

use Exception;
use Throwable;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Task;
use App\Models\Tenant\Contact;
use App\Models\Tenant\Project;
use App\Models\Tenant\Opportunity;
use App\Models\Tenant\Organization;
use App\Models\Tenant\Product;
use App\Services\Tenant\CountryService;
use Illuminate\Support\Facades\Storage;
use App\Services\Tenant\TagModelService;
use App\Services\Tenant\TenantLeadService;
use App\Services\Tenant\TenantUserService;
use App\Services\Tenant\ContactModelService;
use App\Services\Tenant\TenantEmpSizeService;
use App\Services\Tenant\TenantProductService;
use App\Services\Tenant\TenantProjectService;
use App\Services\Tenant\TenantRevenueService;
use App\Services\Tenant\TenantLeadStageService;
use App\Services\Tenant\TenantLeadRatingService;
use App\Services\Tenant\TenantLeadSourceService;
use App\Services\Tenant\TenantSocialLinkService;
use App\Services\Tenant\OrganizationModelService;
use App\Services\Tenant\TenantContactTimeService;
use App\Services\Tenant\TenantOpportunityService;
use App\Services\Tenant\TenantIndustryTypeService;
use App\Services\Tenant\TenantLeadPriorityService;
use App\Services\Tenant\TenantDataDesignationService;

trait TenantCommonTrait
{
    private TenantLeadStageService $dataStage;
    private TenantIndustryTypeService $dataCategory;
    private TenantLeadSourceService $dataSource;
    private TenantLeadRatingService $dataRating;
    private TenantUserService $tenantUserService;
    private TenantDataDesignationService $dataDesignationService;
    private TenantSocialLinkService $dataSocialPlatform;
    private OrganizationModelService $organizationService;
    private TenantLeadPriorityService $dataPriorityService;
    private TagModelService $tagService;
    private TenantEmpSizeService $empSizeService;
    private TenantContactTimeService $contactTimeService;
    private TenantRevenueService $revenueTypeModelService;
    private TenantProductService $productService;
    private CountryService $countyModelService;
    private TenantLeadService $leadModelService;
    private ContactModelService $contactModelService;
    private TenantProjectService $tenantProjectService;
    private TenantOpportunityService $opportunityModelService;


    /* --------------------------------------------------------------------------
    | GET RESOURCE DEPENDENCIES
    |--------------------------------------------------------------------------*/

    /**
     * Get resource dependencies
     *
     * @param string $fromActivity
     * @param mixed|null $model
     * @param array $neededData
     * @return array<string,mixed>
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function getModelDependencies($fromActivity = LEAD, $model = null, $neededData = []): array
    {

        try {

            $data = [];

            /* --------------------------------------------------------------------------
            | USER DEPENDENCIES
            |--------------------------------------------------------------------------*/
            if (in_array(USER, $neededData)) {
                $usersContactReferenceList = $this->tenantUserService->getPaginatedModels([
                    'orderBy' => 'name',
                    'orderType' => 'asc',
                    'isPaginate' => false,
                    'wheres' => ['is_active' => true],
                    'with' => ['contactReference']
                ])->toArray();

                ## Format users with contact reference
                // $formattedList = collect($usersContactReferenceList)->mapWithKeys(function ($item) {
                //     return [
                //         $item['contact_reference'][0]['id'] ?? null => $item['name'] ?? null,
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


                ## Get currently authenticated user contact reference
                $causerRecContact = $this->tenantUserService->getSingleModel(
                    modelOrId: _getAuthInformation('id'),
                    with: ['contactReference']
                );

                $data['tenantUsers'] = [
                    'list' => $formattedList,
                    'authUser' => $causerRecContact?->get_contact_reference['id'] ?? null,
                ];
            }

            /* --------------------------------------------------------------------------
            | ORGANIZATION DEPENDENCIES
            |--------------------------------------------------------------------------*/
            if (in_array(ORGANIZATION, $neededData)) {
                $data['organizations'] = $this->organizationService
                    ->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])
                    ->pluck('name', 'id')
                    ->toArray();
            }

            /* --------------------------------------------------------------------------
            | DATA CATEGORY DEPENDENCIES
            |--------------------------------------------------------------------------*/
            if (in_array(DATA_CATEGORY, $neededData)) {

                ## Fetch all categories in one query and group by type
                $categories = $this->dataCategory->getPaginatedModels([
                    'orderBy' => 'name',
                    'orderType' => 'asc',
                    'isPaginate' => false,
                    'isActive' => true,
                    'wheres' => ['type' => [INDUSTRY, 'TASK', 'PRODUCT', 'OPPORTUNITY', 'PROJECT']],
                ])->groupBy('type');

                ## Structure categories for different contexts
                $data['dataCategories'] = [
                    'list' => $categories->get(INDUSTRY)?->pluck('name', 'id')->toArray() ?? [],
                    'default' => '',
                ];

                $data['dataCategoriesForTasks'] = [
                    'list' => $categories->get('TASK')?->pluck('name', 'id')->toArray() ?? [],
                    'default' => '',
                ];

                $data['dataCategoriesForProducts'] = [
                    'list' => $categories->get('PRODUCT')?->pluck('name', 'id')->toArray() ?? [],
                    'default' => '',
                ];


                $data['dataCategoriesForOpportunities'] = [
                    'list' => $categories->get('OPPORTUNITY')?->pluck('name', 'id')->toArray() ?? [],
                    'default' => '',
                ];

                $data['dataCategoriesForProject'] = [
                    'list' => $categories->get('PROJECT')?->pluck('name', 'id')->toArray() ?? [],
                    'default' => '',
                ];
            }

            /* --------------------------------------------------------------------------
            | STAGE DEPENDENCIES
            |--------------------------------------------------------------------------*/
            if (in_array(STAGE, $neededData)) {

                $data['dataStages'] = $this->dataStage->getStagesByType([
                    'type' => 'lead',
                    'default' => @$model?->get_last_stage?->id,
                    'exclude' => 'Converted'
                ]);
                $data['dataStagesForTask'] = $this->dataStage->getStagesByType(['type' => 'task']);

                $data['dataStagesForOpportunities'] = $this->dataStage->getStagesByType(['type' => 'OPPORTUNITY']);
                $data['dataStagesForProject'] = $this->dataStage->getStagesByType(['type' => 'PROJECT']);
            }

            /* --------------------------------------------------------------------------
            | PRODUCT DEPENDENCIES
            |--------------------------------------------------------------------------*/
            if (in_array(PRODUCT, $neededData)) {
                $data['products'] = $this->productService
                    ->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])
                    ->pluck('name', 'id')
                    ->toArray();
            }

            /* --------------------------------------------------------------------------
            | OTHER DEPENDENCIES: SALUTATION, GENDER, CONTACT METHOD, SOURCE, RATING, DESIGNATION, SOCIAL, PRIORITY, EMP_SIZE, TAGS, CONTACT_TIME, REVENUE, RELATED_TYPE, CURRENCY
            |--------------------------------------------------------------------------*/
            if (in_array(SALUTATION, $neededData)) {
                $data['dataSalutations'] = [
                    'list' => _salutations(),
                    'default' => $model?->salutation ?? '4'
                ];
            }

            if (in_array(GENDER, $neededData)) {
                $data['dataGenders'] = [
                    'list' => _genders(),
                    'default' => ''
                ];
            }

            if (in_array(CONTACT_METHOD, $neededData)) {
                $data['dataContactMethods'] = [
                    'list' => _preferredContactMethod(),
                    'default' => '1'
                ];
            }

            if (in_array(DATA_SOURCE, $neededData)) {
                $dataSourceList = $this->dataSource
                    ->getPaginatedModels([
                        'orderBy' => 'name',
                        'orderType' => 'asc',
                        'isPaginate' => false,
                        'isActive' => true
                    ])
                    ->pluck('name', 'id')
                    ->toArray();

                $data['dataSources'] = [
                    'list' => $dataSourceList,
                    'default' => collect(array_filter($dataSourceList, fn($value) => strtolower($value) === 'web'))->keys()->first()
                ];
            }

            if (in_array(DATA_RATING, $neededData)) {
                $data['dataRatings'] = $this->dataRating
                    ->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false, 'isActive' => true])
                    ->pluck('name', 'id')
                    ->toArray();
            }

            if (in_array(DATA_DESIGNATION, $neededData)) {
                $data['dataDesignations'] = $this->dataDesignationService
                    ->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false, 'isActive' => true])
                    ->pluck('name', 'id')
                    ->toArray();
            }

            if (in_array(SOCIAL_LINK, $neededData)) {
                $data['dataSocial'] = $this->dataSocialPlatform->formatByKeys($model);
            }

            if (in_array(DATA_PRIORITY, $neededData)) {
                $dataPriorities = $this->dataPriorityService
                    ->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])
                    ->pluck('name', 'id')
                    ->toArray();

                $data['dataPriorities'] = [
                    'list' => $dataPriorities,
                    'default' => collect(array_filter($dataPriorities, fn($value) => strtolower($value) === 'low'))->keys()->first() ?? ""
                ];
            }

            if (in_array(DATA_EMP_SIZE, $neededData)) {
                $data['dataEmpSizes'] = [
                    'list' => $this->empSizeService->getPaginatedModels(['orderBy' => 'size', 'orderType' => 'asc', 'isPaginate' => false])
                        ->pluck('name', 'id')
                        ->toArray(),
                    'default' => ''
                ];
            }

            if (in_array(TAG, $neededData)) {
                $data['dataTags'] = [
                    'list' => $this->tagService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])
                        ->pluck('name', 'id')
                        ->toArray(),
                    'default' => ''
                ];
            }

            if (in_array(DATA_CONTACT_TIME, $neededData)) {
                $data['dataContactTimes'] = [
                    'list' => $this->contactTimeService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])
                        ->pluck('name', 'id')
                        ->toArray(),
                    'default' => ''
                ];
            }

            if (in_array(DATA_REVENUE, $neededData)) {
                $data['dataRevenueTypes'] = [
                    'list' => $this->revenueTypeModelService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])
                        ->pluck('name', 'id')
                        ->toArray(),
                    'default' => ''
                ];
            }

            if (in_array(DATA_RELATED_TYPE, $neededData)) {
                $data['dataRelatedTypes'] = [
                    'list' => [
                        'LEAD' => 'Lead',
                        'PROJECT' => 'Project',
                        'OPPORTUNITY' => 'Opportunity',
                        'CONTACT' => 'Contact',
                        'ORGANIZATION' => 'Organization',
                        'TASK' => 'Task',
                    ],
                    'default' => $fromActivity,
                ];
            }

            if (in_array(CURRENCY, $neededData)) {
                $data['dataCurrencies'] = [
                    'list' => $this->countyModelService->getCurrencyByKeyValue(),
                    'default' => ''
                ];
            }
            if (in_array(COUNTRY, $neededData)) {
                $data['dataCountries'] = [
                    'list' => $this->countyModelService->getPaginatedModels(['orderBy' => 'name', 'orderType' => 'asc', 'isPaginate' => false])
                        ->pluck('name', 'id')
                        ->toArray(),
                    'default' => ''
                ];
            }
            if (in_array(CITY, $neededData)) {
                $data['dataCities'] = [
                    'list' => [],
                    'default' => ''
                ];
            }

            return $data;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /* --------------------------------------------------------------------------
    | MAP MODEL DATA TO FORM DATA
    |--------------------------------------------------------------------------*/

    /**
     * Mapping model data and form data
     *
     * @param array $modelData
     * @param array $dependencyData
     * @return array<string,mixed>
     * @author Mamun Hossen
     */
    public function mapModelToFormData(array $modelData, array $dependencyData): array
    {
        $allData = [];

        $allData['model'] = $modelData;

        $allData['id'] = $modelData['id'] ?? ($dependencyData['tenantUsers']['authUser'] ?? null);
        $allData['get_task_type'] = $modelData['get_task_type'] ?? null;
        $allData['creator_id'] = $modelData['creator_id'] ?? ($dependencyData['tenantUsers']['authUser'] ?? null);
        $allData['owner_id'] = $modelData['owner_id'] ?? null;
        $allData['stage_id'] = $modelData['get_last_stage']['id'] ?? ($dependencyData['dataStages']['default'] ?? null);
        $allData['dataStages'] = $dependencyData['dataStages'] ?? [];
        $allData['dataTags'] = $dependencyData['dataTags'] ?? [];
        $allData['dataStagesForOpportunities'] = $dependencyData['dataStagesForOpportunities'] ?? [];
        $allData['tenantUsers'] = $dependencyData['tenantUsers'] ?? [];
        $allData['organizations'] = $dependencyData['organizations'] ?? [];
        $allData['products'] = $dependencyData['products'] ?? [];
        $allData['dataCategoriesForOpportunities'] = $dependencyData['dataCategoriesForOpportunities'] ?? [];
        $allData['dataCategoriesForTasks'] = $dependencyData['dataCategoriesForTasks'] ?? [];
        $allData['dataCategoriesForProject'] = $dependencyData['dataCategoriesForProject'] ?? [];
        $allData['dataStagesForTask'] = $dependencyData['dataStagesForTask'] ?? [];
        $allData['dataStagesForProject'] = $dependencyData['dataStagesForProject'] ?? [];
        $allData['dataPriorities'] = $dependencyData['dataPriorities'] ?? [];
        $allData['dataSources'] = $dependencyData['dataSources'] ?? [];
        $allData['dataRelatedTypes'] = $dependencyData['dataRelatedTypes'] ?? [];
        $allData['dataSocial'] = $dependencyData['dataSocial'] ?? [];
        $allData['dataCountries'] = $dependencyData['dataCountries'] ?? [];
        $allData['dataSalutations'] = $dependencyData['dataSalutations'] ?? [];
        $allData['dataDesignations'] = $dependencyData['dataDesignations'] ?? [];
        $allData['dataRevenueTypes'] = $dependencyData['dataRevenueTypes'] ?? [];
        $allData['dataCurrencies'] = $dependencyData['dataCurrencies'] ?? [];

        $allData['modelStages'] = !empty($modelData['stages'])
            ? $this->dataStage->getModelStages($modelData['stages'])
            : [];

        $allData['tasks_report'] =  $modelData['tasks_report'] ?? [];
        $allData['note_report'] =  $modelData['note_report'] ?? [];

        $attachmentFiles = $modelData['attachment_files'] ?? [];

        $allExtensions = ['mp3', 'txt', 'docx', 'doc', 'ppt', 'pptx', 'webp', 'pdf', 'xlsx', 'xls', 'mp4'];

        foreach ($attachmentFiles as $key => &$file) {
            if (!empty($file['attachment_file'])) {
                $file['file_url'] = Storage::disk('tenant_public')->url($file['attachment_file']);
                $extension = pathinfo($file['attachment_file'], PATHINFO_EXTENSION);
                $file['icon'] = '';

                if (in_array($extension, $allExtensions)) {
                    $file['icon'] = $extension;
                }
            }
        }
        $allData['attachment_report'] = !empty($attachmentFiles)
            ? collect($attachmentFiles)->sortByDesc('created_at')->values()->all()
            : [];
        return $allData;
    }

    public function prepareEditAddressData(array &$data, array $addresses): void
    {
        // $data = [];
        try {
            if ($addresses) {
                foreach ($addresses as $key => $address) {
                    $country_id = $this->countyModelService->getCountryByName($address['country'])?->id ?? "";

                    $city_id = $this->countyModelService->getCityByName($address['city'])?->id ?? "";
                    $cities = $this->countyModelService->getCitiesByCountryId($country_id) ??  collect();

                    $cityList = [
                        'list' => $cities->toArray(),
                        'default' => '',
                    ];

                    if ($address['type']) {
                        if ($address['type'] == SHIPPING) {
                            $data['shipping_postal_code'] = $address['post_code'];
                            $data['shipping_street'] = $address['street'];
                            $data['shipping_country_id'] = $country_id;
                            $data['shipping_city_id'] = $city_id;
                            $data['shippingCities'] = $cityList;
                        } elseif ($address['type'] == BILLING) {
                            $data['billing_postal_code'] = $address['post_code'];
                            $data['billing_street'] = $address['street'];
                            $data['billing_country_id'] = $country_id;
                            $data['billing_city_id'] = $city_id;
                            $data['billingCities'] = $cityList;
                        }
                    }
                }
            }
            // return $data;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Retrieve dependency information for a given resource before deletion.
     *
     * This method determines what related data (e.g., tasks, notes) would be deleted
     * if a specific entity (e.g., Project, Organization, Opportunity) is removed.
     *
     * @param  string  $fromAction  The entity type (PROJECT, ORGANIZATION, OPPORTUNITY, etc.)
     * @param  array   $inputs      The input array containing 'resourceId'
     * @return array                Formatted dependency data with counts and flags
     *
     * @throws \Exception
     */
    public function getDeleteDependencyData(string $fromAction, array $inputs): array
    {
        try {
            ## Extract resource ID safely
            $resourceId = $inputs['resourceId'] ?? null;
            if (empty($resourceId)) {
                return [];
            }

            /**
             * Define available models and their corresponding dependency relationships.
             * 
             * You can easily extend this map later for new modules.
             */
            $modelMap = [
                PROJECT      => Project::class,
                ORGANIZATION => Organization::class,
                OPPORTUNITY  => Opportunity::class,
                LEAD         => Lead::class,
                TASK         => Task::class,
                CONTACT      => Contact::class,
            ];

            $relationsMap = [
                PROJECT      => ['tasks', 'notes'],
                ORGANIZATION => ['tasks', 'notes'],
                OPPORTUNITY  => ['tasks', 'notes'],
                LEAD         => ['tasks', 'notes', 'opportunities'],
                TASK         => ['tasks', 'notes'],
                CONTACT      => ['tasks', 'notes'],
            ];

            ## Validate entity type
            if (!isset($modelMap[$fromAction])) {
                throw new Exception("Invalid action type: {$fromAction}");
            }

            $modelClass = $modelMap[$fromAction];
            $relations  = $relationsMap[$fromAction] ?? [];

            ## Fetch resource with its related data
            $resource = $modelClass::with($relations)->find($resourceId);
            if (!$resource) {
                throw new Exception("Resource not found for ID: {$resourceId}");
            }

            ## Build the delete preview data dynamically
            $deleteData = [];

            foreach ($relations as $relation) {
                if (!method_exists($resource, $relation)) {
                    continue;
                }

                $relationData = $resource->{$relation};
                $count = $relationData?->count() ?? 0;

                if ($count > 0) {
                    $deleteData[$relation] = [
                        'label'    => ucfirst($relation),
                        'count'    => $count,
                        'isActive' => 1,
                    ];
                }
            }

            return [
                'id'          => $resourceId,
                'deleteItems' => $deleteData,
                'result'      => true,
            ];
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ', $th->getLine());
        }
    }


    /**
     * Delete a resource (e.g., Project, Organization, Opportunity) and its dependencies.
     *
     * @param  string  $fromAction   The entity type (e.g., PROJECT, ORGANIZATION, OPPORTUNITY)
     * @param  array   $dependency   The request payload containing delete flags and resource ID
     * @return bool
     *
     * @throws \Exception
     */
    /**
     * Delete a resource (e.g., Project, Organization, Opportunity) and its dependencies.
     *
     * @param  string  $fromAction   The entity type (e.g., PROJECT, ORGANIZATION, OPPORTUNITY)
     * @param  array   $dependency   The request payload containing delete flags and resource ID
     * @return bool
     *
     * @throws \Exception
     */
    public function deleteDependency(string $fromAction, array $dependency): bool
    {
        try {
            if (empty($fromAction) || empty($dependency)) {
                return false;
            }

            $deleteInfo = $dependency['finalPayload'] ?? $dependency;

            $id = $deleteInfo['id'] ?? null;
            if (empty($id)) {
                return false;
            }

            ## Mapping each type to its model class
            $modelMap = [
                PROJECT      => Project::class,
                ORGANIZATION => Organization::class,
                OPPORTUNITY  => Opportunity::class,
                LEAD         => Lead::class,
                TASK         => Task::class,
                CONTACT      => Contact::class,
            ];

            ## Define which relationships each model has
            $relationsMap = [
                PROJECT      => ['tasks', 'notes'],
                ORGANIZATION => ['tasks', 'notes'],
                OPPORTUNITY  => ['tasks', 'notes'],
                LEAD         => ['tasks', 'notes', 'opportunities'],
                TASK         => ['tasks', 'notes'],
                CONTACT      => ['tasks', 'notes'],
            ];

            if (!isset($modelMap[$fromAction])) {
                throw new Exception("Invalid action type: {$fromAction}");
            }

            $modelClass = $modelMap[$fromAction];
            $relations  = $relationsMap[$fromAction] ?? [];

            ## Load resource with its specific dependencies
            $resource = $modelClass::with($relations)->find($id);

            if (!$resource) {
                throw new Exception("Resource not found for ID: {$id}");
            }

            ## Loop over delete flags and relationships dynamically
            foreach ($relations as $relation) {
                $shouldDelete = $deleteInfo[$relation] ?? 0;
                if ($shouldDelete && method_exists($resource, $relation)) {
                    $resource->{$relation}()->delete();
                }
            }
            // dd($resource);

            ## Delete the main resource itself
            $resource->delete();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Assigns a predefined set of default permissions to a given tenant role.
     *
     * This method is typically used when creating a new tenant user or role,
     * ensuring that the role starts with a consistent, limited set of
     * permissions for key entities like tasks, contacts, leads, etc.
     *
     * @param  int|string  $roleId  The role's ID or identifier.
     * @return void
     * @throws \Exception if the role is invalid or not found.
     */
    public function assignDefaultPermissionsToTenantUserRole($roleId): void
    {
        ## Define default permission names that every tenant user should have.

        $defaultPermissions = [
            'leads-list',
            'tasks-list',
            'contacts-list',
            'opportunities-list',
            'organization-list',
            'projects-list',
            'users-list',
            'departments-list',
            'industry-types-list',
            'products-list',
            'lead-sources-list',
            'stages-list',
            'lead-priorities-list',
            'lead-ratings-list',
            'data-designations-list',
            'social-links-list',
            'data-contact-times-list',
            'data-emp-sizes-list',
            'data-revenue-list',
        ];

        ## Fetch all matching permission IDs

        $permissions = Permission::whereIn('name', $defaultPermissions)
            ->pluck('id');

        ## Find the role or fail if invalid

        $role = Role::find($roleId);

        if (!$role) {
            throw new Exception(INVALID_REQUEST);
        }

        ## Sync (replace) all role permissions with the default set

        $role->syncPermissions($permissions);
    }


    /**
     * Retrieve parent model for a projects,organizations,opportunities tasks
     *
     * @param string $parentType Parent type (LEAD, PROJECT, etc.)
     * @param string $parentId Parent model ID
     * @return mixed
     * @throws Exception
     */
    public function getChildModel(string $childType, string $childId): mixed
    {
        // dd($parentType,$parentId);

        ## Map parent types to model services
        $child = [
            PROJECT => Project::class,
            ORGANIZATION => Organization::class,
            OPPORTUNITY => Opportunity::class,
            LEAD => Lead::class,
        ];

        try {

            if ($child == TASK) {
                $model = $this->getSingleModel($childId);
            } else {
                if (!isset($child[$childType])) throw new Exception("Related to type '{$childType}' is not supported.");
                $model = $child[$childType]::find($childId);
            }

            if (!$model) throw new Exception("Child related model not found for ID {$childId}.");

            return $model;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), 0, $th);
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
    public function getParentModel(string $parentType, string $parentId): mixed
    {
        $parents = [
            OPPORTUNITY => Opportunity::class,
            LEAD => Lead::class,
            PROJECT => Project::class,
            ORGANIZATION => Organization::class,
            PRODUCT => Product::class
        ];

        try {

            if ($parentType === TASK) {
                $model = Task::find($parentId);
            } else {
                if (!isset($parents[$parentType])) {
                    throw new Exception("Related to type '{$parentType}' is not supported.");
                }

                $model = $parents[$parentType]::find($parentId);
            }

            if (!$model) {
                throw new Exception("Related model not found for ID {$parentId}.");
            }

            return $model;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), 0, $th);
        }
    }
}
