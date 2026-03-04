<?php

namespace App\Services\Tenant;

use Exception;
use App\Models\Tenant\DataRevenue;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\Validator;

class TenantRevenueService extends BaseModelService
{
    public function __construct(DataRevenue $model)
    {
        parent::__construct($model);
    }


    /**
     * Return predefined task routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'dataRevenueList' => 'tenant.data-revenue.index',
            'dataRevenueCreate' => 'tenant.data-revenue.create',
            'dataRevenueStore' => 'tenant.data-revenue.store',
            'dataRevenueEdit' => 'tenant.data-revenue.edit',
            'dataRevenueUpdate' => 'tenant.data-revenue.update',
            'dataRevenueDelete' => 'tenant.data-revenue.destroy',
            'dataRevenueChangeStage' => 'tenant.data-revenue.status.change',
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
                'name' => ['required', !isset($inputs['id']) ? 'unique:data_revenues,name' : 'unique:data_revenues,name,' . $inputs['id'], 'min:3', 'max:50'],
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
    public function doResourceStore(array $inputs): mixed
    {
        try {
            $revenue = [
                'name' => $inputs['name'],
            ];
            DataRevenue::create($revenue);
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
    public function resourceEditData($revenueId): mixed
    {
        try {
            $revenue = $this->getSingleModel($revenueId);
            return $revenue;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceDelete($revenueId): mixed
    {
        try {
            $revenue = $this->getSingleModel($revenueId);
            if (empty($revenue)) throw new Exception(INVALID_REQUEST);

            $revenue->delete();
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
    public function doResourceUpdate(array $inputs, $revenue): mixed
    {
        try {
            $revenue = $this->getSingleModel($revenue);

            $revenue->name = $inputs['name'];
            $revenue->save();

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
            $revenueId = $inputs['revenueId'];
            $revenue = $this->getSingleModel($revenueId);
            if (empty($revenue)) throw new Exception(INVALID_REQUEST);
            
            $revenue->is_active = $revenue->is_active == '1' ? '0' : '1';
            $revenue->save();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
