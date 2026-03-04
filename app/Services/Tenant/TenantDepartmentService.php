<?php

namespace App\Services\Tenant;

use App\Models\Department;
use Exception;
use Illuminate\Support\Facades\Validator;
use App\Services\BaseModelService;

class TenantDepartmentService extends BaseModelService
{

    public function __construct(Department $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined department routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'departmentsList' => 'tenant.departments.index',
            'departmentsCreate' => 'tenant.departments.create',
            'departmentsStore' => 'tenant.departments.store',
            'departmentsEdit' => 'tenant.departments.edit',
            'departmentsUpdate' => 'tenant.departments.update',
            'departmentsDelete' => 'tenant.departments.destroy',
            'departmentsStatusChange' => 'tenant.departments.status.change',

        ];
    }

    /**
     * resource store and update validation
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'name' => ['required', !isset($inputs['id']) ? 'unique:departments,name' : 'unique:departments,name,' . $inputs['id'], 'min:3', 'max:50'],
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
     * resource store process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceStore(array $inputs)
    {
        try {
            $department = [
                'name' => $inputs['name'],
            ];
            $department =  Department::create($department);
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource edit data
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($departmentId): mixed
    {
        try {
            $department = Department::findOrFail($departmentId);
            return $department;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
    
    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function departmentList($requests): mixed
    {
        try {
            return $this->getPaginatedModels($requests);
        } catch (\Throwable $th) {
          throw new Exception($th);
        }
    }

    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($departmentId)
    {
        try {
            $department = Department::findOrFail($departmentId);
            if(empty($department)) throw new Exception(INVALID_REQUEST);

            $department->delete();
            return true;
            
        } catch (\Exception $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource Update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doDepartmentUpdate(array $inputs, $department)
    {
        try {
            ## Central user
            $department = Department::findOrFail($department);
            if ($department) {
                $department->name = $inputs['name'];
                $department->save();
                return true;
            }
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource status change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceStatusChange(array $inputs)
    {
        try {
            ## Central user
            $departmentId = $inputs['departmentId'];
            $department = Department::findOrFail($departmentId);

            if (empty($department)) throw new Exception(INVALID_REQUEST);

            $department->is_active = $department->is_active == '1' ? '0' : '1';
            $department->save();
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
