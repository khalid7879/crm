<?php

namespace App\Services\Tenant;

use Exception;
use Illuminate\Validation\Rule;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant\DataCategory;
use Illuminate\Support\Facades\Validator;

class TenantIndustryTypeService extends BaseModelService
{

    public function __construct(DataCategory $model)
    {
        parent::__construct($model);
    }

    /**
     * Return predefined data category routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return   [
            'industryTypesList' => 'tenant.industryTypes.index',
            'industryTypesCreate' => 'tenant.industryTypes.create',
            'industryTypesStore' => 'tenant.industryTypes.store',
            'industryTypesEdit' => 'tenant.industryTypes.edit',
            'industryTypesUpdate' => 'tenant.industryTypes.update',
            'industryTypesDelete' => 'tenant.industryTypes.destroy',
            'industryTypesStatusChange' => 'tenant.industryTypes.status.change',

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
                'name'  => ['required', 'min:3', 'max:50'],
                'types' => ['required', 'array'],
            ],
            [
                'name.required' => __('Name can not be empty'),
                'name.min'      => __('Minimum character length :min', ['min' => 3]),
                'name.max'      => __('Maximum character length :max', ['max' => 50]),

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
            $types = $inputs['types'];
            $name  = $inputs['name'];

            if (!empty($types)) {
                foreach ($types as $type) {
                    $exists = DataCategory::where('name', $name)
                        ->where('type', $type)
                        ->exists();

                    if ($exists) {
                        throw new Exception($name . ' and type ' . $type . ' this combination already exits!');
                    }

                    DataCategory::create([
                        'name' => $name,
                        'type' => $type,
                    ]);
                }

                return true;
            }
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
            $resource = $this->getPaginatedModels($requests);
            $groupedResource = $resource->groupBy('type');
            return $groupedResource;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource edit data
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($industryType): mixed
    {
        try {
            $industryTypes = $this->getSingleModel($industryType);
            $categories = $this->getModelsByColumn('name', $industryTypes->name);
            return $categories;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($industryTypeId)
    {
        try {
            $industryType = DataCategory::findOrFail($industryTypeId);
            if (empty($industryType)) throw new Exception(INVALID_REQUEST);

            $industryType->delete();
            return true;
        } catch (\Exception $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $industryType): mixed
    {
        try {

            $types = $inputs['types'];
            $name  = $inputs['name'];
            $singleStage = $this->getSingleModel($industryType);

            $categories = DataCategory::where('name', $singleStage->name)->get()
                ->keyBy('type');



            if (!empty($categories)) {
                foreach ($types as $type) {
                    if (isset($categories[$type])) {
                        $categories[$type]->name = $name;
                        $categories[$type]->type = $type;
                        $categories[$type]->save();
                    } else {
                        $exists = DataCategory::where('name', $name)
                            ->where('type', $type)
                            ->exists();

                        if ($exists) {
                            throw new Exception($name . ' and type ' . $type . ' this combination already exits!');
                        }
                        DataCategory::create([
                            'name' => $name,
                            'type' => $type,
                        ]);
                    }
                }

                foreach ($categories as $type => $category) {
                    $result = in_array($type, $types);
                    if (empty($result) && $category->is_delete == '1') {
                        $category->delete();
                    }
                }

                return true;
            }
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource status change
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function industryTypeStatusChange(array $inputs): mixed
    {
        try {
            $industryTypeId = $inputs['industryTypeId'];
            $industryType = $this->getSingleModel($industryTypeId);

            if (empty($industryType)) throw new Exception(INVALID_REQUEST);

            $categories = DataCategory::where('name', $industryType->name)->get();
            foreach ($categories as $key => $category) {
                $category->is_active = $category->is_active == '1' ? '0' : '1';
                $category->save();
            }
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
