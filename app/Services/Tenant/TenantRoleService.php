<?php

namespace App\Services\Tenant;

use Exception;
use App\Models\Role;
use App\Models\Module;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\Validator;

class TenantRoleService extends BaseModelService
{
    public function __construct(Role $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined role routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'rolesList' => 'tenant.roles.index',
            'rolesCreate' => 'tenant.roles.create',
            'rolesStore' => 'tenant.roles.store',
            'rolesEdit' => 'tenant.roles.edit',
            'rolesUpdate' => 'tenant.roles.update',
            'rolesDelete' => 'tenant.roles.destroy',
            'permissionAssign' => 'tenant.roles.permissions.assign',
            'rolesStatusChange' => 'tenant.roles.status.change',
            'permissionAssignStore' => 'tenant.roles.permissions.assign.Store',

        ];
    }

    /**
     * resource create and update validation
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'name' => ['required', !isset($inputs['id']) ? 'unique:roles,name' : 'unique:roles,name,' . $inputs['id'], 'min:3', 'max:50'],
            ],
            [
                'name.required' => __('Name can not be empty'),
                'name.min' => __('Minimum character length :min', [':min']),
                'name.max' => __('Maximum character length :max', [':max']),
                'name.unique' => __('The name has already been taken'),

            ]
        )->validate();
    }

    /**
     * Resource store
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceStore(array $inputs): mixed
    {
        try {
            $role = [
                'name' => $inputs['name'],
                'guard_name' => 'web',
            ];
            $roles = Role::create($role);
            return $roles;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource list
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceList($requests): mixed
    {
        try {
            return $this->getPaginatedModels($requests);
        } catch (\Throwable $th) {
           throw new Exception($th);
        }

    }
    
    /**
     * Resource edit data
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($roleId): mixed
    {
        try {
            $role = Role::findOrFail($roleId);
            return $role;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }


    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceDelete($roleId): mixed
    {
        try {
            $role = Role::findOrFail($roleId);
            if (empty($role)) throw new Exception(INVALID_REQUEST);

            $role->delete();
            return true;
        } catch (\Exception $e) {
            throw new Exception($e);
        }
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $role): mixed
    {
        try {
            $role = Role::findOrFail($role);
            if ($role) {
                $role->name = $inputs['name'];
                $role->save();
            }
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => 'Role update successfully']
            ]);
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
        return true;
    }

    /**
     * Get all modules with their permissions and the given role with its assigned permissions.
     *
     * @param  int|string  $role   The role ID (or primary key) to fetch
     * @return array               Array containing modules + permissions and role + its permissions
     *
     * @throws \Exception          Rethrows any exception that occurs during the process
     */
    public function roleWithPermissionData($role)
    {
        try {
            $data = [];

            $modulesWithPermissions = Module::with('permissions')->get();

            $rolePermissions = Role::with('permissions')->findOrFail($role);

            $data['modulesWithPermissions'] = $modulesWithPermissions;
            $data['rolePermissions'] = $rolePermissions;

            return $data;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), $th->getCode(), $th);
        }
    }

    /**
     * Permission assign store in role
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function permissionAssignStore($request)
    {
        try {
            $role = $request['role'];
            $permissions = $request['permissions'];
            $role = Role::findOrFail($role);

            if (empty($role)) throw new Exception(INVALID_REQUEST);
            
            $role->syncPermissions($permissions ?? []);
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource status change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceStatusChange(array $inputs): mixed
    {
        try {
            $roleId = $inputs['roleId'];
            $role = Role::findOrFail($roleId);

            if (empty($role)) throw new Exception(INVALID_REQUEST);

            $role->is_active = $role->is_active == '1' ? '0' : '1';
            $role->save();
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
