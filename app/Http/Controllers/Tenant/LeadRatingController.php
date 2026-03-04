<?php

namespace App\Http\Controllers\Tenant;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantLeadRatingService;
use App\Http\Controllers\BaseTenantController;
use App\Models\Tenant\DataRating;
use App\Models\Tenant\LeadRating;

/** 
 *  @author Mamun <mamunhossen149191@gmail.com>
 */
class LeadRatingController extends BaseTenantController
{


    /***
     * LeadRatingController constructor.
     *
     * Initializes the TenantLeadRatingService and merges its route names
     * into the controller's routeNames array.
     *
     * @param TenantLeadRatingService $tenantLeadRatingService
     */
    public function __construct(private TenantLeadRatingService $tenantLeadRatingService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantLeadRatingService->getRouteNames()
        );
    }

    /**
     * Resource list
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function index()
    {

        _hasPermissionOrAbort('lead-ratings-list');
        try {
            $leadRatingsList =  $this->tenantLeadRatingService->resourceList(request()->all());
            return Inertia::render(
                'Tenant/LeadRating/LeadRatingListPage',
                array_merge(
                    $this->data,
                    [
                        'tenant' => tenant('id'),
                        'leadRatingsList' => $leadRatingsList,
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
        return Inertia::render('Tenant/LeadRating/LeadRatingCreatePage', array_merge($this->data, ['tenant' => tenant('id'), 'dataRatings' => _dataRatings()]));
    }


    /**
     * Resource store
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function store(Request $request)
    {
        $validatedData = $this->tenantLeadRatingService->doResourceValidation($request->all());
        try {
            if (!$this->tenantLeadRatingService->doResourceStore($request->all())) throw new Exception(INVALID_REQUEST);

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
    public function edit($leadRating)
    {
        _hasPermissionOrAbort('lead-ratings-edit');
        try {
            $leadRatings = $this->tenantLeadRatingService->resourceEditData($leadRating);
            return Inertia::render(
                'Tenant/LeadRating/LeadRatingEditPage',
                [
                    ...$this->data,
                    'tenant' => tenant('id'),
                    'leadRatings' =>  $leadRatings,
                    'ratings' => _dataRatings()
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
    public function update(Request $request, $leadRating)
    {
        $validatedData = $this->tenantLeadRatingService->doResourceValidation([...$request->all(), 'id' => $leadRating]);
        try {
            if (!$this->tenantLeadRatingService->doResourceUpdate($request->all(), $leadRating)) throw new Exception(INVALID_REQUEST);
          
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
    public function destroy($leadRating)
    {
        _hasPermissionOrAbort('lead-ratings-delete');
        try {

            if (! $this->tenantLeadRatingService->doResourceDelete($leadRating)) throw new Exception(INVALID_REQUEST);

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
    public function resourceStatusChange()
    {
        try {
            if (! $this->tenantLeadRatingService->resourceStatusChange(request()->all())) throw new Exception(INVALID_REQUEST);

            return _commonSuccessOrErrorMsg('success', STATUS_CHANGE);
           
        } catch (\Throwable $th) {
            $message = $th->getMessage() . ' ' . $th->getLine() ?: __(COMMON_MSG);
            return _commonSuccessOrErrorMsg('error', $message);
        }
    }
}
