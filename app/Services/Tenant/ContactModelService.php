<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Contact;
use App\Models\Tenant\Project;
use App\Models\Tenant\Leadable;
use App\Traits\TenantCommonTrait;
use App\Models\Tenant\Opportunity;
use App\Models\Tenant\Projectable;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant\Organization;
use App\Models\Tenant\Opportunityable;
use App\Models\Tenant\Organizationable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

/**
 *  @author Mamun Hossen
 */
class ContactModelService extends BaseModelService
{
    use TenantCommonTrait;
    public function __construct(
        Contact $model,
        TenantUserService $tenantUserService,
        TagModelService $tagService,
        TenantSocialLinkService $dataSocialPlatform,
        TenantDataDesignationService $dataDesignationService,
        CountryService $countyModelService,
        TenantIndustryTypeService $dataCategory,
        TenantLeadStageService $dataStage,
        TenantLeadSourceService $dataSource,
        TenantLeadPriorityService $dataPriorityService
    ) {
        parent::__construct($model);
        $this->tenantUserService = $tenantUserService;
        $this->tagService = $tagService;
        $this->dataSocialPlatform = $dataSocialPlatform;
        $this->dataDesignationService = $dataDesignationService;
        $this->countyModelService = $countyModelService;
        $this->dataCategory = $dataCategory;
        $this->dataStage = $dataStage;
        $this->dataSource = $dataSource;
        $this->dataPriorityService = $dataPriorityService;
    }

    /**
     * Return list of predefined routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'contactsList'   => 'tenant.contacts.index',
            'contactsCreate' => 'tenant.contacts.create',
            'contactsStore'  => 'tenant.contacts.store',
            'contactsEdit'   => 'tenant.contacts.edit',
            'contactsShow'   => 'tenant.contacts.show',
            'contactsUpdate' => 'tenant.contacts.update',
            'contactsDelete' => 'tenant.contacts.destroy',
            'contactsLinkData'    => 'tenant.contacts.link.data',
            'addContactLink'      => 'tenant.contacts.add.link',
            'contactUnLink'       => 'tenant.contacts.unlink',
            'contactsChangeStage' => 'tenant.contacts.change.stage',
            'countryIdWiseCity'   => 'tenant.contacts.countryId.wise.city',
            'contactsWiseDependency' => 'tenant.contacts.wise.dependency',
            'contactsDeleteWithDependency' => 'tenant.contacts.delete.with.dependency',
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
            'getLabelValueFormattedList'    => 'tenant.contacts.getLabelValueFormattedList',

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
            'details' => ['nullable'],
            'email' => ['nullable', 'email'],
            'first_name' => ['nullable'],
            'last_name' => ['nullable'],
            'nickname' => ['required'],
            'mobile_number' => [
                'nullable',
                'regex:/^[0-9]{5,20}$/',
            ],
            'salutation' => ['required'],
            'dob' => ['nullable'],
            'tags' => ['nullable', 'array'],
            'associates' => ['nullable', 'array'],
            'social_links' => ['nullable', 'array'],
            'data_designation_id' => ['nullable', 'string'],
            'is_active' => ['nullable'],
            'is_delete' => ['nullable'],
            'contactable_id' => ['nullable'],
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
            'nickname.required' => __('Field can not be empty'),
            'salutation.required' => __('Field can not be empty'),
            'email.email' => __('Please enter a valid email address'),
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
    public function doResourceStore(array $inputs): Contact|string
    {
        try {

            ## Filter allowed fields for lead creation
            $modelInputs = collect($inputs)->only([
                'causer_id',
                'owner_id',
                'details',
                'dob',
                'first_name',
                'last_name',
                'nickname',
                'email',
                'mobile_number',
                'salutation',
                'is_active',
                'is_delete'
            ])->toArray();

            ## Create or update model
            $model = !empty($inputs['id'])
                ? tap($this->model->findOrFail($inputs['id']))->update($modelInputs)
                : $this->model->create($modelInputs);

            if (!$model) {
                throw new Exception(COMMON_ERROR_MSG);
            }


            ## Attach related models
            if (!empty(@$inputs['shipping_country_id'] && @$inputs['shipping_city_id'])) {
                $country = $this->countyModelService->getCountryById($inputs['shipping_country_id'])->name;
                $city    = $this->countyModelService->getCityById($inputs['shipping_city_id'])->name;

                ## s = shipping

                $sPostCode = $inputs['shipping_postal_code'] ?? "";
                $sStreet = $inputs['shipping_street'] ?? "";

                $extra = ['type' => SHIPPING, 'country' => $country, 'city' => $city, 'post_code' => $sPostCode, 'street' => $sStreet];
                $model->address()->Create($extra);
            }
            if (!empty(@$inputs['billing_country_id'] && @$inputs['billing_city_id'])) {
                $country = $this->countyModelService->getCountryById($inputs['billing_country_id'])->name;
                $city    = $this->countyModelService->getCityById($inputs['billing_city_id'])->name;

                ## b = billing

                $bPostCode = $inputs['billing_postal_code'] ?? "";
                $bStreet = $inputs['billing_street'] ?? "";

                $extra = ['type' => BILLING, 'country' => $country, 'city' => $city, 'post_code' => $bPostCode, 'street' => $bStreet];
                $model->address()->Create($extra);
            }

            ## Attach contact to chile model
            if (!empty($inputs['contactable_id']) && !empty($inputs['related_to_type'])) {
                $childModel = $this->getChildModel($inputs['related_to_type'], $inputs['contactable_id']);
                $relationMethods = [
                    PROJECT => 'projects',
                    ORGANIZATION => 'organizations',
                    OPPORTUNITY => 'opportunities',
                    LEAD => 'leads',
                ];
                $relation = $relationMethods[$inputs['related_to_type']] ?? null;

                if (!empty($inputs['contactable_id']) && $childModel && $relation) {
                    $this->doAttachWithParentModel(parentModel: $model, childModel: $childModel->id, relationalMethod: $relation, syncType: 'attach');
                    $childModel->touch();
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
     * Resource list
     * 
     *  @author Mamun Hossen
     */
    public function resourceList($requests = []): mixed
    {
        return $this->getPaginatedModels([...$requests, 'with' => ['organization', 'owner', 'socials']]);
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
     * Handle attaching all related models for a lead.
     *
     * @param  \App\Models\Tenant\Contact  $model
     * @param  array  $inputs
     * @param  int|string|null  $creatorId
     * @return void
     */
    protected function attachRelations(Contact $model, array $inputs, int|string|null $causer_id, int|string|null $owner_id): void
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


        ## Tags
        if (!empty($inputs['tags']) && is_array($inputs['tags'])) {
            $tags = $this->tagService->doResourceStoreAll($inputs['tags']);
            $this->doAttachWithParentModel($model, $tags, 'tags');
        }


        ## Direct field relations
        $relations = [
            'data_designation_id'   => 'designations',
        ];

        foreach ($relations as $field => $relation) {
            if (!empty($inputs[$field])) {
                $childModel = $inputs[$field];
                $this->doAttachWithParentModel($model, $childModel, $relation);
            }
        }
    }

    /**
     * Resource edit related list
     * 
     *  @author Mamun Hossen
     */
    public function contactEditRelatedData($model)
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
                    'owner'
                ]
            );

            $dependencyData = $this->getModelDependencies(CONTACT, $modelData, [USER, DATA_CATEGORY, DATA_DESIGNATION, SALUTATION, COUNTRY, STAGE, DATA_SOURCE, DATA_PRIORITY, DATA_RELATED_TYPE]);

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
            $model = $this->getSingleModel(modelOrId: $model, selects: ['id', 'nickname', 'created_at'])?->makeHidden($this->model->getAppends());
            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            ## Return formatted array
            return [
                ['label' => 'Contact name', 'value' => $model->nickname],
                ['label' => 'Contact created on', 'value' => _dateFormat($model->created_at, 'd M, Y')],
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
            $model = $this->getSingleModel(modelOrId: $model, with: ['associates', 'socials', 'tags', 'addresses', 'designations', 'contactables']);

            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);


            ## Base fields
            $data = $model->only([
                'id',
                'causer_id',
                'owner_id',
                'details',
                'dob',
                'first_name',
                'last_name',
                'nickname',
                'email',
                'mobile_number',
                'salutation',

            ]);

            ## Conditional assignments

            $data['associates'] = $model->associates ? $model->associates->pluck('id')->toArray() : [];
            $data['tags'] = $model->tags ? $model->tags->pluck('name')->toArray() : [];
            $data['social_links'] = $model->socials ? $model->socials->pluck('name')->toArray() : [];
            $addresses = $model->addresses ?? [];
            $data['contactable_id'] = $model->get_contactable_id ?? "";
            $data['data_designation_id'] = $model->get_designation->id ?? "";
            $data['salutation'] = $model->salutation ?? "";
            $data['nickname'] = $model->nickname ?? "";
            $data['is_active'] = true;
            $data['is_delete'] = true;

            $this->prepareEditAddressData($data, collect($addresses)->toArray());

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
            return $this->getDeleteDependencyData(CONTACT, $inputs);
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
            return $this->deleteDependency(CONTACT, $dependency);
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
                DB::raw("nickname as label")
            )
            ->when($searchText, function ($query, $searchText) {
                $query->where('nickname', 'like', "%{$searchText}%");
            })
            ->get()
            ->each
            ->setAppends([]);
    }

    public function getContactsLinkData($searchText = '')
    {
        try {

            return $this->getModelData(
                columns: ['id', 'nickname', 'created_at'],
                limit: 10,
                orderBy: 'created_at',
                orderType: 'DESC',
                searchText: $searchText
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


    public function addContactLink(array $inputs)
    {
        try {
            $relatedToId   = $inputs['related_to_id'] ?? null;
            $relatedToType = $inputs['related_to_type'] ?? null;
            $contactIds    = $inputs['contact_ids'] ?? null;

            if (empty($contactIds)) throw new Exception('Contact is empty !');

            $models = $this->model::whereIn('id', $contactIds)->get();

            if ($models->isEmpty()) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            if ($relatedToType && $relatedToId) {
                $relationMethods = [
                    PROJECT => 'projects',
                    ORGANIZATION => 'organizations',
                    OPPORTUNITY => 'opportunities',
                    LEAD => 'leads',
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

    public function contactUnlink($inputs)
    {
        try {
            $baseId = $inputs['base_id'] ?? null;
            $parentId = $inputs['parent_id'] ?? null;
            $relatedToType = $inputs['related_to_type'] ?? null;

            // dd($inputs);

            if (!$relatedToType) throw new Exception('Related to type is empty');
            if (!$baseId) throw new Exception('Base ID is empty');
            if (!$parentId) throw new Exception('Parent ID is empty');

            $relatedToTypes = [
                PROJECT,
                ORGANIZATION,
                OPPORTUNITY,
                LEAD,
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
                    'base_model' => Project::class
                ],
                ORGANIZATION => [
                    'model' => Organizationable::class,
                    'base_column' => 'organization_id',
                    'parent_column' => 'organizationable_id',
                    'base_model' => Organization::class
                ],
                OPPORTUNITY => [
                    'model' => Opportunityable::class,
                    'base_column' => 'opportunity_id',
                    'parent_column' => 'opportunityable_id',
                    'base_model' => Opportunity::class
                ],
                LEAD => [
                    'model' => Leadable::class,
                    'base_column' => 'lead_id',
                    'parent_column' => 'leadable_id',
                    'base_model' => Lead::class
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
