<?php

namespace App\Http\Controllers\Tenant;


use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantRoleService;
use App\Http\Controllers\BaseTenantController;

class RoleController extends BaseTenantController
{
    /***
     * RoleController constructor.
     *
     * Initializes the RoleController and merges its route names
     * into the controller's routeNames array.
     *
     * @param RoleController $tenantRoleService
     */
    public function __construct(private TenantRoleService $tenantRoleService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
           $this->tenantRoleService->getRouteNames()
        );
    }

    /**
     * Role list
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('roles-list');
        try {
            $rolesList =  $this->tenantRoleService->resourceList([...request()->all(), 'with' => ['permissions', 'users']]);
            return Inertia::render(
                'Tenant/Role/RoleListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'rolesList' => $rolesList
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
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function create()
    {
        _hasPermissionOrAbort('roles-create');
        return Inertia::render(
            'Tenant/Role/RoleCreatePage',
            [
                ...$this->data,
                'tenant' => tenant('id'),
            ]
        );
    }

    /**
     * Resource store
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {

        $validatedData = $this->tenantRoleService->doResourceValidation($request->all());
        try {
            $result =  $this->tenantRoleService->doResourceStore($request->all());
            return redirect()->route('tenant.roles.permissions.assign', [
                'tenant' => tenant('id'),
                'role' => $result['id'],
            ]);
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * role edit form show
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($role)
    {
        _hasPermissionOrAbort('roles-edit');
        try {
            $roles = $this->tenantRoleService->resourceEditData($role);
            return Inertia::render(
                'Tenant/Role/RoleEditPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'roles' =>  $roles
                    ]
                )
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
        
    }

    /**
     * Resource update
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $role)
    {
        $validatedData = $this->tenantRoleService->doResourceValidation([...$request->all(), 'id' => $role]);
        try {
            if (! $this->tenantRoleService->doResourceUpdate($request->all(), $role)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource delete process
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($role)
    {
        _hasPermissionOrAbort('roles-delete');
        try {
            if (! $this->tenantRoleService->resourceDelete($role)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * Resource permission assign
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function permissionAssign($role)
    {

        try {
            $data = $this->tenantRoleService->roleWithPermissionData($role);
            return Inertia::render(
                'Tenant/Role/RolePermissionAssignPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'role' =>  $role,
                        'modulesWithPermissions' => $data['modulesWithPermissions'],
                        'rolePermissions' => $data['rolePermissions']
                    ]
                )
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
        
    }

    /**
     * Resource permission assign store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function permissionAssignStore(Request $request)
    {
        try {
            if (!$this->tenantRoleService->permissionAssignStore($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
         
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
            if(!$this->tenantRoleService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
