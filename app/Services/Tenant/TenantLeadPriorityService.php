<?php

namespace App\Services\Tenant;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Models\Tenant\DataPriority;
use App\Services\BaseModelService;

class TenantLeadPriorityService extends BaseModelService
{
    /**
     * Class instance
     *
     * @param Organization $model
     */
    public function __construct(DataPriority $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined lead priority routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'leadPrioritiesList' => 'tenant.lead-priorities.index',
            'leadPrioritiesCreate' => 'tenant.lead-priorities.create',
            'leadPrioritiesStore' => 'tenant.lead-priorities.store',
            'leadPrioritiesEdit' => 'tenant.lead-priorities.edit',
            'leadPrioritiesUpdate' => 'tenant.lead-priorities.update',
            'leadPrioritiesDelete' => 'tenant.lead-priorities.destroy',
            'leadPrioritiesStatusChange' => 'tenant.leadPriorities.status.change',

        ];
    }

    /**
     * User registration validation
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'name' => ['required', !isset($inputs['id']) ? 'unique:data_priorities,name' : 'unique:data_priorities,name,' . $inputs['id'], 'min:3', 'max:50'],
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
    public function doResourceStore(array $inputs): mixed
    {
        try {
            $leadPriority = [
                'name' => $inputs['name'],
            ];
            $leadPriority = DataPriority::create($leadPriority);
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
    public function resourceListList($requests): mixed
    {
        try {
            return $this->getPaginatedModels($requests);
        } catch (\Throwable $th) {
           throw new Exception($th);
        }
    }
    /**
     * Resource  delete
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($leadPriorityId): mixed
    {
        try {
            $leadPriority =  $this->getSingleModel($leadPriorityId);
            if (empty($leadPriority)) throw new Exception(INVALID_REQUEST);
            $leadPriority->delete();
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
    public function doResourceUpdate(array $inputs, $leadPriority): mixed
    {
        try {
            $leadPriority = $this->getSingleModel($leadPriority);
            if (empty($leadPriority)) throw new Exception(INVALID_REQUEST);
            $leadPriority->name = $inputs['name'];
            $leadPriority->save();
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

            $leadPriorityId = $inputs['leadPriorityId'];
            $leadPriority =  $this->getSingleModel($leadPriorityId);
            if (empty($leadPriority)) throw new Exception(INVALID_REQUEST);

            $leadPriority->is_active = $leadPriority->is_active == '1' ? '0' : '1';
            $leadPriority->save();
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
