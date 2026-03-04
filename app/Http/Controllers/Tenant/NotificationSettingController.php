<?php

namespace App\Http\Controllers\Tenant;

use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\NotificationDataEvent;
use App\Models\Tenant\NotificationSetting;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\TenantNotificationSettingService;
use Exception;

class NotificationSettingController extends BaseTenantController
{

    /***
     * NotificationSettingController constructor.
     *
     * Initializes the TenantNotificationSettingService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantNotificationSettingService $tenantNotificationSettingService
     */
    public function __construct(private TenantNotificationSettingService $tenantNotificationSettingService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantNotificationSettingService->getRouteNames()
        );
    }

    /**
     * Notification setting list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        try {
           $data = $this->tenantNotificationSettingService->resourceList();
            return Inertia::render(
                'Tenant/Notification/NotificationListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'roles' => $data['roles'],
                        'notificationChannels' => $data['notificationChannels'],
                        'eventWiseData' => $data['eventWiseData'],
                        'notificationEvents' => $data['notificationEvents'],
                    ]
                )
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
    public function resourceStatusChange(Request $request)
    {
        try {
       
           if(! $this->tenantNotificationSettingService->doResourceStoreOrUpdate($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * Notification send
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function sendNotification()
    {

       return $this->tenantNotificationSettingService->sendNotification();
        
    }
}

