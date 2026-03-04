<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantModuleService;
use App\Http\Controllers\BaseTenantController;

/** 
 *  @author Mamun <mamunhossen149191@gmail.com>
 */
class ModuleController extends BaseTenantController
{

    /***
     * ModuleController constructor.
     *
     * Initializes the TenantModuleService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantModuleService $tenantModuleService
     */
    public function __construct(private TenantModuleService $tenantModuleService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantModuleService->getRouteNames()
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('modules-list');
        try {
            $modulesList = $this->tenantModuleService->resourceList(request()->all());

            return Inertia::render(
                'Tenant/Module/ModuleListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'modulesList' => $modulesList,
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
        return Inertia::render('Tenant/Module/ModuleCreatePage', array_merge($this->data, ['tenant' => tenant('id')]));
    }


    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantModuleService->doResourceValidation($request->all());
        try {
            if (!$this->tenantModuleService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);
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
    public function edit($module)
    {
        _hasPermissionOrAbort('modules-edit');
        try {
            $modules = $this->tenantModuleService->resourceEditData($module);
            return Inertia::render(
                'Tenant/Module/ModuleEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'modules' =>  $modules
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
    public function update(Request $request, $module)
    {
        $validatedData = $this->tenantModuleService->doResourceValidation([...$request->all(), 'id' => $module]);
        try {
            if (!$this->tenantModuleService->doResourceUpdate($request->all(), $module)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
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
    public function destroy($role)
    {
        _hasPermissionOrAbort('modules-delete');
        try {
            if (!$this->tenantModuleService->resourceDelete($role)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
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
    public function modulesStatusChange()
    {
        try {
            if (!$this->tenantModuleService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
