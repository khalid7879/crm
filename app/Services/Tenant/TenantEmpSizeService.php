<?php

namespace App\Services\Tenant;

use App\Models\Tenant\DataEmpSize;
use Exception;
use Illuminate\Support\Facades\Validator;
use App\Services\BaseModelService;

class TenantEmpSizeService extends BaseModelService
{
    public function __construct(DataEmpSize $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined employee size routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'dataEmpSizesList' => 'tenant.emp-sizes.index',
            'dataEmpSizesCreate' => 'tenant.emp-sizes.create',
            'dataEmpSizesStore' => 'tenant.emp-sizes.store',
            'dataEmpSizesEdit' => 'tenant.emp-sizes.edit',
            'dataEmpSizesUpdate' => 'tenant.emp-sizes.update',
            'dataEmpSizesDelete' => 'tenant.emp-sizes.destroy',
            'dataEmpSizesStatusChange' => 'tenant.emp-sizes.status.change',

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
                'name' => ['required', !isset($inputs['id']) ? 'unique:data_emp_sizes,name' : 'unique:data_emp_sizes,name,' . $inputs['id'], 'min:3', 'max:50'],
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
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceStore(array $inputs)
    {

        try {
            $name = $inputs['name'] ?? '';
            $note = $inputs['note'] ?? null;
            $size = $inputs['size'] ?? null;
            $isActive = '1';
            $data = [
                'name' => $name,
                'note' => $note,
                'size' => $size,
                'is_active' => $isActive,
            ];
            $resource = DataEmpSize::create($data);

            if ($resource) return true;
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
    public function resourceEditData($empSizeId): mixed
    {
        try {
            $empSize = $this->getSingleModel($empSizeId);
            return $empSize;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($id): mixed
    {
        try {
            $resource = $this->getSingleModel($id);
            if (empty($resource)) throw new Exception(INVALID_REQUEST);

            $resource->delete();
            return true;
        } catch (\Exception $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $empSizeId): mixed
    {
        try {
            $empSize = $this->getSingleModel($empSizeId);
            if (empty($empSize)) throw new Exception(INVALID_REQUEST);

            $empSize->name = $inputs['name'] ?? null;
            $empSize->note = $inputs['note'] ?? null;
            $empSize->size = $inputs['size'] ?? null;
            $empSize->save();

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
         
            $empSizeId = $inputs['empSizeId'];
            $empSize = $this->getSingleModel($empSizeId);
            if (empty($empSize)) throw new Exception(INVALID_REQUEST);

            $empSize->is_active = $empSize->is_active == '1' ? '0' : '1';
            $empSize->save();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
