<?php

namespace App\Http\Controllers\Tenant;


use Exception;
use Throwable;
use App\Models\Tenant\Attachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\AttachmentModelService;

class AttachmentController extends BaseTenantController
{
    /***
     * AttachmentController constructor.
     *
     * Initializes the AttachmentModelService and merges its route names
     * into the controller's routeNames array.
     *
     * @param AttachmentModelService $attachmentModelService
     */
    public function __construct(private AttachmentModelService $attachmentModelService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->attachmentModelService->getRouteNames()
        );
    }

    public function store()
    {
        $validatedData = $this->attachmentModelService->doResourceValidation(request()->all());
        try {
            // dd($validatedData);
            $result = $this->attachmentModelService->doResourceStore($validatedData);
            if(!$result){
                throw new Exception(COMMON_ERROR_MSG);
            }
            return _commonSuccessOrErrorMsg('success', INSERT_MSG);
        } catch (\Throwable $th) {
           return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Display the specified attachment with relational data.
     *
     * Returns a JSON response containing attachment details if found.
     * On failure, returns a JSON error response.
     *
     * @param  \App\Models\Tenant\Attachment  $attachment  The attachment instance resolved via route model binding
     * @param  bool $isFormattedShort  Set and get what type of data structure this method returns 
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception If attachment retrieval fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function show(Attachment $attachment): JsonResponse
    {
        try {
            if (!$attachment) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            $isFormattedShort = request('isFormattedShort') ?? true;

            ## Fetch task with relational data using service
            $data = $isFormattedShort ? $this->attachmentModelService->getModelFormattedData($attachment) : $this->attachmentModelService->getModelFormattedDataAll($attachment);

            if (!$data || !is_array($data) || !count($data)) {
                throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Attachment details',
                'data'    => $data,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => $th->getMessage() ?: 'Attachment not found',
                'data'    => [],
            ], 404);
        }
    }

    /**
     * Delete a attachment resource.
     *
     * Attempts to delete the given attachment by delegating to TaskModelService::deleteModelById().
     * On success, redirects back with a success toast message.
     * On failure, catches the exception and redirects back with an error toast message.
     *
     * @param  Attachment  $task  The attachment instance to delete
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception If the deletion fails unexpectedly
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function destroy(Attachment $attachment): RedirectResponse
    {
        try {
            if ($attachment->attachment_file && Storage::disk('tenant_public')->exists($attachment->attachment_file)) {
                Storage::disk('tenant_public')->delete($attachment->attachment_file);
            }

            if (!$this->attachmentModelService->deleteModelById($attachment)) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Update an existing attachment resource.
     *
     * Validates the request data, assigns associates (including the owner),
     * and delegates persistence to the TaskModelService.
     *
     * @param  int|string  $attachment  The attachment ID or identifier to update
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Exception  When the update process fails
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function resourceUpdate()
    {
        ## Validate incoming data

        $validatedData = $this->attachmentModelService->doResourceValidation(request()->all());

        try {
            $updatedModel = $this->attachmentModelService->doResourceUpdate($validatedData);

            if (!$updatedModel) {
                throw new Exception(COMMON_ERROR_MSG);
            }

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }
}
