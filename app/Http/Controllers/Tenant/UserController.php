<?php

namespace App\Http\Controllers\Tenant;


use Exception;
use Throwable;
use App\Models\Role;
use Inertia\Inertia;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantUserService;
use App\Http\Controllers\BaseTenantController;


/**
 * @author Mamun Hossen <mamunhossen149191@gmail.com>
 */
class UserController extends BaseTenantController
{
    /***
     * UserController constructor.
     *
     * Initializes the TenantUserService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantUserService $tenantUserService
     */

    public function __construct(private TenantUserService $tenantUserService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantUserService->getRouteNames(),
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index(Request $request)
    {
        _hasPermissionOrAbort('users-list');
        try {
            $usersList = $this->tenantUserService->resourceList([...$request->all(), 'with' => ['department', 'roles']]);
            return Inertia::render(
                'Tenant/User/UserListPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'usersList' => $usersList,
                    'filterOptions' => $request->all(),
                ]
            );
        } catch (Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * Resource create
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function create()
    {
        _hasPermissionOrAbort('users-create');
        $roles = Role::all();
        $departments = Department::all();
        return Inertia::render(
            'Tenant/User/UserCreatePage',
            [...$this->data, 'tenant' => tenant('id'), 'roles' => $roles, 'departments' => $departments]
        );
    }

    /**
     * Resource Registration
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantUserService->doResourceValidation($request->all());

        try {

            if (! $this->tenantUserService->doResourceRegistration($validatedData)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);
        } catch (Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __('Registration failed');
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * Resource edit form show
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($user)
    {
        _hasPermissionOrAbort('users-edit');
        try {
            $data = $this->tenantUserService->resourceEditData($user, ['roles', 'department']);
            return Inertia::render(
                'Tenant/User/UserEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'users' =>  $data['users'],
                    'roles' =>  $data['roles'],
                    'departments' =>  $data['departments'],
                ]
            );
        } catch (Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource update
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $user)
    {
        $validatedData = $this->tenantUserService->doResourceValidation($request->all(), id: $user, isValidatePassword: false);

        try {
            if (!$this->tenantUserService->dorResourceUpdate($validatedData, $user)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
        } catch (Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource delete process
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($user)
    {
        _hasPermissionOrAbort('users-delete');
        return $user;
        return $this->tenantUserService->userDelete($user);
    }

    /**
     * Resource status change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceStatusChange()
    {
        try {
            if (!$this->tenantUserService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
        } catch (Throwable $th) {
            return _commonSuccessOrErrorMsg('error', __($th->getMessage()));
        }
    }

    /**
     * user wise model/ information
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function userWiseModel(Request $request)
    {
        // dd(request()->all());
        try {
            $userData =  $this->tenantUserService->userWiseModel(request()->all());
            // return $userData;
            return redirect()->back()->with(['toastResponse' => ['type' => 'success', 'userData' => $userData]]);
        } catch (Throwable $th) {
            $message = $th->getMessage() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * user wise model reassign or delete
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */

    public function userReassignOrDelete()
    {
        // return request();
        try {
            if (! $this->tenantUserService->userReassignOrDelete(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', 'Successfully assigned');
        } catch (Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
