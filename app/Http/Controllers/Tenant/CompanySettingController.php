<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\TenantCompanySettingService;
use Throwable;

class CompanySettingController extends BaseTenantController
{
    /**
     * @author Mamun Hossen <mamunhossen149191@gmail.com>
     */
    public function __construct(private TenantCompanySettingService $tenantCompanySettingService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantCompanySettingService->getRouteNames()
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function index(Request $request)
    {
        try {
           $companySettingList =  $this->tenantCompanySettingService->resourceList($request->all());
            return Inertia::render(
                'Tenant/Company/CompanySettingListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'companySettingList' => $companySettingList,
                    ]
                )
            );
        } catch (Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource create form show
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function create()
    {
        return Inertia::render('Tenant/Company/CompanySettingCreatePage', array_merge($this->data, ['tenant' => tenant('id')]));
    }

    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function store(Request $request)
    {
        try {
           if(!$this->tenantCompanySettingService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);

        } catch (Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource delete process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($resourceId)
    {
        _hasPermissionOrAbort('company-settings-delete');
        try {
            if(!$this->tenantCompanySettingService->doResourceDelete($resourceId)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
