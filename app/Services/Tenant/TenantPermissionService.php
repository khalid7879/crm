<?php

namespace App\Services\Tenant;

use Exception;
use App\Models\Permission;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\BaseTenantController;

class TenantPermissionService extends BaseTenantController
{

    public function __construct()
    {
        $this->setModel(Permission::class);
    }

    /**
     * resource store and update validation
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doPermissionValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'name' => ['required', !isset($inputs['id']) ? 'unique:permissions,name' : 'unique:permissions,name,' . $inputs['id'], 'min:3', 'max:50'],
                'module' => 'required|exists:modules,id'
            ],
            [
                'name.required' => __('Name can not be empty'),
                'name.min' => __('Minimum character length :min', [':min']),
                'name.max' => __('Maximum character length :max', [':max']),
                'name.unique' => __('The name has already been taken'),
                'module.required' => __('Please select a module'),

            ]
        )->validate();
    }

    /**
     * resource store process
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doPermissionStore(array $inputs): mixed
    {
        try {
            $permissions = [
                'name' => $inputs['name'],
                'guard_name' => 'web',
                'module_id' => $inputs['module'],
            ];
            $permission =  Permission::create($permissions);
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
    /**
     * Resource list
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function permissionList($requests = []): mixed
    {
        return $this->getPaginatedModels([...$requests,'with' => ['module']]);
    }

    /**
     * Resource delete
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doPermissionDelete($permissionId): mixed
    {
        try {
            $permission = Permission::findOrFail($permissionId);
            if (empty($permission)) throw new Exception(INVALID_REQUEST);
            $permission->delete();
            return true;
        } catch (\Exception $e) {
            throw new Exception($e);
        }
    }

    /**
     * Resource Update
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doPermissionUpdate(array $inputs, $permission): mixed
    {
        try {
            $permission = Permission::findOrFail($permission);
            if (empty($permission)) throw new Exception(INVALID_REQUEST);
            $permission->name = $inputs['name'];
            $permission->module_id = $inputs['module'];
            $permission->save();
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource status change
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function permissionStatusChange(array $inputs): mixed
    {
        try {
            $permissionId = $inputs['permissionId'];
            $permission = Permission::findOrFail($permissionId);
            if (empty($permission)) throw new Exception(INVALID_REQUEST);
            $permission->is_active = $permission->is_active == '1' ? '0' : '1';
            $permission->save();
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
