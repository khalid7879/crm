<?php

namespace App\Services\Tenant;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Models\Tenant\DataRating;
use App\Services\BaseModelService;

class TenantLeadRatingService extends BaseModelService
{
    /**
     * Class instance
     *
     * @param DataRating $model
     */
    public function __construct(DataRating $model)
    {
        parent::__construct($model);
    }
    /**
     * Return predefined lead rating routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return  [
            'leadRatingsList' => 'tenant.lead-ratings.index',
            'leadRatingsCreate' => 'tenant.lead-ratings.create',
            'leadRatingsStore' => 'tenant.lead-ratings.store',
            'leadRatingsEdit' => 'tenant.lead-ratings.edit',
            'leadRatingsUpdate' => 'tenant.lead-ratings.update',
            'leadRatingsDelete' => 'tenant.lead-ratings.destroy',
            'leadRatingsStatusChange' => 'tenant.lead-ratings.status.change',

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
                'name' => ['required', !isset($inputs['id']) ? 'unique:data_ratings,name' : 'unique:data_ratings,name,' . $inputs['id'], 'min:3', 'max:50'],
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
            $leadRating = [
                'name' => $inputs['name'],
                'rating' => $inputs['rating'] ?? '1',
            ];
            $leadRating =  DataRating::create($leadRating);
            return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource  list
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
    public function resourceEditData($leadRatingId): mixed
    {
        try {
            $leadRating = $this->getSingleModel($leadRatingId);
            return $leadRating;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }


    /**
     * Resource delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($leadRatingId): mixed
    {
        try {
            $leadRating = $this->getSingleModel($leadRatingId);
            if ($leadRating) {
                $leadRating->delete();
            }
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
    public function doResourceUpdate(array $inputs, $leadRating): mixed
    {
        try {

            $leadRating = $this->getSingleModel($leadRating);
            if (empty($leadRating)) throw new Exception(INVALID_REQUEST);
            
            $leadRating->name = $inputs['name'];
            $leadRating->rating = $inputs['rating'] ?? '1';
            $leadRating->save();
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
           
            $leadRatingId = $inputs['id'];
            $leadRating = $this->getSingleModel($leadRatingId);

            if ($leadRating) {
                $leadRating->is_active = $leadRating->is_active == '1' ? '0' : '1';
                $leadRating->save();
            }
           return true;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }
}
