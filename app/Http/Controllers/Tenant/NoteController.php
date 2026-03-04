<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Throwable;
use Inertia\Inertia;
use App\Models\Tenant\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use App\Services\Tenant\NoteModelService;
use App\Http\Controllers\BaseTenantController;

/***
 * TaskController
 *
 * Handles tenant task-related operations such as storing tasks
 * and updating their stage or progress percentage.
 *
 * @package App\Http\Controllers\Tenant
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class NoteController extends BaseTenantController
{
    /***
     * TaskController constructor.
     *
     * Initializes the TaskModelService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TaskModelService $taskModelService
     */
    public function __construct(private readonly NoteModelService $noteModelService)
    {

        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->noteModelService->getRouteNames()
        );
    }

    public function index()
    {
       try {
            $taskList = $this->noteModelService->resourceList(request()->all());
            // return $taskList;

            return Inertia::render(
                'Tenant/Task/TaskListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'taskList' => $taskList,
                        'filterOptions' => request()->all(),
                    ]
                )
            );
       } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
       }   
    }

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
        // dd(request()->all());
        $validatedData = $this->noteModelService->doResourceValidation(request()->all());

        ## Assign owner id as associates
        if (request()->filled('associates')) {
            $validatedData['associates'] = [...request('associates'), request('owner_id')];
        }
        // dd($validatedData);

        try {
            $newModel = $this->noteModelService->doResourceStore($validatedData);

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

        try {
            $model = $this->noteModelService->changeStageAndProgressPercent($inputs);

            if (!$model) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => STATUS_CHANGE]
            ]);
        } catch (Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage()]
            ]);
        }
    }

    /**
     * Delete a note resource.
     *
     * Attempts to delete the given note by delegating to TaskModelService::deleteModelById().
     * On success, redirects back with a success toast message.
     * On failure, catches the exception and redirects back with an error toast message.
     *
     * @param  Note  $note  The note instance to delete
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception If the deletion fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function destroy(Note $note): RedirectResponse
    {
        try {
            if (!$this->noteModelService->deleteModelById($note)) {
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
    public function show(Note $note): JsonResponse
    {
        try {
            if (!$note) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            $isFormattedShort = request('isFormattedShort') ?? true;

            ## Fetch task with relational data using service
            $data = $isFormattedShort ? $this->noteModelService->getModelFormattedData($note) : $this->noteModelService->getModelFormattedDataAll($note);

            if (!$data || !is_array($data) || !count($data)) {
                throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Note details',
                'data'    => $data,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => $th->getMessage() ?: 'Note not found',
                'data'    => [],
            ], 404);
        }
    }

    /**
     * Update an existing note resource.
     *
     * Validates the request data, assigns associates (including the owner),
     * and delegates persistence to the TaskModelService.
     *
     * @param  int|string  $note  The note ID or identifier to update
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception  When the update process fails
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function update(int|string $note): RedirectResponse
    {
        ## Validate incoming data
        $validatedData = $this->noteModelService->doResourceValidation(request()->all());

        ## Assign owner as an associate if associates exist
        if (request()->filled('associates')) {
            $validatedData['associates'] = [
                ...request('associates'),
                request('owner_id'),
            ];
        }

        ## Attach note ID for update
        if (!empty($note)) {
            $validatedData['id'] = $note;
        }
        
        try {
            $updatedModel = $this->noteModelService->doResourceStore($validatedData);

            if (!$updatedModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return redirect()->back()->with([
                'toastResponse' => [
                    'type' => 'success',
                    'message' => UPDATE_MSG,
                ],
            ]);
        } catch (Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => [
                    'type' => 'error',
                    'message' => $th->getMessage(),
                ],
            ]);
        }
    }
}
