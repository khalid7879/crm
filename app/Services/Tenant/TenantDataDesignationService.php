<?php

namespace App\Services\Tenant;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Models\Tenant\DataDesignation;
use App\Services\BaseModelService;

class TenantDataDesignationService extends BaseModelService
{
    /**
     * Class instance
     *
     * @param DataDesignation $model
     */
    public function __construct(DataDesignation $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined designation routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return  [
            'dataDesignationsList' => 'tenant.data-designations.index',
            'dataDesignationsCreate' => 'tenant.data-designations.create',
            'dataDesignationsStore' => 'tenant.data-designations.store',
            'dataDesignationsEdit' => 'tenant.data-designations.edit',
            'dataDesignationsUpdate' => 'tenant.data-designations.update',
            'dataDesignationsDelete' => 'tenant.data-designations.destroy',
            'dataDesignationsStatusChange' => 'tenant.data-designations.status.change',

        ];
    }

    /**
     * Resource validation
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'name' => ['required', !isset($inputs['id']) ? 'unique:data_designations,name' : 'unique:data_designations,name,' . $inputs['id'], 'min:3', 'max:50'],
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
     * Resource Store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceStore(array $inputs)
    {
        try {
            $resource = [
                'name' => $inputs['name'],
            ];
            $resource =   DataDesignation::create($resource);
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }


    /**
     * Resource list
     * 
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
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($designationId): mixed
    {
        try {
            $designation = $this->getSingleModel($designationId);
            return $designation;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }


    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($designationId): mixed
    {
        try {
            $designation = $this->getSingleModel($designationId);
            if ($designation) {
                $designation->delete();
            }
          return true;
        } catch (\Exception $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $designationId)
    {
        try {
            $designation =  $this->getSingleModel($designationId);
            if (empty($designation)) throw new Exception(INVALID_REQUEST);

            $designation->name = $inputs['name'];
            $designation->save();
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
    public function resourceStatusChange(array $inputs)
    {
        try {
            $dataDesignationId = $inputs['dataDesignationId'];
            $designation = $this->getSingleModel($dataDesignationId);
            if (empty($designation)) throw new Exception(INVALID_REQUEST);

            $designation->is_active = $designation->is_active == '1' ? '0' : '1';
            $designation->save();
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
