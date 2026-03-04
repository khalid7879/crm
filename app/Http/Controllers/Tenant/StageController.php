<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use App\Models\Tenant\Stage;
use Illuminate\Http\Request;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\TenantLeadStageService;

class StageController extends BaseTenantController
{

    /***
     * StageController constructor.
     *
     * Initializes the TenantLeadStageService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantLeadStageService $tenantLeadStageService
     */
    public function __construct(private TenantLeadStageService $tenantLeadStageService)
    {
        /**
         * @author Mamun Hossen <mamunhossen149191@gmail.com>
         */
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantLeadStageService->getRouteNames()
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('stages-list');
        try {
            $filterData = ['orderBy' => 'order', 'orderType' => 'asc', 'isPaginate' => 0, ...request()->all()];

            $leadStageList =  $this->tenantLeadStageService->resourceList($filterData);
            return Inertia::render(
                'Tenant/LeadStage/LeadStageListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'leadStageList' => $leadStageList,
                        'filterOptions' => $filterData,
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
        return Inertia::render(
            'Tenant/LeadStage/LeadStageCreatePage',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                    'stagesType' => _getStagesType()
                ]
            )
        );
    }


    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantLeadStageService->doResourceValidation($request->all());

        try {
            if (!$this->tenantLeadStageService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage()?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource edit form
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($leadStage)
    {
        _hasPermissionOrAbort('stages-edit');

        try {
            $stages = $this->tenantLeadStageService->resourceEditData($leadStage);
            return Inertia::render(
                'Tenant/LeadStage/LeadStageEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'leadStages' =>  $stages,
                    'stagesType' => _getStagesType()
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
    public function update(Request $request, $leadStage)
    {

        $validatedData = $this->tenantLeadStageService->doResourceValidation([...$request->all(), 'id' => $leadStage]);
        try {
            if (!$this->tenantLeadStageService->doResourceUpdate($request->all(), $leadStage)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
          
        } catch (\Throwable $th) {
            $message = $th->getMessage()?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource delete process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($stage, Request $request)
    {
        _hasPermissionOrAbort('stages-delete');
        try {
            if (!$this->tenantLeadStageService->doResourceDelete($stage)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
            
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
    public function stageStatusChange()
    {
        try {
            if (!$this->tenantLeadStageService->stageStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource stage type status change
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function stageTypeStatusChange(Request $request)
    {

        try {
            if (!$this->tenantLeadStageService->stageTypeStatusChange($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
            
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource order change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceOrderChange()
    {
        try {

            if (!$this->tenantLeadStageService->resourceOrderChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);

        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
