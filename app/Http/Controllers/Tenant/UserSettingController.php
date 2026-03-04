<?php

namespace App\Http\Controllers\Tenant;


use Exception;
use Inertia\Inertia;

use Illuminate\Http\Request;
use App\Models\Tenant\Profile;
use Illuminate\Support\Facades\Auth;
use App\Models\Tenant\User;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\CountryService;
use App\Services\Tenant\TenantUserSettingService;


/**
 * @author Mamun Hossen <mamunhossen149191@gmail.com>
 */
class UserSettingController extends BaseTenantController
{

    public function __construct(private TenantUserSettingService $tenantUserSettingService, private CountryService $countryService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            [
                'userSettingsChange' => 'tenant.user-settings.show',
                'userSettingsStore'  => 'tenant.user-settings.store',
                'countryWiseCities'  => 'tenant.user-settings.country.wise.cities',
            ]
        );
    }


    /**
     * Resource data
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index(Request $request)
    {
        $datas = $this->countryService->countryDataForUserSetting();
        $user = Auth::user();
        $userData = User::with('address')->find($user->id);

        $profile = Profile::where('user_id', $user->id)->first();

        $cities = [];

        if (!empty($userData?->address?->country)) {
            $countryCity = $this->countryService->countryWiseCities([
                'countryName' => $userData->address->country
            ]);

            $cities = $this->tenantUserSettingService->selectFormatByCountryCity($countryCity);
        }

        return Inertia::render(
            'Tenant/UserSetting/UserDetailsPage',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                    'countries' => $datas['countries'],

                    'languages' => _languages(),
                    'dateFormats' => _dateFormats(),
                    'timeFormats' => _timeFormats(),

                    'salutations' => $datas['salutations'],
                    'currencies' => $datas['currencies'],
                    'timezones' => $datas['timezones'],
                    'profiles' => $profile,
                    'userData' => $userData,
                    'cities' => $cities,
                ]
            )
        );
    }

    /**
     * Resource Registration
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        // return $request->all();
        try {
            return $this->tenantUserSettingService->doResourceStore($request->all());
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage() ?: __(COMMON_MSG)],
            ]);
        }
    }

    /**
     * countryWiseInfo
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function countryWiseCities(Request $request)
    {

        try {
            $countryCity = $this->countryService->countryWiseCities($request->all());
            $cities = [];

            $cities =  $this->tenantUserSettingService->selectFormatByCountryCity($countryCity);

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'cities' => $cities]
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage(), $th->getLine() ?: __(COMMON_MSG)],
            ]);
        }
    }


    /**
     * get all currency
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function allCurrency()
    {
        try {
            $currency = $this->countryService->getAllCurrency();
            return $currency;
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

}
