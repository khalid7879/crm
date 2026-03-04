<?php

namespace App\Services\Tenant;

use App\Models\Tenant\CompanySetting;
use Illuminate\Support\Facades\Validator;
use Exception;

use App\Services\BaseModelService;

class TenantCompanySettingService extends BaseModelService
{
    public function __construct(CompanySetting $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined company setting routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'companySettingsList' => 'tenant.company-settings.index',
            'companySettingsCreate' => 'tenant.company-settings.create',
            'companySettingsStore' => 'tenant.company-settings.store',
            'companySettingsEdit' => 'tenant.company-settings.edit',
            'companySettingsUpdate' => 'tenant.company-settings.update',
            'companySettingsDelete' => 'tenant.company-settings.destroy',
            'companySettingsStatusChange' => 'tenant.company-settings.status.change',

        ];
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
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
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
                'type' => ['required', !isset($inputs['id']) ? 'unique:company_settings,type' : 'unique:company_settings,type,' . $inputs['id'], 'min:3', 'max:50'],
                'value' => ['required'],
            ],
            [
                'type.required' => __('Type can not be empty'),
                'type.min' => __('Minimum character length :min', [':min']),
                'type.max' => __('Maximum character length :max', [':max']),
                'type.unique' => __('The name has already been taken'),
                'value.unique' => __('Value can not be empty'),

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

        $datas = $inputs['company_settings'] ?? [];
        $successful = false;

        try {
            foreach ($datas as $key => $data) {
                if (!empty($data['id'])) {
                    $resource = CompanySetting::updateOrCreate(
                        ['id' => $data['id']],
                        [
                            'type' => $data['type'],
                            'value' => $data['value']
                        ]
                    );
                } else {
                    if ($data['type']) {
                        $resource = CompanySetting::updateOrCreate(
                            ['type' => $data['type']],
                            [
                                'value' => $data['value'],
                                'is_delete' => true,
                            ]
                        );
                    }
                }
                $successful = true;
            }

            if ($successful) return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
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
            $resource = CompanySetting::findOrFail($id);
            if (empty($resource)) throw new Exception(INVALID_REQUEST);
            
            $resource->delete();
            return true;
        } catch (\Exception $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
