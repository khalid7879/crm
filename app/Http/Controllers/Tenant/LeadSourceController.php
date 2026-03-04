<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantLeadSourceService;
use App\Http\Controllers\BaseTenantController;
use App\Models\Tenant\DataSource;

/** 
 *  @author Mamun <mamunhossen149191@gmail.com>
 */
class LeadSourceController extends BaseTenantController
{

    /***
     * LeadSourceController constructor.
     *
     * Initializes the TenantLeadSourceService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantLeadSourceService $tenantLeadSourceService
     */
    public function __construct(private TenantLeadSourceService $tenantLeadSourceService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantLeadSourceService->getRouteNames()
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {

        _hasPermissionOrAbort('lead-sources-list');
        try {
            $leadSourceList =  $this->tenantLeadSourceService->resourceList(request()->all());
            return Inertia::render(
                'Tenant/LeadSource/LeadSourceListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'leadSourceList' => $leadSourceList,
                        'filterOptions' => request()->all(),
                    ]
                )
            );
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
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
        return Inertia::render('Tenant/LeadSource/LeadSourceCreatePage', array_merge($this->data, ['tenant' => tenant('id')]));
    }

    /**
     * Resource Store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantLeadSourceService->doResourceValidation($request->all());
        try {
            if (!$this->tenantLeadSourceService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', INSERT_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * Resource edit form
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function edit($leadSource)
    {
        _hasPermissionOrAbort('lead-sources-edit');
        try {
            $leadSources =  $this->tenantLeadSourceService->resourceEditData($leadSource);
            return Inertia::render(
                'Tenant/LeadSource/LeadSourceEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'leadSources' =>  $leadSources
                ]
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
    public function update(Request $request, $leadSource)
    {
        $validatedData = $this->tenantLeadSourceService->doResourceValidation([...$request->all(), 'id' => $leadSource]);
        try {
            if (!$this->tenantLeadSourceService->doResourceUpdate($request->all(), $leadSource)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }

    /**
     * Resource delete process
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function destroy($leadSource)
    {
        _hasPermissionOrAbort('lead-sources-delete');
        try {
            if (!$this->tenantLeadSourceService->doResourceDelete($leadSource)) throw new Exception(INVALID_REQUEST);
            
            return _commonSuccessOrErrorMsg('success', DELETE_MSG);
          
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }


    /**
     * Resource status change
     *
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function leadSourceStatusChange()
    {
        try {
            if(!$this->tenantLeadSourceService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);

        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
