<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantPermissionService;
use App\Http\Controllers\BaseTenantController;
use App\Models\Module;
use App\Models\Permission;


/**
 *  @author Mamun <mamunhossen149191@gmail.com>
 */
class PermissionController extends BaseTenantController
{
    /**
     * @author Mamun Hossen <mamunhossen149191@gmail.com>
     */
    public function __construct(private TenantPermissionService $tenantPermissionService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            [
                'permissionsList' => 'tenant.permissions.index',
                'permissionsCreate' => 'tenant.permissions.create',
                'permissionsStore' => 'tenant.permissions.store',
                'permissionsEdit' => 'tenant.permissions.edit',
                'permissionsUpdate' => 'tenant.permissions.update',
                'permissionsDelete' => 'tenant.permissions.destroy',
                'permissionsStatusChange' => 'tenant.permissions.status.change',

            ]
        );
    }

    /**
     * Resource form show
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function create()
    {
        _hasPermissionOrAbort('permissions-create');
        $modules = Module::all()->select('id', 'name');
        return Inertia::render('Tenant/Permission/PermissionCreatePage', [...$this->data, 'tenant' => tenant('id'), 'modules' => $modules]);
    }


    /**
     * Resource store
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantPermissionService->doPermissionValidation($request->all());
        try {
            if (!$this->tenantPermissionService->doPermissionStore($request->all())) throw new Exception(INVALID_REQUEST);
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => INSERT_MSG],
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage(), $th->getLine() ?: __(COMMON_MSG)],
            ]);
        }
    }
    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index(Request $request)
    {
        _hasPermissionOrAbort('permissions-list');
        $permissionsList =  $this->tenantPermissionService->permissionList($request->all());
        return Inertia::render(
            'Tenant/Permission/PermissionListPage',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                    'permissionsList' => $permissionsList,
                    'filterOptions' => $request->all(),
                ]
            )
        );
    }

    /**
     * Resource delete process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($permission)
    {
        _hasPermissionOrAbort('permissions-delete');
        try {
            if (!$this->tenantPermissionService->doPermissionDelete($permission))throw new Exception(INVALID_REQUEST);

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => DELETE_MSG],
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage(), $th->getLine() ?: __(COMMON_MSG)],
            ]);
        }
    }

    /**
     * Resource edit form
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($permission)
    {
        _hasPermissionOrAbort('permissions-edit');
        $permissions = Permission::findOrFail($permission);
        $modules = Module::all();
        return Inertia::render(
            'Tenant/Permission/PermissionEditPage',
            [
                ...$this->data,
                'tenant' => tenant('id'),
                'permissions' =>  $permissions,
                'modules' =>  $modules
            ]
        );
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $permission)
    {
        $validatedData = $this->tenantPermissionService->doPermissionValidation([...$request->all(), 'id' => $permission]);
        try {
            if(! $this->tenantPermissionService->doPermissionUpdate($request->all(), $permission)) throw new Exception(INVALID_REQUEST);
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => UPDATE_MSG],
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage(), $th->getLine() ?: __(COMMON_MSG)],
            ]);
        }
    }

    /**
     * Resource status change
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function permissionStatusChange()
    {
        try {
            if(! $this->tenantPermissionService->permissionStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => STATUS_CHANGE],
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage(), $th->getLine() ?: __(COMMON_MSG)],
            ]);
        }
    }
}
