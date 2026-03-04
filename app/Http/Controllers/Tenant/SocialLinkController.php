<?php

namespace App\Http\Controllers\Tenant;


use Exception;
use App\Models\Role;
use Inertia\Inertia;
use App\Models\Module;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantSocialLinkService;
use App\Http\Controllers\BaseTenantController;
use App\Models\Tenant\SocialLink;

class SocialLinkController extends BaseTenantController
{
    /***
     * SocialLinkController constructor.
     *
     * Initializes the TenantSocialLinkService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantSocialLinkService $tenantSocialLinkService
     */
    public function __construct(private TenantSocialLinkService $tenantSocialLinkService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantSocialLinkService->getRouteNames()
        );
    }


    /**
     * Resource list
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {
        _hasPermissionOrAbort('social-links-list');
        try {
            $resourceList =  $this->tenantSocialLinkService->resourceList(['orderBy' => 'order', 'orderType' => 'asc', 'isPaginate' => 0,...request()->all()]);
        
            return Inertia::render(
                'Tenant/SocialLink/SocialLinkListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'resourceList' => $resourceList
                    ]
                )
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
        
    }

    /**
     * Role form show
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function create()
    {
        _hasPermissionOrAbort('social-links-create');
        return Inertia::render(
            'Tenant/SocialLink/SocialLinkCreatePage',
            [
                ...$this->data,
                'tenant' => tenant('id'),
                'socialLinks' => _socialLinks(),
            ]
        );
    }

    /**
     * Resource store
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantSocialLinkService->doResourceValidation($request->all());
        try {
            if (!$this->tenantSocialLinkService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => INSERT_MSG],
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage(), $th->getLine() ?: __(COMMON_MSG)],
            ]);
        }
    }

    /**
     * resource edit form show
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($socialLink)
    {
        return COMMON_MSG;
        _hasPermissionOrAbort('social-links-edit');
        try {
            $socialLinks = $this->tenantSocialLinkService->resourceEditData($socialLink);
            return Inertia::render(
                'Tenant/SocialLink/SocialLinkEditPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'socialLinks' =>  $socialLinks
                    ]
                )
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
       
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $socialLink)
    {
        $validatedData = $this->tenantSocialLinkService->doResourceValidation([...$request->all(), 'id' => $socialLink]);
        try {
            if (! $this->tenantSocialLinkService->doResourceUpdate($request->all(), $socialLink)) throw new Exception(INVALID_REQUEST);
           
            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * resource delete process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($resource)
    {
        _hasPermissionOrAbort('social-links-delete');
        try {
            if(! $this->tenantSocialLinkService->resourceDelete($resource));
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'success', 'message' => DELETE_MSG],
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with([
                'toastResponse' => ['type' => 'error', 'message' => $th->getMessage(), $th->getLine() ?: __(COMMON_MSG)],
            ]);
        }
    }

    /**
     * Resource status change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceStatusChange()
    {
        try {
            if(! $this->tenantSocialLinkService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource order change
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function resourceOrderChange(Request $request)
    {
        try {

            if (!$this->tenantSocialLinkService->resourceOrderChange($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
