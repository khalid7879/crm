<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Throwable;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use App\Models\Tenant\Opportunity;
use Illuminate\Http\RedirectResponse;
use App\Services\Tenant\TenantLeadService;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\TenantOpportunityService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * OpportunityController
 * 
 * Handles tenant opportunity resource operations such as listing, editing, and managing opportunity stages.
 * 
 * @param \App\Services\Tenant\TenantOpportunityService $opportunityModelService
 * @param \App\Services\Tenant\TenantLeadService $leadModelService
 * @author Mamun Hossen
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com> (edit)
 */
class OpportunityController extends BaseTenantController
{
    /**
     * Constructor
     * 
     * @param TenantOpportunityService $opportunityModelService
     */
    public function __construct(private TenantOpportunityService $opportunityModelService, private TenantLeadService $leadModelService,)
    {
        parent::__construct();
        ## Merge route names with parent controller data
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->opportunityModelService->getRouteNames()
        );
    }

    /**
     * Display a listing of the opportunities
     *
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse
     * 
     * @author Mamun Hossen
     */
    public function index()
    {
        _hasPermissionOrAbort('opportunities-list');
        try {

            ## Fetch filtered/paginated opportunity list based on request query params
            $dataList = $this->opportunityModelService->resourceList(request()->all());

            ## Load all required dropdown/preload dependencies. `fromActivity` ensures activity-based dependency filtering (if required)
            $dependencies = $this->opportunityModelService->getModelDependencies(
                fromActivity: OPPORTUNITY,
                neededData: [
                    USER,
                    DATA_CATEGORY,
                    DATA_PRIORITY,
                    DATA_REVENUE,
                    DATA_SOURCE,
                    STAGE,
                    CURRENCY,
                    ORGANIZATION
                ]
            );

            ## Return inertia response injecting tenant id, fetched list & filters for persistence
            return Inertia::render('Tenant/Opportunity/OpportunityListPage', array_merge(
                $this->data,
                $dependencies,
                [
                    'tenant'        => tenant('id'),
                    'dataList'      => $dataList,
                    'filterOptions' => request()->all(),
                ]
            ));
        } catch (Throwable $th) {
            ## Return standard formatted error response
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * Store a newly created Opportunity resource.
     *
     * This method validates the incoming request data, creates a new Opportunity record,
     * attaches associates (including the owner), and optionally changes the stage to 
     * the final step if `finalStepInfos` is provided.
     *
     * @return \Illuminate\Http\RedirectResponse
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function store()
    {
        // dd(request()->all());
        $validatedData = $this->opportunityModelService
            ->doResourceValidation(request()->all());


        try {
            ## Assign owner id as associate if associates exist
            if (request()->filled('associates')) {
                $validatedData['associates'] = array_merge(
                    request('associates'),
                    [request('owner_id')]
                );
            }

            $newModel = $this->opportunityModelService
                ->doResourceStore($validatedData);


            if (!$newModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }


            if (!empty(request('opportunityable_id')) && empty(request('finalStepInfos'))) {
                return _commonSuccessOrErrorMsg('success', INSERT_MSG);
            }
            return redirect()->route($this->data['routeNames']['opportunityEdit'], ['tenant' => tenant('id'), 'opportunity' => $newModel]);

            // return _commonSuccessOrErrorMsg('success', INSERT_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Display the specified opportunity with relational data.
     *
     * Returns a JSON response containing task details if found.
     * On failure, returns a JSON error response.
     *
     * @param  \App\Models\Tenant\Opportunity  $opportunity  The opportunity instance resolved via route model binding
     * @param  bool $isFormattedShort  Set and get what type of data structure this method returns 
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception If task retrieval fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    // : JsonResponse
    public function show(Opportunity $opportunity)
    {
        try {
            if (!$opportunity) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            $isFormattedShort = request('isFormattedShort') ?? true;

            ## Fetch task with relational data using service
            $data = $isFormattedShort ? $this->opportunityModelService->getModelFormattedData($opportunity) : $this->opportunityModelService->getModelFormattedDataAll($opportunity);

            if (!$data || !is_array($data) || !count($data)) {
                throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Opportunity details',
                'data'    => $data,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => $th->getMessage() ?: 'Opportunity not found',
                'data'    => [],
            ], 404);
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
    public function edit($opportunity)
    {
        _hasPermissionOrAbort('opportunities-edit');
        ## Temporary maintenance placeholder
        try {
            $model = $this->opportunityModelService->opportunityEditRelatedData($opportunity);
            return Inertia::render('Tenant/Opportunity/OpportunityEditPage', [
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
     * Change the stage of a lead resource.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function resourceChangeStage()
    {
        $previousUrl = url()->previous();

        try {
            $this->opportunityModelService->doResourceChangeStage(request()->all());

            return redirect($previousUrl)->with([
                'toastResponse' => ['type' => 'success', 'message' => STATUS_CHANGE]
            ]);
        } catch (Throwable $th) {
            return redirect($previousUrl)->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage()]
            ]);
        }
    }

    /**
     * Update an existing oppor$opportunity resource.
     *
     * Validates the request data, assigns associates (including the owner),
     * and delegates persistence to the OrganizationModelService.
     *
     * @param  int|string  $opportunity  The oppor$opportunity ID or identifier to update
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception  When the update process fails
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function update($opportunity): RedirectResponse
    {
        // dd($opportunity, request()->all());
        ## Validate incoming data
        $validatedData = $this->opportunityModelService->doResourceValidation(request()->all());

        ## Assign owner as an associate if associates exist
        if (request()->filled('associates')) {
            $validatedData['associates'] = [
                ...request('associates'),
                request('owner_id'),
            ];
        }
        // dd($validatedData);

        ## Attach opportunity ID for update
        if (!empty($opportunity)) {
            $validatedData['id'] = $opportunity;
        }
        // dd($validatedData);

        try {
            $updatedModel = $this->opportunityModelService->doResourceStore($validatedData);

            if (!$updatedModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Delete a opportunity resource.
     *
     * Attempts to delete the given opportunity by delegating to TaskModelService::deleteModelById().
     * On success, redirects back with a success toast message.
     * On failure, catches the exception and redirects back with an error toast message.
     *
     * @param  Opportunity  $opportunity  The opportunity instance to delete
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception If the deletion fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function destroy(Opportunity $opportunity): RedirectResponse
    {
        try {
            if (!$this->opportunityModelService->deleteModelById($opportunity)) {
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
            $deleteData = $this->opportunityModelService->resourceDeleteDependencyData(request()->all());

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
            $this->opportunityModelService->resourceDeleteWithDependency(request()->all());
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
            $result = $this->opportunityModelService->getLabelValueFormattedList(request('search'));

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
            $sampleData = $this->opportunityModelService->handleModelSampleData(request()->all());
            if ($sampleData['sampleData']['action'] == 'get') {
                return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'sampleData' => $sampleData]]);
            }
            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Fetch opportunity link data with optional search filtering.
     *
     * This method retrieves opportunity link data by delegating the request
     * to the ContactModelService. A search keyword may be passed via
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
    public function opportunityLinkData()
    {
        try {
            $result = $this->opportunityModelService->getOpportunityLinkData(request('search'));

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
     * Link a opportunity to a lead, opportunity, organization, or project.
     *
     * This method accepts request data and delegates the opportunity-linking
     * process to the ContactModelService. It supports linking opportunities
     * with different entity types such as leads, opportunities,
     * organizations, and projects.
     *
     * On successful linking, a common success response is returned.
     * If the operation fails or an exception occurs, a common error
     * response is returned.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function addOpportunityLink()
    {
        try {
            $result = $this->opportunityModelService->addOpportunityLink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Opportunity linked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Unlink a opportunity from a lead, opportunity, organization, or project.
     *
     * This method removes an existing association between a opportunity
     * and a related entity such as a lead, opportunity, organization,
     * or project. The unlinking logic is handled by the TenantOpportunityService
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
    public function opportunityUnlink()
    {
        try {
            $result = $this->opportunityModelService->opportunityUnlink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Opportunity Unlinked Successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }
}
