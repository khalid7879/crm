<?php

namespace App\Services\Tenant;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Models\Tenant\DataSource;
use App\Services\BaseModelService;

class TenantLeadSourceService extends BaseModelService
{
    public function __construct(DataSource $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined dataSource routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'leadSourcesList' => 'tenant.lead-sources.index',
            'leadSourcesCreate' => 'tenant.lead-sources.create',
            'leadSourcesStore' => 'tenant.lead-sources.store',
            'leadSourcesEdit' => 'tenant.lead-sources.edit',
            'leadSourcesUpdate' => 'tenant.lead-sources.update',
            'leadSourcesDelete' => 'tenant.lead-sources.destroy',
            'leadSourcesStatusChange' => 'tenant.leadSources.status.change',

        ];
    }



    /**
     * Resource registration validation
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'name' => ['required', !isset($inputs['id']) ? 'unique:data_sources,name' : 'unique:data_sources,name,' . $inputs['id'], 'min:3', 'max:50'],
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
            $leadSource = [
                'name' => $inputs['name'],
            ];
            $leadSource =   DataSource::create($leadSource);
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
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($leadSourceId): mixed
    {
        try {
            $leadSourceId =  $this->getSingleModel($leadSourceId);

            if (empty($leadSourceId)) throw new Exception(INVALID_REQUEST);

            $leadSourceId->delete();
            return true;
        } catch (\Exception $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource edit data
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($leadSourceId): mixed
    {
        try {
            $leadSource = $this->getSingleModel($leadSourceId);
            return $leadSource;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $leadSource): mixed
    {
        try {
            $leadSource =  $this->getSingleModel($leadSource);

            if (empty($leadSource)) throw new Exception(INVALID_REQUEST);

            $leadSource->name = $inputs['name'];
            $leadSource->save();
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
           
            $leadSourceId = $inputs['leadSourceId'];
            $leadSource = $this->getSingleModel($leadSourceId);

            if (empty($leadSource)) throw new Exception(INVALID_REQUEST);

            $leadSource->is_active = $leadSource->is_active == '1' ? '0' : '1';
            $leadSource->save();
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
