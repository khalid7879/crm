<?php

namespace App\Services\Tenant;

use Exception;
use App\Models\Role;
use App\Models\Tenant\User;
use App\Models\Tenant\Profile;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\Auth;
use App\Events\NotificationDataEvent;
use App\Services\Tenant\CountryService;
use App\Models\Tenant\NotificationEvent;
use App\Models\Tenant\NotificationSetting;

class TenantNotificationSettingService extends BaseModelService
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
     * Return predefined notification setting routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return  [
            'notificationSettingsList' => 'tenant.notification-settings.index',
            'notificationSettingsCreate' => 'tenant.notification-settings.create',
            'notificationSettingsStore' => 'tenant.notification-settings.store',
            'notificationSettingsEdit' => 'tenant.notification-settings.edit',
            'notificationSettingsUpdate' => 'tenant.notification-settings.update',
            'notificationSettingsDelete' => 'tenant.notification-settings.destroy',
            'notificationSettingsStatusChange' => 'tenant.notification-settings.status.change',
        ];
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceList()
    {
        try {
            $data = [];
            $notificationChannels = _getNotificationChanel();
            $notificationEvents = NotificationEvent::select(['id', 'name'])->get()->keyBy('id');
            $roles = Role::all()->keyBy('id');
            $eventWiseData = [];

            foreach ($roles as $roleId => $role) {
               
                $user_ids = $role->users()->pluck('id')->toArray();

                if (!empty($user_ids)) {
                    $results = NotificationSetting::whereIn('user_id', $user_ids)->get();

                    if ($results->isNotEmpty()) {
                      
                        $eventGroups = $results->groupBy('notification_event_id');
                     
                        foreach ($eventGroups as $eventId => $eventSettings) {
                            if (!isset($eventWiseData[$eventId])) {
                                $eventWiseData[$eventId] = [];
                            }

                           
                            $firstSetting = $eventSettings->first();
                            $eventWiseData[$eventId][$roleId] = [
                                SYSTEM => $firstSetting->system,
                                SMS => $firstSetting->sms,
                                EMAIL => $firstSetting->email,
                            ];
                        }
                    }
                }
            }
            $data['roles'] = $roles;
            $data['eventWiseData'] = $eventWiseData;
            $data['notificationChannels'] = $notificationChannels;
            $data['notificationEvents'] = $notificationEvents;
            return $data;
        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceStoreOrUpdate($request):mixed
    {
        // return $request;
        try {
            $data = $request['data']??[];
            $eventId = $request['eventId']??'';
            $roleId = $request['roleId']??'';
            // return @$data[$eventId][$roleId];

            $role = Role::find($roleId);
            if (!$role) throw new Exception(INVALID_REQUEST);
        
            $user_ids = $role->users()->pluck('id')->toArray();

            if (!$user_ids) throw new Exception('Not user found this role');

            foreach ($user_ids as $user_id) {
                $notification = NotificationSetting::where('user_id', $user_id)->first();

                $email  = @$data[$eventId][$roleId]['EMAIL'] ?? ($notification->email ?? 0);
                $sms    = @$data[$eventId][$roleId]['SMS'] ?? ($notification->sms ?? 0);
                $system = @$data[$eventId][$roleId]['SYSTEM'] ?? ($notification->system ?? 0);

                if ($notification) {
                    $notification->update([
                        'email' => $email,
                        'sms' => $sms,
                        'system' => $system,
                        'notification_event_id' => $eventId,
                    ]);
                } else {
                    NotificationSetting::create([
                        'user_id' => $user_id,
                        'email' => $email,
                        'sms' => $sms,
                        'system' => $system,
                        'notification_event_id' => $eventId,
                    ]);
                }
            }
            return true;

        } catch (\Throwable $th) {
            throw new Exception($th);
        }
    }

    /**
     * Notification send
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function sendNotification(){
        // $message = $request->input('message');
        // $userId = $request->input('user_id'); 
        $message = "Test notification send";
        $userId  = Auth::user()->id;
        event(new NotificationDataEvent($message, $userId));
        // broadcast(new NotificationDataEvent($message));
        // return back()->with([
        //     'toastResponse' => ['type' => 'success', 'message' => 'Notification sent!']
        // ]);
    }
}
