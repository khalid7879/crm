<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantDataDesignationService;
use App\Http\Controllers\BaseTenantController;

/** 
 *  @author Mamun <mamunhossen149191@gmail.com>
 */
class DataDesignationController extends BaseTenantController
{
    public function __construct(private TenantDataDesignationService $tenantDataDesignationService)
    {
        /**
         * @author Mamun Hossen <mamunhossen149191@gmail.com>
         */
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantDataDesignationService->getRouteNames(),
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('data-designations-list');
        try {
            $dataDesignationsList =  $this->tenantDataDesignationService->resourceList([...request()->all(), 'isPaginate' => true]);
            return Inertia::render(
                'Tenant/DataDesignation/DataDesignationsListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'dataDesignationsList' => $dataDesignationsList,
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
        return Inertia::render('Tenant/DataDesignation/DataDesignationCreatePage', array_merge($this->data, ['tenant' => tenant('id')]));
    }


    /**
     * Resource store
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantDataDesignationService->doResourceValidation($request->all());
        try {
            if (!$this->tenantDataDesignationService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

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
    public function edit($designationId)
    {
        _hasPermissionOrAbort('data-designations-edit');
        try {
            $designations = $this->tenantDataDesignationService->resourceEditData($designationId);
            return Inertia::render(
                'Tenant/DataDesignation/DataDesignationEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'designations' =>  $designations
                ]
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
        
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $designationId)
    {
        $validatedData = $this->tenantDataDesignationService->doResourceValidation([...$request->all(), 'id' => $designationId]);
        try {
            if (!$this->tenantDataDesignationService->doResourceUpdate($request->all(), $designationId)) throw new Exception(INVALID_REQUEST);

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
    public function destroy($designationId)
    {
        _hasPermissionOrAbort('data-designations-delete');
        try {
            if (!$this->tenantDataDesignationService->doResourceDelete($designationId)) throw new Exception(INVALID_REQUEST);

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
    public function resourceStatusChange()
    {
        try {
             if(!$this->tenantDataDesignationService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
            
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);;
        }
    }
}
