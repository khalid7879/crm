<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Throwable;
use Inertia\Inertia;
use App\Models\Tenant\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use App\Services\Tenant\TenantProjectService;
use App\Http\Controllers\BaseTenantController;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProjectController extends BaseTenantController
{
    /***
     * ProjectController constructor.
     *
     * Initializes the TenantProjectService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantProjectService $tenantProjectService
     */
    public function __construct(private TenantProjectService $tenantProjectService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantProjectService->getRouteNames()
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('projects-list');
        try {
            $dataList = $this->tenantProjectService->resourceList(request()->all());

            ## Load all required dropdown/preload dependencies. `fromActivity` ensures activity-based dependency filtering (if required)
            $dependencies = $this->tenantProjectService->getModelDependencies(
                fromActivity: PROJECT,
                neededData: [USER, DATA_CATEGORY, STAGE, TAG]
            );

            return Inertia::render(
                'Tenant/Project/ProjectListPage',
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
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
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
        $validatedData = $this->tenantProjectService
            ->doResourceValidation(request()->all());


        try {
            ## Assign owner id as associate if associates exist
            if (request()->filled('associates')) {
                $validatedData['associates'] = array_merge(
                    request('associates'),
                    [request('owner_id')]
                );
            }

            $newModel = $this->tenantProjectService
                ->doResourceStore($validatedData);


            if (!$newModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            ## Change stage to final step if applicable
            $stageChangeInputs = request()->input('finalStepInfos', []);
            if (!empty($stageChangeInputs) && count($stageChangeInputs)) {
                $this->tenantProjectService->doResourceChangeStage($stageChangeInputs);
                ## Redirect to opportunity details page after stage change          
                return redirect()->route($this->data['routeNames']['opportunityEdit'], ['tenant' => tenant('id'), 'opportunity' => $newModel]);
            }
            return _commonSuccessOrErrorMsg('success', INSERT_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Display the specified project with relational data.
     *
     * Returns a JSON response containing project details if found.
     * On failure, returns a JSON error response.
     *
     * @param  \App\Models\Tenant\Project  $project  The project instance resolved via route model binding
     * @param  bool $isFormattedShort  Set and get what type of data structure this method returns 
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception If project retrieval fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    // : JsonResponse
    public function show(Project $project): JsonResponse
    {
        try {
            if (!$project) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            $isFormattedShort = request('isFormattedShort') ?? true;

            ## Fetch task with relational data using service
            $data = $isFormattedShort ? $this->tenantProjectService->getModelFormattedData($project) : $this->tenantProjectService->getModelFormattedDataAll($project);

            if (!$data || !is_array($data) || !count($data)) {
                throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Project details',
                'data'    => $data,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => $th->getMessage() ?: 'Project not found',
                'data'    => [],
            ], 404);
        }
    }



    public function edit($project)
    {
        _hasPermissionOrAbort('projects-edit');
        ## Temporary maintenance placeholder

        try {
            $model = $this->tenantProjectService->projectEditRelatedData($project);
            // dd($model);
            return Inertia::render('Tenant/Project/ProjectEditPage', [
                ...$this->data,
                'tenant' => tenant('id'),
                ...$model,
                // 'model' => $model,

            ]);
        } catch (ModelNotFoundException $th) {
            ## Redirect back with a user-friendly flash message
            return redirect()->route($this->data['routeNames']['opportunityList'], tenant('id'))->with([
                'toastResponse' => ['type' => 'error', 'message' => PROJECT_NOT_FOUND]
            ]);
        }
    }

    /**
     * Update an existing task resource.
     *
     * Validates the request data, assigns associates (including the owner),
     * and delegates persistence to the TaskModelService.
     *
     * @param  int|string  $task  The task ID or identifier to update
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception  When the update process fails
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function update($project): RedirectResponse
    {
        // dd($project, request()->all());
        ## Validate incoming data
        $validatedData = $this->tenantProjectService->doResourceValidation(request()->all());

        ## Assign owner as an associate if associates exist
        if (request()->filled('associates')) {
            $validatedData['associates'] = [
                ...request('associates'),
                request('owner_id'),
            ];
        }
        // dd($validatedData['associates']);

        ## Attach task ID for update
        if (!empty($project)) {
            $validatedData['id'] = $project;
        }
        // dd($validatedData);

        try {
            $updatedModel = $this->tenantProjectService->doResourceStore($validatedData);

            if (!$updatedModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Delete a project resource.
     *
     * Attempts to delete the given project by delegating to TaskModelService::deleteModelById().
     * On success, redirects back with a success toast message.
     * On failure, catches the exception and redirects back with an error toast message.
     *
     * @param  Project  $project  The project instance to delete
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception If the deletion fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function destroy(Project $project): RedirectResponse
    {
        try {
            if (!$this->tenantProjectService->deleteModelById($project)) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
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
            $this->tenantProjectService->doResourceChangeStage(request()->all());
            if (!request()->details) {
                return redirect($previousUrl)->with([
                    'toastResponse' => ['type' => 'success', 'message' => STATUS_CHANGE]
                ]);
            }
        } catch (Throwable $th) {
            return redirect($previousUrl)->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage()]
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
            $deleteData = $this->tenantProjectService->resourceDeleteDependencyData(request()->all());

            return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'deleteData' => $deleteData]]);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Delete a resource (e.g., Project, Organization, Opportunity) and its dependencies.
     * * @author Mamun Hossen
     */
    public function resourceDeleteWithDependency(){
        try {
            // dd(request()->all());
            $this->tenantProjectService->resourceDeleteWithDependency(request()->all());
            return _commonSuccessOrErrorMsg('success',DELETE_MSG);
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
            $result = $this->tenantProjectService->getLabelValueFormattedList(request('search'));

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
            $sampleData = $this->tenantProjectService->handleModelSampleData(request()->all());
            if ($sampleData['sampleData']['action'] == 'get') {
                return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'sampleData' => $sampleData]]);
            }
            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Fetch project link data with optional search filtering.
     *
     * This method retrieves project link data by delegating the request
     * to the tenantProjectService. A search keyword may be passed via
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
    public function projectsLinkData()
    {
        try {
            $result = $this->tenantProjectService->getProjectsLinkData(request('search'));

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
     * Link a project to a lead, opportunity, organization.
     *
     * This method accepts request data and delegates the project-linking
     * process to the ContactModelService. It supports linking projects
     * with different entity types such as leads, opportunities,
     * organizations.
     *
     * On successful linking, a common success response is returned.
     * If the operation fails or an exception occurs, a common error
     * response is returned.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     *
     * @throws \Throwable
     */
    public function addProjectsLink()
    {
        try {
            $result = $this->tenantProjectService->addProjectsLink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Projects linked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Unlink a project from a lead, opportunity, organization.
     *
     * This method removes an existing association between a project
     * and a related entity such as a lead, opportunity, organization,
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
    public function projectUnlink()
    {
        try {
            $result = $this->tenantProjectService->projectUnlink(request()->all());

            if (!$result) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', 'Project unlinked successfully');
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }
}
