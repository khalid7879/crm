<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\TenantDepartmentService;

class DepartmentController extends BaseTenantController
{
    /***
     * DepartmentController constructor.
     *
     * Initializes the TenantDepartmentService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantDepartmentService $tenantDepartmentService
     */
    public function __construct(private TenantDepartmentService $tenantDepartmentService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantDepartmentService->getRouteNames()
        );
    }

    /**
     * Resource list
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index(Request $request)
    {
        _hasPermissionOrAbort('departments-list');

        try {
            $departments =  $this->tenantDepartmentService->departmentList([...$request->all(), 'with' => 'userDepartment']);
            return Inertia::render(
                'Tenant/Department/DepartmentListPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'departments' => $departments,
                    'filterOptions' => $request->all(),
                ]

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
        _hasPermissionOrAbort('departments-create');
        return Inertia::render('Tenant/Department/DepartmentCreatePage', [...$this->data, 'tenant' => tenant('id')]);
    }


    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantDepartmentService->doResourceValidation($request->all());
        try {
            if (!$this->tenantDepartmentService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

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
    public function edit($department)
    {
        _hasPermissionOrAbort('departments-edit');

        try {
            $departments = $this->tenantDepartmentService->resourceEditData($department);
            return Inertia::render(
                'Tenant/Department/DepartmentEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'departments' => $departments

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
    public function update(Request $request, $department)
    {
        $validatedData = $this->tenantDepartmentService->doResourceValidation([...$request->all(), 'id' => $department]);
        try {
            if (!$this->tenantDepartmentService->doDepartmentUpdate($request->all(), $department)) throw new Exception(INVALID_REQUEST);

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
    public function destroy($department)
    {
        _hasPermissionOrAbort('departments-delete');
        try {
            if (!$this->tenantDepartmentService->doResourceDelete($department)) throw new Exception(INVALID_REQUEST);

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
    public function departmentStatusChange()
    {
        try {
            if(! $this->tenantDepartmentService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
