<?php

namespace App\Services\Tenant;

use Exception;
use App\Services\BaseModelService;
use App\Models\Tenant\DataEmailSetting;
use Illuminate\Support\Facades\Validator;


/**
 *  @author Mamun Hossen
 */
class EmailSettingModelService extends BaseModelService
{
    public function __construct(DataEmailSetting $model)
    {
        parent::__construct($model);
    }

    /**
     * Return list of predefined routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'emailSettingList' => 'tenant.email-setting.index',
            'emailSettingCreate' => 'tenant.email-setting.create',
            'emailSettingStore' => 'tenant.email-setting.store',
            'emailSettingEdit' => 'tenant.email-setting.edit',
            'emailSettingUpdate' => 'tenant.email-setting.update',
            'emailSettingDelete' => 'tenant.email-setting.destroy',
            'emailSettingChangeStage' => 'tenant.email-setting.change.stage',

        ];
    }


    /**
     * Resource list
     * 
     *  @author Mamun Hossen
     */
    public function resourceList($requests): mixed
    {
        try {
            return $this->getPaginatedModels([$requests]);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * resource store and update validation
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceValidation(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'host' => ['required', !isset($inputs['id']) ? 'unique:data_email_settings,host' : 'unique:data_email_settings,host,' . $inputs['id'], 'min:3', 'max:50'],
                'port' => ['required'],
                'password' => ['required'],
                'encryption' => ['required'],
                'userName' => ['required'],
                'mailFromAddress' => ['required'],
            ],
            [
                'host.required' => __('Host can not be empty'),
                'port.required' => __('Port can not be empty'),
                'password.required' => __('Password can not be empty'),
                'encryption.required' => __('Encryption can not be empty'),
                'userName.required' => __('User name can not be empty'),
                'mailFromAddress.required' => __('Mail from address can not be empty'),

            ]
        )->validate();
    }


    /**
     * resource store process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceStore(array $inputs)
    {

        try {
            $emailData = [
                'host' => $inputs['host'],
                'port' => $inputs['port'],
                'password' => $inputs['password'],
                'encryption' => $inputs['encryption'],
                'user_name' => $inputs['userName'],
                'mail_from_address' => $inputs['mailFromAddress'],
                'is_active' => '0',
            ];
            DataEmailSetting::create($emailData);

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * resource status change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceStatusChange($inputs)
    {
        try {
            $emailSettingId = $inputs['emailSettingId'];
            $emailData =  $this->getSingleModel($emailSettingId);
            if (empty($emailData)) throw new Exception(INVALID_REQUEST);

            DataEmailSetting::query()->update(['is_active' => '0']);
            $emailData->is_active = '1';
            $emailData->save();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }


    /**
     * Resource delete
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceDelete($emailSettingId)
    {
        try {
            $emailData =  $this->getSingleModel($emailSettingId);
            if (empty($emailData)) throw new Exception(INVALID_REQUEST);
            $emailData->delete();
            return true;
        } catch (\Exception $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource edit data
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceEditData($emailSettingId): mixed
    {
        try {
            $emailSettingData = $this->getSingleModel($emailSettingId);
            return $emailSettingData;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Resource Update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doResourceUpdate(array $inputs, $emailSettingId)
    {
        try {
            $emailData = $this->getSingleModel($emailSettingId);
            $emailData->host = $inputs['host'];
            $emailData->port = $inputs['port'];
            $emailData->password = $inputs['password'];
            $emailData->encryption = $inputs['encryption'];
            $emailData->user_name = $inputs['userName'];
            $emailData->mail_from_address = $inputs['mailFromAddress'];
            $emailData->save();

            return true;
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
