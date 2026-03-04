<?php

namespace App\Http\Controllers\Tenant;

use Inertia\Inertia;
use App\Services\Tenant\TenantSearchService;
use App\Http\Controllers\BaseTenantController;

class SearchController extends BaseTenantController
{
    /***
     * SearchController constructor.
     *
     * Initializes the SearchController and merges its route names
     * into the controller's routeNames array.
     *
     * @param SearchController $tenantSearchService
     */
    public function __construct(private TenantSearchService $tenantSearchService)
    {
        // nothing else needed
    }


    public function searchData()
    {
        // dd(request()->all());
        ## Temporary maintenance placeholder
        try {
            $reportData = $this->tenantSearchService->searchReportData(request()->all());
            return Inertia::render('Tenant/SearchReport/SearchReportPage', [
                'tenant' => tenant('id'),
                'reportData' => $reportData,

            ]);
        } catch(\Throwable $th) {
            return _commonSuccessOrErrorMsg('error',$th->getMessage());
        }
    }
}
