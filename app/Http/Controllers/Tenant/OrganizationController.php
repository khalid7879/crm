<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Throwable;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use App\Models\Tenant\Organization;
use Illuminate\Http\RedirectResponse;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\OrganizationModelService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class OrganizationController extends BaseTenantController
{
    /**
     * Constructor
     * Organization Service Injection
     */
    public function __construct(private OrganizationModelService $organizationModelService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->organizationModelService->getRouteNames()
        );
    }


    /**
     * Resource list
     * 
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('organization-list');

        $dataList =  $this->organizationModelService->resourceList(request()->all());

        ## Load all required dropdown/preload dependencies. `fromActivity` ensures activity-based dependency filtering (if required)
        $dependencies = $this->organizationModelService->getModelDependencies(fromActivity: ORGANIZATION, neededData: [USER, TAG, SOCIAL_LINK, COUNTRY]);
        // dd($dependencies);

        return Inertia::render(
            'Tenant/Organization/OrganizationListPage',
            array_merge(
                $this->data,
                $dependencies,
                [
                    'tenant' => tenant('id'),
                    'dataList' => $dataList,
                    'filterOptions' => request()->all(),
                ]
            )
        );
    }

    /**
     * Store a newly created organization resource.
     *
     * This method validates the incoming request data, creates a new organization record,
     * attaches associates (including the owner), and optionally changes the stage to 
     * 
     *
     * @return \Illuminate\Http\RedirectResponse
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function store()
    {
        $validatedData = $this->organizationModelService
        ->doResourceValidation(request()->all());
        // dd($validatedData);

        ## Format social links
        if (request()->filled('social_links')) {
            $validatedData['social_links'] = $this->organizationModelService
                ->removeEmptyValuesToStore(request('social_links'));
        }
        try {
            ## Assign owner id as associate if associates exist
            if (request()->filled('associates')) {
                $validatedData['associates'] = array_merge(
                    request('associates'),
                    [request('owner_id')]
                );
            }

            $newModel = $this->organizationModelService
                ->doResourceStore($validatedData);


            if (!$newModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * get cities by country id
     * 
     *  @author Mamun Hossen
     */
    public function citiesByCountryId()
    {
        try {
            $dataList = $this->organizationModelService->getCitiesByCountryId(request()->all());

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'cities' => $dataList]
            ]);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Show the form for editing the specified opportunity.
     *
     * @param  string|int  $opportunity
     * @return string|\Inertia\Response
     * 
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function edit($organization)
    {
        _hasPermissionOrAbort('organization-edit');
        ## Temporary maintenance placeholder
        try {
            $model = $this->organizationModelService->organizationEditRelatedData($organization);
            return Inertia::render('Tenant/Organization/OrganizationEditPage', [
                ...$this->data,
                'tenant' => tenant('id'),
                ...$model,

            ]);
        } catch (ModelNotFoundException $th) {
            ## Redirect back with a user-friendly flash message
            return redirect()->route($this->data['routeNames']['opportunityList'], tenant('id'))->with([
                'toastResponse' => ['type' => 'error', 'message' => OPPORTUNITY_NOT_FOUND]
            ]);
        }
    }

    /**
     * Display the specified organization with relational data.
     *
     * Returns a JSON response containing task details if found.
     * On failure, returns a JSON error response.
     *
     * @param  \App\Models\Tenant\Organization  $organization  The organization instance resolved via route model binding
     * @param  bool $isFormattedShort  Set and get what type of data structure this method returns 
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception If task retrieval fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    // : JsonResponse
    public function show(Organization $organization)
    {
        try {
            if (!$organization) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            $isFormattedShort = request('isFormattedShort') ?? true;

            ## Fetch task with relational data using service
            $data = $isFormattedShort ? $this->organizationModelService->getModelFormattedData($organization) : $this->organizationModelService->getModelFormattedDataAll($organization);

            if (!$data || !is_array($data) || !count($data)) {
                throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Organization details',
                'data'    => $data,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => $th->getMessage() ?: 'Organization not found',
                'data'    => [],
            ], 404);
        }
    }

    /**
     * Update an existing organization resource.
     *
     * Validates the request data, assigns associates (including the owner),
     * and delegates persistence to the OrganizationModelService.
     *
     * @param  int|string  $organization  The organization ID or identifier to update
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception  When the update process fails
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function update($organization): RedirectResponse
    {
        // dd($organization, request()->all());
        ## Validate incoming data
        $validatedData = $this->organizationModelService->doResourceValidation(request()->all());

        ## Format social links
        if (request()->filled('social_links')) {
            $validatedData['social_links'] = $this->organizationModelService
                ->removeEmptyValuesToStore(request('social_links'));
        }

        ## Assign owner as an associate if associates exist
        if (request()->filled('associates')) {
            $validatedData['associates'] = [
                ...request('associates'),
                request('owner_id'),
            ];
        }
        // dd($validatedData['associates']);

        ## Attach organization ID for update
        if (!empty($organization)) {
            $validatedData['id'] = $organization;
        }
        // dd($validatedData);

        try {
            $updatedModel = $this->organizationModelService->doResourceStore($validatedData);

            if (!$updatedModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Delete a organization resource.
     *
     * Attempts to delete the given organization by delegating to TaskModelService::deleteModelById().
     * On success, redirects back with a success toast message.
     * On failure, catches the exception and redirects back with an error toast message.
     *
     * @param  Organization  $organization  The organization instance to delete
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception If the deletion fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function destroy(Organization $organization): RedirectResponse
    {
        try {
            if (!$this->organizationModelService->deleteModelById($organization)) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Retrieve dependency information for a given resource before deletion.
     * * @author Mamun Hossen
     */
    public function resourceDeleteDependencyData()
    {
        try {
            $deleteData = $this->organizationModelService->resourceDeleteDependencyData(request()->all());

            return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'deleteData' => $deleteData]]);
        } catch (\Throwable $th) {
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
            $this->organizationModelService->resourceDeleteWithDependency(request()->all());
            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
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
            $result = $this->organizationModelService->getLabelValueFormattedList(request('search'));

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'message' => 'mmm',
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
     * Get the  sample data for a given model type.
     * 
     *@author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function resourceHandleSampleData()
    {
        try {
            // dd(request()->all());
            $sampleData = $this->organizationModelService->handleModelSampleData(request()->all());
            if ($sampleData['sampleData']['action'] == 'get') {
                return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'sampleData' => $sampleData]]);
            }
            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Fetch Organization link data with optional search filtering.
     *
     * This method retrieves organization link data by delegating the request
     * to the organizationModelService. A search keyword may be passed via
     * the request to filter the results.
     *
     * On success, it returns a standardized JSON response containing
     * the fetched data. If any exception occurs, a common error response
     * is returned.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Throwable
     */
    public function organizationsLinkData()
    {
        try {
            $result = $this->organizationModelService->getOrganizationsLinkData(request('search'));

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
     * Link a organization to a lead, opportunity, project.
     *
     * This method accepts request data and delegates the project-linking
     * process to the organizationModelService. It supports linking organizations
     * with different entity types such as leads, opportunities,
     * projects.
     *
     * On successful linking, a common success response is returned.
     * If the operation fails or an exception occurs, a common error
     * response is returned.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function addOrganizationsLink()
    {
        try {
            $result = $this->organizationModelService->addOrganizationsLink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Organizations linked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Unlink a organization from a lead, opportunity, organization.
     *
     * This method removes an existing association between a organization
     * and a related entity such as a lead, opportunity, project,
     * The unlinking logic is handled by the TenantProjectService
     * using the provided request data.
     *
     * On successful unlinking, a common success response is returned.
     * If the operation fails or an exception occurs, a common error
     * response is returned.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function organizationUnlink()
    {
        try {
            $result = $this->organizationModelService->organizationUnlink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Organization unlinked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }
}
