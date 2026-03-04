<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantContactTimeService;
use App\Http\Controllers\BaseTenantController;
use App\Models\Tenant\DataContactTime;
use App\Models\Tenant\DataDesignation;

/** 
 *  @author Mamun <mamunhossen149191@gmail.com>
 */
class DataContactTimeController extends BaseTenantController
{

    /***
     * DataContactTimeController constructor.
     *
     * Initializes the TenantContactTimeService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantContactTimeService $tenantContactTimeService
     */
    public function __construct(private TenantContactTimeService $tenantContactTimeService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantContactTimeService->getRouteNames()
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {

        _hasPermissionOrAbort('data-contact-times-list');
        try {
            $contactTimeList =  $this->tenantContactTimeService->resourceList([...request()->all(), 'isPaginate' => true]);
            return Inertia::render(
                'Tenant/ContactTime/DataContactTimeListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'contactTimeList' => $contactTimeList,
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
        _hasPermissionOrAbort('data-contact-times-create');
        return Inertia::render('Tenant/ContactTime/DataContactTimeCreatePage', array_merge($this->data, ['tenant' => tenant('id')]));
    }


    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantContactTimeService->doResourceValidation($request->all());
        try {
            if (!$this->tenantContactTimeService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

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
    public function edit($contactTimeId)
    {
        _hasPermissionOrAbort('data-contact-times-edit');
        $contactTimes = DataContactTime::findOrFail($contactTimeId);
        return Inertia::render(
            'Tenant/ContactTime/DataContactTimeEditPage',
            [
                ...$this->data,
                'tenant' => tenant('id'),
                'contactTimes' =>  $contactTimes
            ]
        );
    }

    /**
     * Resource update
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function update(Request $request, $contactTimeId)
    {
        $validatedData = $this->tenantContactTimeService->doResourceValidation([...$request->all(), 'id' => $contactTimeId]);
        try {
            if (!$this->tenantContactTimeService->doResourceUpdate($request->all(), $contactTimeId)) throw new Exception(INVALID_REQUEST);

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
    public function destroy($resourceId)
    {
        _hasPermissionOrAbort('data-contact-times-delete');
        try {
            if(! $this->tenantContactTimeService->doResourceDelete($resourceId)) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', UPDATE_MSG);
           
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
    public function resourceStatusChange()
    {
        try {
            if(! $this->tenantContactTimeService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
            
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
