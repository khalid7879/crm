<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantLeadPriorityService;
use App\Http\Controllers\BaseTenantController;
use App\Models\Tenant\DataPriority;

class LeadPriorityController extends BaseTenantController
{

    /***
     * ModuleController constructor.
     *
     * Initializes the TenantLeadPriorityService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantLeadPriorityService $tenantLeadPriorityService
     */
    public function __construct(private TenantLeadPriorityService $tenantLeadPriorityService)
    {
        /**
         * @author Mamun Hossen <mamunhossen149191@gmail.com>
         */
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantLeadPriorityService->getRouteNames(),
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('lead-priorities-list');
        try {
            $leadPriorityList =  $this->tenantLeadPriorityService->resourceListList(request()->all());
            return Inertia::render(
                'Tenant/LeadPriority/LeadPriorityListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'leadPriorityList' => $leadPriorityList,
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
     * Resource create form show
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function create()
    {
        return Inertia::render('Tenant/LeadPriority/LeadPriorityCreatePage', array_merge($this->data, ['tenant' => tenant('id')]));
    }


    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantLeadPriorityService->doResourceValidation($request->all());
        try {
            if (!$this->tenantLeadPriorityService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource edit form
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($leadPriority)
    {
        _hasPermissionOrAbort('lead-priorities-edit');
        $leadPriorities = DataPriority::findOrFail($leadPriority);
        return Inertia::render(
            'Tenant/LeadPriority/LeadPriorityEditPage',
            [
                ...$this->data,
                'tenant' => tenant('id'),
                'leadPriorities' =>  $leadPriorities
            ]
        );
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $leadPriority)
    {
        $validatedData = $this->tenantLeadPriorityService->doResourceValidation([...$request->all(), 'id' => $leadPriority]);
        try {
            if (!$this->tenantLeadPriorityService->doResourceUpdate($request->all(), $leadPriority)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
          
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * Resource delete process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($leadPriority)
    {
        _hasPermissionOrAbort('lead-priorities-delete');
        try {
            if (!$this->tenantLeadPriorityService->doResourceDelete($leadPriority)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
          
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource status change
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function leadPriorityStatusChange()
    {
        try {
            if (!$this->tenantLeadPriorityService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
