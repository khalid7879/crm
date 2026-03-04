<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Profile;
use Exception;
use App\Services\BaseModelService;
use App\Services\Tenant\CountryService;
use Illuminate\Support\Facades\Auth;
use App\Models\Tenant\User;

class TenantUserSettingService extends BaseModelService
{
    /**
     * Class instance
     *
     * @param Profile $model
     */
    public function __construct(private CountryService $countryService, Profile $model)
    {
        parent::__construct($model);
    }

    /**
     * Profile data
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function profileData($requests): mixed
    {
        return $this->getPaginatedModels($requests);
    }

    public function doResourceStore($request)
    {
        $user = Auth::user();
        $userData = User::find($user->id);
        try {
            Profile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'language'     => $request['language'],
                    'salutation'   => $request['salutation'],
                    'mobile_phone' => $request['phone'],
                    'note'         => $request['note'],
                    'time_zone'    => $request['timezone'],
                    'currency'     => $request['currency'],
                    'date_format'  => $request['dateFormat'],
                    'time_format'  => $request['timeFormat'],
                ]
            );

            if ($request['name']) {
                $user->name = $request['name'];
                $user->save();
            }

           
            $userData->address()->updateOrCreate(
                [], // morphOne, so no extra condition needed
                [
                    'country' => $request['country'],
                    'city'    => $request['city'],
                ]
            );
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => 'Updated successfully']
            ]);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    /**
     * city format for react select
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function selectFormatByCountryCity($countryCity): mixed
    {
        $cities = [];
        if (!empty($countryCity)) {
            foreach ($countryCity as $country) {
                if ($country['cities']) {
                    foreach ($country['cities'] as $key => $city) {
                        $cities[] = [
                            'value' => $city->name,
                            'label' => $city->name,
                        ];
                    }
                }
            }
        }
        return $cities;
    }
}
