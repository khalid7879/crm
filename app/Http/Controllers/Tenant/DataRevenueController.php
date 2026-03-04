<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantRevenueService;
use App\Http\Controllers\BaseTenantController;

class DataRevenueController extends BaseTenantController
{

    /***
     * DataRevenueController constructor.
     *
     * Initializes the TenantRevenueService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantRevenueService $tenantRevenueService
     */
    public function __construct(private TenantRevenueService $tenantRevenueService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantRevenueService->getRouteNames()
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('data-revenue-list');
        try {
            $revenueList = $this->tenantRevenueService->resourceList(request()->all());
            return Inertia::render(
                'Tenant/Revenue/RevenueListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'revenueList' => $revenueList,
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
        _hasPermissionOrAbort('data-revenue-create');
        return Inertia::render('Tenant/Revenue/RevenueCreatePage', array_merge($this->data, ['tenant' => tenant('id')]));
    }


    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantRevenueService->doResourceValidation($request->all());
        try {
            if (!$this->tenantRevenueService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

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
    public function edit($data_revenue)
    {
        _hasPermissionOrAbort('data-revenue-edit');
        try {
            $revenue = $this->tenantRevenueService->resourceEditData($data_revenue);
            if (!$revenue) throw new Exception(INVALID_REQUEST);

            return Inertia::render(
                'Tenant/Revenue/RevenueEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'revenue' =>  $revenue
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
    public function update(Request $request, $revenue)
    {
        $validatedData = $this->tenantRevenueService->doResourceValidation([...$request->all(), 'id' => $revenue]);
        try {
            if (!$this->tenantRevenueService->doResourceUpdate($request->all(), $revenue)) throw new Exception(INVALID_REQUEST);

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
    public function destroy($data_revenue)
    {
        _hasPermissionOrAbort('data-revenue-list');
        try {
            if (!$this->tenantRevenueService->resourceDelete($data_revenue)) throw new Exception(INVALID_REQUEST);

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
            if(!$this->tenantRevenueService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
