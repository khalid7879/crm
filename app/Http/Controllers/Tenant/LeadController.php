<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Throwable;
use Inertia\Response;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\TenantLeadService;
use App\Services\Tenant\TenantDataDesignationService;
use App\Services\Tenant\TenantIndustryTypeService;
use App\Services\Tenant\TenantLeadRatingService;
use App\Services\Tenant\TenantLeadSourceService;
use App\Services\Tenant\TenantLeadStageService;
use App\Services\Tenant\TenantUserService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Lead resource management for tenants.
 * Handles CRUD operations, stage changes, and formatted label-value lists.
 * 
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class LeadController extends BaseTenantController
{
    public function __construct(
        private TenantLeadService $leadModelService,
        private TenantDataDesignationService $dataDesignationService,
        private TenantLeadStageService $dataStage,
        private TenantIndustryTypeService $dataCategory,
        private TenantLeadSourceService $dataSource,
        private TenantLeadRatingService $dataRating,
        private TenantUserService $tenantUserService
    ) {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            [
                'leadsList'                     => 'tenant.leads.index',
                'leadsCreate'                   => 'tenant.leads.create',
                'leadsStore'                    => 'tenant.leads.store',
                'leadsEdit'                     => 'tenant.leads.edit',
                'leadsUpdate'                   => 'tenant.leads.update',
                'leadsDelete'                   => 'tenant.leads.destroy',
                'leadsChangeStage'              => 'tenant.leads.change.stage',
                'leadsLinkData'                 => 'tenant.leads.link.data',
                'addLeadsLink'                  => 'tenant.leads.add.link',
                'leadsUnLink'                   => 'tenant.leads.unlink',
                'tasksStore'                    => 'tenant.tasks.store',
                'tasksDelete'                   => 'tenant.tasks.destroy',
                'tasksShow'                     => 'tenant.tasks.show',
                'tasksChangeStage'              => 'tenant.tasks.changeStageAndProgressPercent',
                'tasksUpdate'                   => 'tenant.tasks.update',
                'taskHistoryData'               => 'tenant.tasks-history.data',
                'contactsShow'                  => 'tenant.contacts.show',
                'contactsUpdate'                => 'tenant.contacts.update',
                'contactsDelete'                => 'tenant.contacts.destroy',
                'contactsLinkData'              => 'tenant.contacts.link.data',
                'addContactLink'                => 'tenant.contacts.add.link',
                'contactUnLink'                 => 'tenant.contacts.unlink',
                'opportunityStore'              => 'tenant.opportunity.store',
                'opportunityUpdate'             => 'tenant.opportunity.update',
                'opportunityShow'               => 'tenant.opportunity.show',
                'opportunityDelete'             => 'tenant.opportunity.destroy',
                'opportunityLinkData'           => 'tenant.opportunity.link.data',
                'addOpportunityLink'            => 'tenant.opportunity.add.link',
                'opportunityUnLink'             => 'tenant.opportunity.unlink',
                'projectsLinkData'              => 'tenant.projects.link.data',
                'addProjectsLink'               => 'tenant.projects.add.link',
                'projectUnLink'                 => 'tenant.projects.unlink',
                'organizationUpdate'            => 'tenant.organization.update',
                'organizationShow'              => 'tenant.organization.show',
                'organizationDelete'            => 'tenant.organization.destroy',
                'organizationsLinkData'         => 'tenant.organization.link.data',
                'addOrganizationsLink'          => 'tenant.organization.add.link',
                'organizationUnLink'            => 'tenant.organization.unlink',
                'projectsDelete'                => 'tenant.projects.destroy',
                'projectsUpdate'                => 'tenant.projects.update',
                'projectsShow'                  => 'tenant.projects.show',
                'productsShow'                  => 'tenant.products.show',
                'productsLinkData'              => 'tenant.products.link.data',
                'addProductsLink'               => 'tenant.products.add.link',
                'productsUnLink'                => 'tenant.products.unlink',
                'handleSampleData'              => 'tenant.leads.handle.sample.data',
                'getLabelValueFormattedList'    => 'tenant.leads.getLabelValueFormattedList',
                'dataRelatedRoutes'             => [
                    'LEAD'                      => 'tenant.leads.getLabelValueFormattedList',
                    'PROJECT'                   => 'tenant.leads.getLabelValueFormattedList',
                    'OPPORTUNITY'               => 'tenant.leads.getLabelValueFormattedList',
                    'CONTACT'                   => 'tenant.leads.getLabelValueFormattedList',
                ],
                'notesStore'             => 'tenant.notes.store',
                'notesUpdate'            => 'tenant.notes.update',
                'notesShow'              => 'tenant.notes.show',
                'notesDelete'            => 'tenant.notes.destroy',
                'leadsWiseDependency' => 'tenant.leads.wise.dependency',
                'leadsDeleteWithDependency' => 'tenant.leads.delete.with.dependency',
            ]
        );
    }

    /**
     * Display the lead creation page with necessary dependencies.
     *
     * @return \Inertia\Response
     */
    public function create(): \Inertia\Response
    {
        _hasPermissionOrAbort('leads-create');

        return Inertia::render(
            'Tenant/Lead/LeadCreatePage',
            array_merge($this->data, $this->leadModelService->getModelDependencies())
        );
    }

    /**
     * Store data
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store()
    {

        try {
            $validatedData = $this->leadModelService->doResourceValidation(request()->all());

            // dd($validatedData);

            ## Format social links
            if (request()->filled('social_links')) {
                $validatedData['social_links'] = $this->leadModelService
                    ->removeEmptyValuesToStore(request('social_links'));
            }

            ## Combine associates and owner
            if (request()->filled('associates') || request()->filled('owner_id')) {
                $validatedData['associates'] = array_filter([
                    ...request('associates', []),
                    request('owner_id')
                ]);
            }

            $newModel = $this->leadModelService->doResourceStore($validatedData);

            if (!$newModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }
            return redirect()->route(
                $this->data['routeNames']['leadsEdit'],
                [tenant('id'), $newModel->id]
            );
        } catch (Throwable $th) {
            return back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage()]
            ]);
        }
    }

    /**
     * Display a paginated and filterable list of tenant lead resources.
     *
     * This method validates permissions, collects filter options from the request,
     * retrieves the filtered lead list using the LeadModelService, and returns
     * the Inertia LeadListPage view. Any unexpected exception is gracefully handled
     * and returned as a standard error response.
     *
     * @return \Inertia\Response|\Inertia\ResponseFactory|\Illuminate\Http\JsonResponse
     * 
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function index(): mixed
    {
        _hasPermissionOrAbort('leads-list');

        try {
            ## Collect only relevant filters (avoid sending unnecessary request data)
            $filterOptions = request()->except(['_token', '_method']);

            ## Retrieve filtered lead list
            $dataList = $this->leadModelService
                ->resourceList($filterOptions)
                ->toArray();
                // ->toArray();

            ## Render the Inertia component with required data
            return Inertia::render('Tenant/Lead/LeadListPage', array_merge(
                $this->data,
                [
                    'tenant'        => tenant('id'),
                    'dataList'      => $dataList,
                    'filterOptions' => $filterOptions,
                ]
            ));
        } catch (Throwable $th) {
            ## Return unified error response
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Delete a lead resource.
     *
     * @param  int|string  $leadPriority
     * @return mixed
     */
    public function destroy($leadPriority)
    {
        _hasPermissionOrAbort('leads-delete');

        // return $this->leadModelService->doLeadPriorityDelete($leadPriority);
    }

    /**
     * Display the lead edit page.
     *
     * Loads a single lead model along with all related data required for editing.
     * If the model is not found, redirects back with a flash error message.
     *
     * @param  int|string  $lead  The lead ID or ULID.
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function edit($lead): Response|\Illuminate\Http\RedirectResponse
    {
        _hasPermissionOrAbort('leads-edit');

        try {
            ## Fetch the lead with all required relationships
            $model = $this->leadModelService->getSingleModel($lead, [
                'sources',
                'priorities',
                'associates.userReference',
                'notes.causer',
                'tags',
                'organizations.owner',
                'ratings',
                'categories',
                'designations',
                'stages',
                'tasks.causer',
                'tasks.stages',
                'tasks.categories',
                'tasks.associates',
                'tasks.priorities',
                'socials',
                'employeeSizes',
                'preferableTimes',
                'owner',
                'aiAnalysis',
                'contacts.owner',
                'opportunities.owner',
                'opportunities.stages',
                'projects.owner',
                'projects.stages',
                'organizations.contacts',
                'products'
            ]);

            $model['tasks_report'] = $this->leadModelService->groupTasksByProgress($model->tasks);

            $model['note_report'] =  $model->notes?->sortByDesc('created_at')->values()->all();
            $model['contacts_report'] =  $model->contacts?->sortByDesc('created_at')->values()->all();
            $model['opportunities_report'] =  $model->opportunities?->sortByDesc('created_at')->values()->all();
            $model['organizations_report'] =  $model->organizations?->sortByDesc('created_at')->values()->all();
            $model['projects_report'] =  $model->projects?->sortByDesc('created_at')->values()->all();
            $model['products_report'] = $model->products
                ?->sortByDesc('pivot_created_at')
                ->values()
                ->map(fn($product) => [
                    'id'            => $product->id,
                    'name'          => $product->name,
                    'price'         => $product->price,
                    'face_value'    => $product->pivot->face_value,
                    'customized_value'  => $product->pivot->customized_value,
                    'attached_at'   => $product->pivot->created_at,
                ])
                ->all();

            $model['organizations_contacts_report'] = $model->organizations
                ->flatMap(function ($organization) {
                    return $organization->contacts->map(function ($contact) use ($organization) {
                        $contact->organization_id = $organization->id;
                        $contact->organization_name = $organization->name;
                        return $contact;
                    });
                })
                ->sortByDesc('created_at')
                ->values();

            ## Load pivot causer data for stages
            // $stageables = $model->stages->map->pivot;
            // $stageables->load('causer');

            // dd($this->dataStage->getModelStages($model?->stages->toArray()));

            ## Render Inertia page with dependencies
            return Inertia::render('Tenant/Lead/LeadEditPage', [
                ...$this->data,
                'tenant'      => tenant('id'),
                'modelStages' => $this->dataStage->getModelStages($model?->stages->toArray()),
                'model'       => $model,
                ...$this->leadModelService->getModelDependencies($model),
            ]);
        } catch (ModelNotFoundException $e) {
            ## Redirect back with a user-friendly flash message
            return redirect()->route($this->data['routeNames']['leadsList'], tenant('id'))->with([
                'toastResponse' => ['type' => 'error', 'message' => LEAD_NOT_FOUND]
            ]);
        }
    }


    /**
     * Update the specified lead resource.
     *
     * This method validates and updates an existing lead record.
     * It merges the owner and associates, sanitizes social link data,
     * and stores the updated information via the lead model service.
     *
     * @param  int|string  $lead  The lead ID or ULID to update.
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws Throwable If the update process fails.
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function update($lead)
    {
        _hasPermissionOrAbort('leads-edit');

        $validatedData = $this->leadModelService->doResourceValidation(request()->all());

        ## Handle Associates & Owner 
        if (request()->filled('owner_id') || request()->filled('associates')) {
            $associates = (array) request('associates', []);
            $ownerId = request('owner_id');

            ## Avoid duplicates if owner already exists in associates
            if ($ownerId && !in_array($ownerId, $associates, true)) {
                $associates[] = $ownerId;
            }

            $validatedData['associates'] = $associates;
        }

        ## Sanitize Social Links 
        if (request()->filled('social_links')) {
            $validatedData['social_links'] = $this->leadModelService
                ->removeEmptyValuesToStore(request('social_links'));
        }

        try {
            $updatedModel = $this->leadModelService->doResourceStore($validatedData);

            if (!$updatedModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return back()->with([
                'toastResponse' => [
                    'type' => 'success',
                    'message' => UPDATE_MSG,
                ],
            ]);
        } catch (Throwable $th) {
            return back()->with([
                'toastResponse' => [
                    'type' => 'error',
                    'message' => $th->getMessage(),
                ],
            ]);
        }
    }


    /**
     * Change the stage of a lead resource.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function resourceChangeStage()
    {
        $previousUrl = url()->previous();

        try {
            $this->leadModelService->doResourceChangeStage(request()->all());

            // return redirect($previousUrl)->with([
            //     'toastResponse' => ['type' => 'success', 'message' => STATUS_CHANGE]
            // ]);
        } catch (Throwable $th) {
            return redirect($previousUrl)->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage()]
            ]);
        }
    }

    /**
     * Get a list of leads formatted as label-value pairs for UI selection.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLabelValueFormattedList(): JsonResponse
    {
        try {
            $result = $this->leadModelService->getLabelValueFormattedList(request('search'));

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'message' => '',
                'data'    => $result
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'code'    => 404,
                'message' => $th->getMessage(),
                'data'    => []
            ]);
        }
    }

    /**
     * Retrieve dependency information for a given resource before deletion.
     * * @author Mamun Hossen
     */
    public function resourceDeleteDependencyData()
    {
        try {
            $deleteData = $this->leadModelService->resourceDeleteDependencyData(request()->all());

            return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'deleteData' => $deleteData]]);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Delete a resource (e.g., Project, Organization, Opportunity) and its dependencies.
     * * @author Mamun Hossen
     */
    public function resourceDeleteWithDependency()
    {
        try {
            // dd(request()->all());
            $this->leadModelService->resourceDeleteWithDependency(request()->all());
            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Get the  sample data for a given model type.
     * 
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function resourceHandleSampleData()
    {
        try {
            // dd(request()->all());
            $sampleData = $this->leadModelService->handleModelSampleData(request()->all());
            if ($sampleData['sampleData']['action'] == 'get') {
                return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'sampleData' => $sampleData]]);
            }
            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Retrieve lead link data with optional search filtering.
     *
     * This method fetches lead records that can be linked to other
     * entities. A search keyword may be provided via the request
     * to filter the lead list.
     *
     * On success, a JSON response containing the lead data is returned.
     * If an exception occurs, a common error toast/message response
     * is returned.
     *
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function leadsLinkData()
    {
        try {
            $result = $this->leadModelService->getLeadsLinkData(request('search'));

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'data'    => $result,
            ]);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Link a lead to another entity.
     *
     * This method handles linking a lead with a related entity
     * (such as a contact, opportunity, organization, or project)
     * using the provided request data. The business logic is
     * delegated to the LeadModelService.
     *
     * A toast alert message is returned to indicate whether the
     * linking operation was successful or failed.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function addLeadsLink()
    {
        try {
            $result = $this->leadModelService->addLeadsLink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Lead linked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Unlink a lead from a related entity.
     *
     * This method removes an existing association between a lead
     * and another entity (such as a contact, opportunity, organization,
     * or project). The unlinking logic is handled by the LeadModelService
     * using the provided request data.
     *
     * A toast alert message is returned to indicate whether the
     * unlinking operation was successful or failed.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function leadsUnlink()
    {
        try {
            $result = $this->leadModelService->leadsUnlink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Lead unlinked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }
}
