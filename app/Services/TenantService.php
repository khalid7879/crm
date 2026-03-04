<?php

namespace App\Services;

use Exception;
use Carbon\Carbon;
use App\Models\Role;
use App\Models\User;
use App\Models\Tenant;
use App\Jobs\TenantUserJob;
use App\Models\CentralUser;
use Illuminate\Support\Str;
use App\Models\Tenant\Contact;
use App\Services\BaseModelService;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant\PasswordReset;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Model;
use App\Jobs\TenantUserPasswordChangeJob;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use App\Jobs\TenantRegisterEmailVerifyTokenJob;
use Mockery\Generator\StringManipulation\Pass\Pass;

/**
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class TenantService extends BaseModelService
{
    public function __construct(protected Model $model, private TenantSeederService $tenantSeederService) {}
    /**
     * Registration Validation
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doValidate(array $inputs)
    {
        return Validator::make($inputs, [
            'email' => ['required', 'email', 'unique:users,email', 'min:6', 'max:100'],
            'password' => [
                'required',
                'max:20',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
            'company' => ['required', 'max:50', 'unique:tenants,company'],
        ], [
            'email.required' => __('Must be a valid email'),
            'email.email' => __('Must be a valid email'),
            'email.max' => __('Maximum character length :max', [':max']),
            'email.min' => __('Minimum character length :min', [':min']),
            'email.unique' => __('The email has already been taken'),

            'password.required' => __('Password can not be empty'),
            'password.max' => __('Maximum character length :max', [':max']),
            'password.mixed' => __('Above field must contain at least one uppercase and one lowercase letter'),
            'password.numbers' => __('Above field must contain at least one number'),
            'password.symbols' => __('Above field must contain at least one special character'),

            'company.required' => __('Company can not be empty'),
            'company.max' => __('Maximum character length :max', [':max']),
            'company.unique' => __('Company already exists'),
        ])->validate();
    }
    public function doLoginValidation(array $inputs)
    {
        return Validator::make($inputs, [
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'min:8',
            ],
        ], [
            'email.required' => __('Must be a valid email'),
            'email.email' => __('Must be a valid email'),

            'password.required' => __('Password can not be empty'),
            'password.min' => __('Maximum character length :min', [':min']),
        ])->validate();
    }

    /** 
     * Email validation method for user password reset
     * check user email 
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doEmailValidationForPasswordReset(array $inputs)
    {
        return Validator::make(
            $inputs,
            [
                'email' => ['required', 'email', 'exists:users,email'],
            ],
            [
                'email.required' => __('Must be a valid email'),
                'email.email'    => __('Must be a valid email'),
                'email.exists'   => __('Invalid email'),
            ]
        )->validate();
    }

    /**
     * Password reset validation method for user email and password validation
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doPasswordResetValidation(array $inputs)
    {
        return Validator::make($inputs, [
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => [
                'required',
                'max:20',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
            'confirmPassword' => ['required', 'same:password'],
        ], [
            'email.required' => __('Must be a valid email'),
            'email.email'    => __('Must be a valid email'),
            'email.exists'   => __('Invalid email'),

            'password.required' => __('Password can not be empty'),
            'password.max' => __('Maximum character length :max', [':max']),
            'password.mixed' => __('Above field must contain at least one uppercase and one lowercase letter'),
            'password.numbers' => __('Above field must contain at least one number'),
            'password.symbols' => __('Above field must contain at least one special character'),
        ])->validate();
    }


    /**
     * Registration process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doRegister(array $inputs)
    {
        try {
            $emailVerifyToken = _generateUniqueEmailVerifyToken("App\Models\Tenant");
            $id  = \Illuminate\Support\Str::slug($inputs['company'], '-');
            $tenant = Tenant::create([
                'id' =>  $id,
                'company' => $inputs['company'],
                'email_verify_token' => $emailVerifyToken,
                'email_verify_start_at' => now(),
                'email_verify_expired_at' => now()->addMinutes(5),
                'name' =>  $inputs['company'],
                'email' => $inputs['email'],
                'password' => Hash::make($inputs['password']),
            ]);
            $tenant->run(function () use ($inputs, $tenant) {
                $this->tenantSeederService->roleCreate();
                $userInputs = [
                    'global_id' =>  $tenant->id,
                    'name' =>  $inputs['company'],
                    'email' => $inputs['email'],
                    'password' => $tenant->password,
                ];
                CentralUser::create($userInputs);
                $user = User::create([...$userInputs, 'is_default_admin' => true]);

                $contact = Contact::create(['email' => $user->email, 'nickname' => $user->name]);

                $user->contactUser()->sync($contact->id);

                $contact->causer_id = $contact->id;
                $contact->owner_id = $contact->id;

                $contact->save();

                $role = Role::where('name', SUPER_ADMIN)->first();
                $user->assignRole($role);
            });
            DB::table('tenant_users')->insert([
                'tenant_id' =>  $tenant->id,
                'global_user_id' => $tenant->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);


            if ($tenant) {
                dispatch((new TenantRegisterEmailVerifyTokenJob([
                    'subject' => 'Please Confirm Your Email',
                    'to' => $tenant->email,
                    'emailVerifyToken' => $emailVerifyToken,
                    'remarks' => 'Thank you for using our application!',
                ]))->onQueue('high'));

                return true;
            }
        } catch (\Throwable $th) {
            report($th);
            throw new Exception("Registration failed: " . $th->getMessage());
        }
    }

    /**
     *  Token validation process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doTokenValidation(array $inputs): array
    {
        $rules = [
            'email'       => ['required'],
            'verifyToken' => ['required', 'size:6'],
        ];

        if (array_key_exists('password', $inputs)) {
            $rules['password'] = [
                'required',
                'min:8',
                Password::min(8)->mixedCase()->numbers()->symbols(),
                'same:confirmPassword',
            ];

            $rules['confirmPassword'] = ['required'];
        }


        return Validator::make($inputs, $rules, [
            'verifyToken.size' => __('Must be exactly :size characters', [':size' => 6]),
        ])->validate();
    }

    /**
     * Registration verify process
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doRegistrationVerify(array $validateData): mixed
    {
        try {
            $verifyToken = $validateData['verifyToken'];

            if (!$verifyToken) {
                throw new Exception(__('Otp is empty'));
            }

            $tenant = Tenant::where('email_verify_token', $verifyToken)->first();

            if (!$tenant || $tenant->email_verify_token !== $verifyToken) {
                throw new Exception(__('Otp does not match'));
            }

            if (Carbon::now()->gt(Carbon::parse($tenant->email_verify_expired_at))) {
                throw new Exception(__('Otp expired'));
            }

            $email =  $tenant->email;
            if ($email) {
                $centralUser = CentralUser::where('email', $email)->first();
                $verifyAt = Carbon::now();
                $centralUser->email_verified_at = $verifyAt;
                $centralUser->is_active = '1';
                $centralUser->save();

                $tenant->email_verify_token = null;
                $tenant->email_verify_start_at = null;
                $tenant->email_verify_expired_at = null;
                $tenant->email_verified_at = $verifyAt;
                $tenant->save();
                return $tenant->run(
                    function () use ($email, $tenant) {
                        $tenantUser = User::where('email', $email)->first();
                        $tenantUser->is_active = '1';
                        $tenantUser->save();
                        dispatch(new TenantUserJob($tenant))->onQueue('high');
                        return SUCCESS;
                    }
                );
            }
            return false;
        } catch (\Throwable $th) {
            report($th);
            throw new Exception($th->getMessage());
        }
    }

    /**
     * Login process
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doLogin(array $inputs)
    {
        $guard = $inputs['guard'] ?? 'web';
        $rememberMe = $inputs['rememberMe'] ?? false;

        $email = $inputs['email'] ?? null;
        $password = $inputs['password'] ?? null;

        if (!$email || !$password) {
            throw new Exception(__('Email and password are required.'));
        }

        # Check Central User
        $centralUser = CentralUser::where('email', $email)->first();

        if (!$centralUser || !Hash::check($password, $centralUser->password)) {
            throw new Exception(__('Invalid credentials'));
        }

        $tenant = Tenant::find($centralUser->global_id);
        if (!$tenant || !$tenant->email_verified_at) {
            throw new Exception(__('The organization linked to your account no longer exists in the system'));
        }

        if (empty($centralUser->email_verified_at)) {
            $emailVerifyToken = _generateUniqueEmailVerifyToken("App\Models\User");
            if (!empty($emailVerifyToken)) {
                $centralUser->email_verify_token =  $emailVerifyToken;
                $centralUser->email_verify_start_at =  now();
                $centralUser->email_verify_expired_at =  now()->addMinutes(5);
                $centralUser->save();
                session(['VERIFY_EMAIL' => $centralUser->email]);
                session(['PASSWORD' => encrypt($password)]);
                return 'USER_VERIFY';
            }
        }

        if ($centralUser->is_active != 1) {
            throw new Exception(__('Your account is no longer active. Please contact your administrator for assistance'));
        }

        return $tenant->run(function () use ($email, $password, $guard, $rememberMe, $tenant) {
            $credentials = ['email' => $email, 'password' => $password];

            if (Auth::guard($guard)->attempt($credentials, $rememberMe)) {
                request()->session()->regenerate();
                return $tenant;
            }
        });
    }

    public function doLogout(): bool
    {
        $activeGuard = _getAuthGuardName();
        Auth::guard($activeGuard)->logout();
        return true;
    }


    /**
     * Resend verify token
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resendVerifyToken(array $inputs): mixed
    {
        try {
            $email = $inputs['email'];
            $model = $inputs['model'];
            if (!class_exists($model)) {
                throw new Exception("Model class {$model} not found.");
            }

            $userInfo = CentralUser::where('email', $email)->first();
            $emailVerifyToken = _generateUniqueEmailVerifyToken($model);
            if ($model === \App\Models\Tenant::class) {
                $resource = $model::where('id', $userInfo['global_id'])->first();
            } else {
                $resource = $model::where('email', $userInfo['email'])->first();
            }

            $resource->email_verify_token = $emailVerifyToken;
            $resource->email_verify_start_at = now();
            $resource->email_verify_expired_at = now()->addMinutes(5);
            $resource->save();
            dispatch((new TenantRegisterEmailVerifyTokenJob([
                'subject' => 'Please Confirm Your Email',
                'to' => $userInfo->email,
                'emailVerifyToken' => $emailVerifyToken,
                'remarks' => 'Thank you for using our application!',
            ]))->onQueue('high'));
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => 'Resend verify token successfully']
            ]);
        } catch (\Throwable $th) {
            throw new Exception(__($th->getLine()));
        }
        return true;
    }


    /**
     * user verify
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doUserVerify($validateData)
    {
        try {
            $verifyToken = $validateData['verifyToken'] ?? null;
            $password = $validateData['password'] ?? null;

            if (!$verifyToken) {
                throw new Exception(__('Verify token is empty'));
            }

            $centralUser = CentralUser::where('email_verify_token', $verifyToken)->first();

            if (!$centralUser) {
                throw new Exception(__('Verify token does not match'));
            }

            $centralUser->password = Hash::make($password);
            $centralUser->save();

            $tenant = Tenant::find($centralUser->global_id);

            $guard = 'web';
            $email = $centralUser->email;
            $rememberMe = false;

            return $tenant->run(function () use ($email, $password, $guard, $rememberMe, $centralUser, $tenant) {
                $tenantUser = User::with('contactUser')->where('email', $email)->first();

                $tenantUser->password = Hash::make($password);
                $tenantUser->save();

                $credentials = ['email' => $email, 'password' => $password];

                if (Auth::guard($guard)->attempt($credentials, $rememberMe)) {
                    // Update verification status
                    $centralUser->email_verify_token = null;
                    $centralUser->email_verify_start_at = null;
                    $centralUser->email_verify_expired_at = null;
                    $centralUser->email_verified_at = Carbon::now();
                    $centralUser->is_active =  '1';
                    $centralUser->save();

                    $tenantUser->is_active =  '1';
                    $tenantUser->save();

                    $contactId = null;

                    if ($tenantUser && $tenantUser->contactUser->isNotEmpty()) {
                        $contactId = $tenantUser->contactUser[0]->id;

                        $contact = Contact::find($contactId);
                        $contact->causer_id = $contact->id;
                        $contact->owner_id = $contact->id;

                        $contact->save();
                    }
                    request()->session()->regenerate();
                    return $tenant;
                } else {
                    throw new Exception(__('Login failed'));
                }
            });
        } catch (\Throwable $th) {
            report($th);
            throw new Exception(__($th->getMessage()));
        }
    }

    public function sendEmailForPasswordReset(array $inputs)
    {
        try {
            $email = $inputs['email'] ?? null;
            $centralUser = CentralUser::where('email', $email)->first();
            if (empty($email) || !$centralUser->email_verified_at) {
                throw new Exception(__('Email does not match or not verified'));
            }

            $passwordReset = PasswordReset::create([
                'email' => $inputs['email'],
                'token' => Str::random(60),
                'created_at' => now(),
            ]);
            if ($passwordReset) {
                dispatch((new TenantUserPasswordChangeJob([
                    'subject' => 'This is your password reset link',
                    'to' => $inputs['email'],
                    'link' => route('tenant.set.new.password', [
                        'email' => encrypt($email)
                    ]),
                    'remarks' => 'Thank you for using our application!',
                ]))->onQueue('high'));
                return true;
            }
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage(), ' Line: ' . $th->getLine());
        }
    }

    /**
     * user's set new password process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doPasswordReset(array $inputs)
    {
        try {

            $password = $inputs['password'] ?? null;
            $email = $inputs['email'] ?? null;

            if (empty($email) || empty($password)) {
                throw new Exception(__('Credentials are required'));
            }

            $centralUser = CentralUser::where('email', $email)->first();

            if (!$centralUser) {
                throw new Exception(__('Email does not match'));
            }

            $passwordReset = PasswordReset::where('email', $email)->latest()->first();

            if (empty($passwordReset)) {
                throw new Exception(__('Password reset token does not match'));
            }

            if ($passwordReset->updated_at) {
                throw new Exception(__('Password reset link expired'));
            }

            $centralUser->password = Hash::make($password);

            $tenant = Tenant::find($centralUser->global_id);

            $guard = 'web';
            $centralEmail = $centralUser->email;
            $rememberMe = false;

            return $tenant->run(function () use ($centralEmail, $password, $guard, $rememberMe, $centralUser, $tenant, $passwordReset) {
                $tenantUser = User::where('email', $centralEmail)->first();

                $centralUser->save();

                $tenantUser->password = Hash::make($password);
                $tenantUser->save();

                $credentials = ['email' => $centralEmail, 'password' => $password];

                $passwordReset->token = null;
                $passwordReset->updated_at = now();
                $passwordReset->save();

                if (Auth::guard($guard)->attempt($credentials, $rememberMe)) {
                    request()->session()->regenerate();
                    return $tenant;
                } else {
                    throw new Exception(__('Password reset failed'));
                }
            });
        } catch (\Throwable $th) {
            report($th);
            throw new Exception(__($th->getMessage()));
        }
    }
}
