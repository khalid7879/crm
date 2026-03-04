<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\BaseTenantController;
use App\Models\Tenant\DataEmailSetting;
use App\Services\Tenant\EmailSettingModelService;

class EmailSettingController extends BaseTenantController
{
    /***
     * EmailSettingController constructor.
     *
     * Initializes the EmailSettingModelService and merges its route names
     * into the controller's routeNames array.
     *
     * @param EmailSettingModelService $emailSettingModelService
     */
    public function __construct(private EmailSettingModelService $emailSettingModelService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->emailSettingModelService->getRouteNames()
        );
    }

    /**
     * Resource form show
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function index()
    {
        _hasPermissionOrAbort('email-settings-list');
        try {
            $dataList =  $this->emailSettingModelService->resourceList([...request()->all()])->toArray();
            return Inertia::render(
                'Tenant/EmailSetting/EmailSettingListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'dataList' => $dataList,
                        'filterOptions' => request()->all(),
                    ]
                )
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource create form show
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function create()
    {
        _hasPermissionOrAbort('email-settings-create');
        return Inertia::render('Tenant/EmailSetting/EmailSettingCreatePage', [...$this->data, 'tenant' => tenant('id')]);
    }

    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        // dd($request->all());
        $validatedData = $this->emailSettingModelService->doResourceValidation($request->all());
        try {
            if (!$this->emailSettingModelService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource status change
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceStatusChange()
    {

        try {
            if (!$this->emailSettingModelService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
          
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource delete process
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($emailSetting)
    {
        _hasPermissionOrAbort('email-settings-delete');
        try {
            if (!$this->emailSettingModelService->doResourceDelete($emailSetting)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource edit form
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($emailSettingId)
    {
        _hasPermissionOrAbort('email-settings-edit');
        try {
            $dataList = $this->emailSettingModelService->resourceEditData($emailSettingId);
            return Inertia::render(
                'Tenant/EmailSetting/EmailSettingEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'dataList' => $dataList

                ]
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource update
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $emailSetting)
    {
        // dd($request->all(),$emailSetting);
        $validatedData = $this->emailSettingModelService->doResourceValidation([...$request->all(), 'id' => $emailSetting]);
        try {
            if (!$this->emailSettingModelService->doResourceUpdate($request->all(), $emailSetting)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
