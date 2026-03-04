<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use App\Http\Controllers\BaseTenantController;
use App\Models\Tenant\Task;
use App\Services\Tenant\TaskModelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Throwable;

/***
 * TaskController
 *
 * Handles tenant task-related operations such as storing tasks
 * and updating their stage or progress percentage.
 *
 * @package App\Http\Controllers\Tenant
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class TaskController extends BaseTenantController
{
    /***
     * TaskController constructor.
     *
     * Initializes the TaskModelService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TaskModelService $taskModelService
     */
    public function __construct(private readonly TaskModelService $taskModelService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->taskModelService->getRouteNames()
        );
    }

    public function index()
    {
        _hasPermissionOrAbort('tasks-list');
        try {
            $taskList = $this->taskModelService->resourceList(request()->all());

            ## Load all required dropdown/preload dependencies. `fromActivity` ensures activity-based dependency filtering (if required)
            $dependencies = $this->taskModelService->getModelDependencies(fromActivity: TASK, neededData: [USER, DATA_CATEGORY, DATA_PRIORITY, DATA_RELATED_TYPE, STAGE]);

            return Inertia::render(
                'Tenant/Task/TaskListPage',
                array_merge(
                    $this->data,
                    $dependencies,

                    [
                        'tenant' => tenant('id'),
                        'taskList' => $taskList,
                        'filterOptions' => request()->all(),
                    ]
                )
            );
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error',  $th->getMessage());
        }
    }


    /**
     * Display the lead creation page with necessary dependencies.
     *
     * @return \Inertia\Response
     */
    // public function create(): \Inertia\Response
    // {
    //     dd('checking');
    //     _hasPermissionOrAbort('leads-create');

    //     return Inertia::render(
    //         'Tenant/Lead/LeadCreatePage',
    //         array_merge($this->data, $this->taskModelService->getModelDependencies())
    //     );
    // }

    /***
     * Store a new task resource.
     *
     * Validates the request data, assigns associates if provided,
     * then delegates storage to TaskModelService.
     *
     * @return RedirectResponse
     * @throws Exception When task creation fails
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function store(): RedirectResponse
    {

        $validatedData = $this->taskModelService->doResourceValidation(request()->all());
        // dd(request()->all());
        ## Assign owner id as associates
        if (request()->filled('associates')) {
            $validatedData['associates'] = [...request('associates'), request('owner_id')];
        }
        // dd($validatedData['associates']);

        try {
            $newModel = $this->taskModelService->doResourceStore($validatedData);

            if (!$newModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => INSERT_MSG]
            ]);
        } catch (Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage()]
            ]);
        }
    }

    /***
     * Change the stage and progress percentage of a task.
     *
     * Delegates the request data to TaskModelService::changeStageAndProgressPercent().
     * On success, redirects back with a success toast message.
     * On failure, catches the exception and redirects back with an error toast message.
     *
     * @return RedirectResponse
     * @throws Exception When the task stage/progress update fails
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function changeStageAndProgressPercent(): RedirectResponse
    {
        $inputs = request()->all();
        // dd(request()->all());

        try {
            $model = $this->taskModelService->changeStageAndProgressPercent($inputs);

            if (!$model) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Delete a task resource.
     *
     * Attempts to delete the given task by delegating to TaskModelService::deleteModelById().
     * On success, redirects back with a success toast message.
     * On failure, catches the exception and redirects back with an error toast message.
     *
     * @param  Task  $task  The task instance to delete
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception If the deletion fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function destroy(Task $task): RedirectResponse
    {
        try {
            if (!$this->taskModelService->deleteModelById($task)) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Display the specified task with relational data.
     *
     * Returns a JSON response containing task details if found.
     * On failure, returns a JSON error response.
     *
     * @param  \App\Models\Tenant\Task  $task  The task instance resolved via route model binding
     * @param  bool $isFormattedShort  Set and get what type of data structure this method returns 
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception If task retrieval fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    // : JsonResponse
    public function show(Task $task): JsonResponse
    {
        try {
            if (!$task) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            $isFormattedShort = request('isFormattedShort') ?? true;

            ## Fetch task with relational data using service
            $data = $isFormattedShort ? $this->taskModelService->getModelFormattedData($task) : $this->taskModelService->getModelFormattedDataAll($task);

            if (!$data || !is_array($data) || !count($data)) {
                throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Task details',
                'data'    => $data,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => $th->getMessage() ?: 'Task not found',
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
    public function edit($task)
    {
        _hasPermissionOrAbort('tasks-edit');
        ## Temporary maintenance placeholder
        try {
            $model = $this->taskModelService->taskEditRelatedData($task);
            // dd($model);
            return Inertia::render('Tenant/Task/TaskEditPage', [
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
    public function update($task): RedirectResponse
    {
        // dd($task, request()->all());
        ## Validate incoming data
        $validatedData = $this->taskModelService->doResourceValidation(request()->all());

        ## Assign owner as an associate if associates exist
        if (request()->filled('associates')) {
            $validatedData['associates'] = [
                ...request('associates'),
                request('owner_id'),
            ];
        }
        // dd($validatedData['associates']);

        ## Attach task ID for update
        if (!empty($task)) {
            $validatedData['id'] = $task;
        }
        // dd($validatedData);

        try {
            $updatedModel = $this->taskModelService->doResourceStore($validatedData);

            if (!$updatedModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
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
            $deleteData = $this->taskModelService->resourceDeleteDependencyData(request()->all());

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
            $this->taskModelService->resourceDeleteWithDependency(request()->all());
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
            $result = $this->taskModelService->getLabelValueFormattedList(request('search'));

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
     * Get the  sample data for a given model type.
     * 
     *@author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function resourceHandleSampleData()
    {
        try {
            // dd(request()->all());
            $sampleData = $this->taskModelService->handleModelSampleData(request()->all());
            if ($sampleData['sampleData']['action'] == 'get') {
                return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'sampleData' => $sampleData]]);
            }
            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (\Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }
}
