<?php

namespace App\Services\Tenant;

use App\Models\Tenant\DataContactTime;
use Exception;
use Illuminate\Support\Facades\Validator;
use App\Services\BaseModelService;

class TenantContactTimeService extends BaseModelService
{
    public function __construct(DataContactTime $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined contact time routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return  [
            'dataContactTimesList' => 'tenant.contact-times.index',
            'dataContactTimesCreate' => 'tenant.contact-times.create',
            'dataContactTimesStore' => 'tenant.contact-times.store',
            'dataContactTimesEdit' => 'tenant.contact-times.edit',
            'dataContactTimesUpdate' => 'tenant.contact-times.update',
            'dataContactTimesDelete' => 'tenant.contact-times.destroy',
            'dataContactTimesStatusChange' => 'tenant.contact-times.status.change',

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
                'name' => ['required', !isset($inputs['id']) ? 'unique:data_contact_times,name' : 'unique:data_contact_times,name,' . $inputs['id'], 'min:3', 'max:50'],
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
            $name = $inputs['name'] ?? '';
            $data = [
                'name' => $name,
                'is_active' => '1',
            ];
            $resource = DataContactTime::create($data);
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource List
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
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($contactTimeId): mixed
    {
        try {
            $contactTime = $this->getSingleModel($contactTimeId);
            return $contactTime;
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
     * 
     * Resource update
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $contactTimeId): mixed
    {
        try {
            $contactTime = $this->getSingleModel($contactTimeId);
            if (empty($contactTime)) throw new Exception(INVALID_REQUEST);

            $contactTime->name = $inputs['name'];
            $contactTime->save();

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

            $contactTimeId = $inputs['contactTimeId'];
            $contactTime = $this->getSingleModel($contactTimeId);

            if (empty($contactTime)) throw new Exception(INVALID_REQUEST);

            $contactTime->is_active = $contactTime->is_active == '1' ? '0' : '1';
            $contactTime->save();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
