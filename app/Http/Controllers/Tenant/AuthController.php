<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Throwable;
use Inertia\Response;
use App\Models\CentralUser;
use Illuminate\Http\Request;
use App\Services\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use App\Http\Controllers\BaseTenantController;

/**
 * AuthController
 *
 * Handles all authentication-related actions for tenants in a multi-tenant application.
 * This includes user registration, email verification for both new tenant registrations and existing users,
 * login functionality, token-based verification processing, resending verification tokens, and logout.
 *
 * The controller operates within a tenant-specific context (likely using a tenancy package such as Tenancy for Laravel
 * or Stancl/Tenancy) and relies heavily on the injected {@see TenantService} to perform validation, registration,
 * verification, and login logic, keeping the controller thin and focused on routing and response handling.
 *
 * Key features:
 * - Registration flow: form display → validation & registration → email verification → automatic login upon successful verification.
 * - User verification flow: separate verification for users who need to confirm their email before accessing a tenant.
 * - Login flow: supports standard email/password login and handles cases where email verification is still required.
 * - Inertia.js integration: all form views are rendered via Inertia for a SPA-like experience.
 * - Session-based temporary storage: stores email and password during registration verification to enable auto-login.
 * - Toast notifications: uses session flash data (`toastResponse`) to communicate success/errors back to the frontend.
 * - Encrypted parameters: verification links use encrypted `type` and `email` parameters for security.
 *
 * Routes typically associated with this controller (based on route names used):
 * - GET  /register                  → showRegistrationForm
 * - POST /register                  → processRegistrationForm
 * - GET  /register/verify           → showRegistrationVerifyForm
 * - POST /register/verify           → registrationVerifyProcess
 * - GET  /user/verify/{type}/{email} → showRegistrationVerifyForm (user verify variant)
 * - POST /user/verify               → userVerifyProcess
 * - GET  /login                     → showLoginForm
 * - POST /login                     → loginProcess
 * - POST /resend-verify-token       → resendVerifyToken
 * - POST /logout                    → tenantLogout
 *
 * @package App\Http\Controllers\Tenant
 * @author  Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author  Mamun <mamunhossen149191@gmail.com>
 */
class AuthController extends BaseTenantController
{
    public function __construct(private TenantService $tenantService)
    {
        $this->data['routeNames'] = [
            'authRoute' => 'auth.google',
            'register' => 'tenant.register',
            'login' => 'tenant.login',
            'tenantStore' => 'tenant.register.process',
            'verify' => 'tenant.register.verify',
            'userVerify' => 'tenant.user.verify',
            'userVerifyProcess' => 'tenant.user.verify.process',
            'verifyProcess' => 'tenant.register.verify.process',
            'loginProcess' => 'tenant.login.process',
            'resendVerifyToken' => 'tenant.resend.verify.token',

            'forgetPassword' => 'tenant.forget.password',
            'forgetPasswordEmailValidate' => 'tenant.forget.password.email.validate',
            'setNewPassword' => 'tenant.set.new.password',
            'setNewPasswordProcess' => 'tenant.set.new.password.process',
        ];
    }

    /**
     * Show registration form
     * 
     */
    public function showRegistrationForm(): Response
    {
        return inertia('Tenant/Auth/RegistrationPage', [...$this->data]);
    }

    /**
     * Show email verification form
     * @author Mamun <mamunhossen149191@gmail.com>
     */
    public function showRegistrationVerifyForm($type = null, $email = null)
    {
        try {
            $decryptedType = $type ? decrypt($type) : null;
            $decryptedEmail = $email ? decrypt($email) : null;

            ## Map tenant inputs to register
            $tenantInputs = [
                'email' => session('VERIFY_EMAIL'),
                'password' => session('LOGIN_PASSWORD'),
                'company' => session('COMPANY'),
            ];

            ## Email check validity & verification status
            if (!empty($decryptedEmail)) {
                $emailCheck = CentralUser::where('email', $decryptedEmail)->first();

                if (!$emailCheck) {
                    throw new Exception(__('Invalid Email'));
                }

                if ($emailCheck->email_verified_at) {
                    throw new Exception(__('Already verified'));
                }
            }

            ## Show tenant inner user verification page
            if ($decryptedType === 'USER') {
                return inertia('Tenant/User/UserVerifyPage', [
                    ...$this->data,
                    'email' => $decryptedEmail,
                ]);
            }

            ## Show tenant register verification page
            return inertia('Tenant/Auth/RegistrationVerifyPage', array_merge($this->data, [
                'tenantInputs' => $tenantInputs,
            ]));
        } catch (Throwable $th) {
            return to_route('tenant.login')->with([
                'toastResponse' => [
                    'type' => 'error',
                    'message' => $th->getMessage(),
                ],
            ]);
        }
    }

    /**
     * Process the tenant registration form submission.
     *
     * Handles the initial submission of the tenant registration form. It validates the incoming request data
     * using the TenantService and, upon successful validation, stores essential information temporarily in the session
     * to facilitate the subsequent email verification step and automatic login after verification.
     *
     * Stored session data:
     * - VERIFY_EMAIL: The registered email address (used for verification page and auto-login).
     * - LOGIN_PASSWORD: The plain-text password (used for auto-login after successful verification).
     * - company: The company/tenant name (optional, for potential use in verification or post-registration steps).
     *
     * If validation fails, the user is redirected back with an error toast notification.
     * If an unexpected exception occurs, it is caught and the user is redirected back with the exception message.
     *
     * This method does not complete the registration — it only prepares for the email verification step.
     * Full registration and tenant creation occur after successful verification (typically in registrationVerifyProcess).
     *
     * @author Mamun <mamunhossen149191@gmail.com>
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request (automatically injected, containing form data)
     * @return \Illuminate\Http\RedirectResponse  Redirects back on failure or to the verification page on success
     *
     * @throws Throwable  Any exception during validation is caught and converted to an error toast response
     */
    public function processRegistrationForm()
    {
        try {
            $validated = (array) $this->tenantService->doValidate(request()->all());

            if (!$validated) {
                return redirect()->back()->with(['toastResponse' => [
                    'type' => 'error',
                    'message' => __('Validation failed'),
                ]]);
            }

            session([
                'VERIFY_EMAIL'    => $validated['email'],
                'LOGIN_PASSWORD'  => $validated['password'],
                'COMPANY'         => $validated['company'] ?? null,
            ]);

            return to_route('tenant.register.verify');
        } catch (Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => [
                    'type'    => 'error',
                    'message' => $th->getMessage() ?: __('An unexpected error occurred')
                ]
            ]);
        }
    }

    /**
     * Registration data validation process 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function registrationVerifyProcess(Request $request)
    {

        $validated = $this->tenantService->doTokenValidation($request->all());
        try {

            $result = $this->tenantService->doRegistrationVerify($validated);

            if ($result === SUCCESS) {
                $loginData = [
                    'email' => session('VERIFY_EMAIL'),
                    'password' => session('LOGIN_PASSWORD')
                ];
                return $this->doLogin($loginData);
            } else {
                throw new Exception(__(COMMON_MSG));
            }
        } catch (Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage() ?: __('Verification failed')],
            ]);
        }
    }


    public function userVerifyProcess(Request $request)
    {
        try {
            // return request()->all();
            $validated = $this->tenantService->doTokenValidation($request->all());

            $tenant = $this->tenantService->doUserVerify($validated);
            ## if(!$tenant ) throw new Exception('LOGIN_FAILED')
            if (!$tenant) {
                return redirect()->back()->with([
                    'toastResponse' => ['type' => 'error', 'message' => 'Verification or login failed.'],
                ]);
            }

            ## Ensure authenticated user after login
            $authUser = Auth::user();
            ## if(!Auth::user()) throw new Exception('LOGIN_FAILED')
            if ($authUser) {
                return redirect()->route('tenant.dashboard', [
                    $tenant->id,
                    'auth_id' => $authUser->id
                ]);
            }

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => __('Login failed after verification.')],
            ]);
        } catch (Throwable $th) {
            report($th);

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage() ?: __('Verification failed')],
            ]);
        }
    }


    /**
     * Show login form
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function showLoginForm(): Response
    {
        // print_r(array_merge($this->data, ['tenant' => tenant('id')]));
        return inertia('Tenant/Auth/LoginPage', array_merge($this->data, ['tenant' => tenant('id')]));
    }

    /**
     * Login process
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function loginProcess()
    {
        $validated = $this->tenantService->doLoginValidation(request()->all());

        try {
            return $this->doLogin($validated);
        } catch (Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => __('Login failed')],
            ]);
        }
    }

    /**
     * Process login request
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function doLogin(array $loginData)
    {
        try {
            $result = $this->tenantService->doLogin($loginData);

            if ($result === 'USER_VERIFY') {
                return to_route('tenant.user.verify');
            }

            if (!$result) {
                return redirect()->back()->with([
                    'toastResponse' => ['type' => 'error', 'message' => __('Login failed')],
                ]);
            }

            $authUser = Auth::user();

            if ($authUser) {
                return redirect()->route('tenant.dashboard', [
                    $result->id,
                    'auth_id' => $authUser->id
                ]);
            }

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => __('Login failed after tenant switch')],
            ]);
        } catch (Throwable $th) {
            report($th);
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage() ?: __('Unexpected error during login')],
            ]);
        }
    }


    /**
     * Resend verify token
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resendVerifyToken()
    {
        try {
            return $this->tenantService->resendVerifyToken(request()->all());
        } catch (Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage() ?: __('Resend verify token failed')],
            ]);
        }
    }

    /**
     * Logout process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function tenantLogout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }

    /**
     * Show forget password form
     * 
     * First time given only email
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function showForgetPasswordForm()
    {
        return inertia('Tenant/Auth/ForgetPasswordPage', array_merge($this->data, ['tenant' => tenant('id')]));
    }

    /**
     * Email validation for password reset
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function emailValidationAndSendForPasswordReset()
    {
        try {
            $validated = $this->tenantService->doEmailValidationForPasswordReset(request()->all());
            $result = $this->tenantService->sendEmailForPasswordReset($validated);
            if (!$result) throw new Exception('Email not sent');

            return redirect()->route('tenant.login')->with([
                'toastResponse' => ['type' => 'success', 'message' => 'Please check your email for password reset instructions, if an account exists', 'showPasswordResetAlert' => true],
            ]);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Show set new password form
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function setNewPasswordForm($email)
    {
        try {
            $email = $email ? decrypt($email) : null;
            ## Email check validity & verification status
            if (!empty($email)) {
                $emailCheck = CentralUser::where('email', $email)->first();

                if (!$emailCheck) {
                    throw new Exception(__('Invalid Email'));
                }

                if (!$emailCheck->email_verified_at) {
                    throw new Exception(__('Email not verified'));
                }
            }

            ## Show tenant user verification page

            return inertia('Tenant/Auth/SetNewPasswordPage', [
                ...$this->data,
                'email' => $email,
            ]);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }

    /**
     * Set new password process for user 
     *  
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function setNewPasswordProcess()
    {
        try {
            $validated = $this->tenantService->doPasswordResetValidation(request()->all());
            $tenant = $this->tenantService->doPasswordReset($validated);

            if (!$tenant) throw new Exception('Password reset failed');

            ## Ensure authenticated user after login
            $authUser = Auth::user();

            ## if(!Auth::user()) throw new Exception('LOGIN_FAILED')
            if ($authUser) {
                return redirect()->route('tenant.dashboard', [
                    $tenant->id,
                    'auth_id' => $authUser->id
                ]);
            }

            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => __('Login failed after password reset.')],
            ]);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', $th->getMessage());
        }
    }


    /**
     * Register a new tenant via API request.
     *
     * This API endpoint handles the complete registration of a new tenant (including tenant creation,
     * database setup if applicable, and primary user creation). It first validates the incoming data
     * using the TenantService. If validation fails, it redirects to the login page (suitable for
     * Inertia/SPA fallback when the request expects HTML).
     *
     * On successful registration, it returns a structured JSON success response containing the tenant data.
     * On any exception (validation errors from service, database issues, etc.), it logs the exception
     * and returns a structured JSON error response.
     *
     * Intended for API consumption (e.g., mobile apps, headless frontend, or SPA submitting via fetch/axios).
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     * @param  \Illuminate\Http\Request  $request  The incoming request containing registration data
     *                                           (typically: company/name, email, password, etc.)
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     *                                           JSON response on API success/error, or redirect on validation failure
     *
     * @throws Throwable  Exceptions are caught, logged, and returned as JSON error response
     */
    public function registerNewTenant(): JsonResponse|RedirectResponse
    {
        try {
            $validated = (array) $this->tenantService->doValidate(request()->all());

            if (!$validated) {
                return redirect()->route('tenant.register')->with([
                    'toastResponse' => [
                        'type'    => 'error',
                        'message' => __('Validation failed. Please check your input.'),
                    ],
                ]);
            }

            $tenant = $this->tenantService->doRegister($validated);

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'message' => __('Your registration was successful'),
                'data'    => $tenant,
                'error'   => null,
            ], 200);
        } catch (Throwable $th) {
            report($th);

            return response()->json([
                'success' => false,
                'status'  => 'error',
                'code'    => 500,
                'message' => __('Your registration failed'),
                'data'    => null,
                'error'   => $th->getMessage(),
            ], 500);
        }
    }
}
