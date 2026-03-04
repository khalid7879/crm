<?php

namespace App\Services\Tenant;

use Exception;
use App\Models\Module;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\Validator;

class TenantModuleService extends BaseModelService
{
    public function __construct(Module $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined module routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'modulesList' => 'tenant.modules.index',
            'modulesCreate' => 'tenant.modules.create',
            'modulesStore' => 'tenant.modules.store',
            'modulesEdit' => 'tenant.modules.edit',
            'modulesUpdate' => 'tenant.modules.update',
            'modulesDelete' => 'tenant.modules.destroy',
            'modulesStatusChange' => 'tenant.modules.status.change',
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
                'name' => ['required', !isset($inputs['id']) ? 'unique:modules,name' : 'unique:modules,name,' . $inputs['id'], 'min:3', 'max:50'],
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
            $module = [
                'name' => $inputs['name'],
                'note' => $inputs['note'] ?? '',
                'parent_checked' => '1',
            ];
            $module =  Module::create($module);
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
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
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }


    /**
     * Resource edit data
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($moduleId): mixed
    {
        try {
            $module = $this->getSingleModel($moduleId);
            return $module;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource delete
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceDelete($moduleId): mixed
    {
        try {
            $module = Module::findOrFail($moduleId);
            if (empty($module)) throw new Exception(INVALID_REQUEST);
            $module->delete();
            return true;
        } catch (\Exception $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Module update
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $module): mixed
    {
        try {
            ## Central user
            $module = Module::findOrFail($module);
            if ($module) {
                $module->name = $inputs['name'];
                $module->note = $inputs['note'] ?? null;
                $module->save();
            }
          return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
    
    /**
     * Resource status change
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceStatusChange(array $inputs): mixed
    {
        try {

            $moduleId = $inputs['moduleId'];
            $module = Module::findOrFail($moduleId);
            
            if (empty($module)) throw new Exception(INVALID_REQUEST);

            $module->is_active = $module->is_active == '1' ? '0' : '1';
            $module->save();
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
