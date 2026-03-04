<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantEmpSizeService;
use App\Http\Controllers\BaseTenantController;


class DataEmpSizeController extends BaseTenantController
{

    /***
     * DataEmpSizeController constructor.
     *
     * Initializes the TenantEmpSizeService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantEmpSizeService $tenantEmpSizeService
     */

    public function __construct(private TenantEmpSizeService $tenantEmpSizeService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantEmpSizeService->getRouteNames()
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {

        _hasPermissionOrAbort('data-emp-sizes-list');
        try {
            $empSizeList =  $this->tenantEmpSizeService->resourceList([...request()->all(), 'isPaginate' => true]);
            return Inertia::render(
                'Tenant/EmpSize/DataEmpSizeListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'empSizeList' => $empSizeList,
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
        return Inertia::render('Tenant/EmpSize/DataEmpSizeCreatePage', array_merge($this->data, ['tenant' => tenant('id')]));
    }


    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantEmpSizeService->doResourceValidation($request->all());
        try {
            if(!$this->tenantEmpSizeService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

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
    public function edit($empSizeId)
    {

        _hasPermissionOrAbort('data-emp-sizes-edit');
        try {
            $dataEmpSizes = $this->tenantEmpSizeService->resourceEditData($empSizeId);
            return Inertia::render(
                'Tenant/EmpSize/DataEmpSizeEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'dataEmpSizes' =>  $dataEmpSizes
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
    public function update(Request $request, $empSizeId)
    {
        $validatedData = $this->tenantEmpSizeService->doResourceValidation([...$request->all(), 'id' => $empSizeId]);
        try {
            if (!$this->tenantEmpSizeService->doResourceUpdate($request->all(), $empSizeId)) throw new Exception(INVALID_REQUEST);

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
    public function destroy($empSizeId)
    {
        _hasPermissionOrAbort('data-emp-sizes-delete');
        try {
            if(!$this->tenantEmpSizeService->doResourceDelete($empSizeId));

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

            if(!$this->tenantEmpSizeService->resourceStatusChange(request()->all()));

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
            
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
