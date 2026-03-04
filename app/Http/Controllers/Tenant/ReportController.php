<?php

namespace App\Http\Controllers\Tenant;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\Tenant\TenantReportService;
use App\Http\Controllers\BaseTenantController;
use Throwable;

class ReportController extends BaseTenantController
{
    public function __construct(private TenantReportService $tenantReportService)
    {
        parent::__construct();
        $this->data['routeNames'] = array_merge(
            $this->data['routeNames'],
            $this->tenantReportService->getRouteNames()
        );
    }

    public function report()
    {
        return Inertia::render('Tenant/Report/ReportPage', array_merge($this->data, ['tenant' => tenant('id')]));
    }

    public function requestCheck($request)
    {
        if ($request->ajax()) {
            $jsonResponse =  false;
        } else {
            $jsonResponse =  true;
        }
        return $jsonResponse;
    }

    /**
     * Author: <mamunhossen149191@gmail.com>
     * All Lead Report page show
     * 
     */
    public function allLeadReport()
    {
        return Inertia::render(
            'Tenant/Report/AllLeadReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    /**
     * Author: <mamunhossen149191@gmail.com>    
     * All report filter data 
     */
    public function reportFilterData(Request $request)
    {
        try {

            $reportType = $request->input('data');

            $filterItems = [USER];

            if ($reportType === LEAD) {
                array_push($filterItems, LEAD_REPORT_HEAD, DATA_SOURCE, DATA_PRIORITY, DATA_RATING, DATA_CATEGORY, STAGE);
            }
            if ($reportType === CONTACT) {
                array_push($filterItems, CONTACT_REPORT_HEAD, TAG);
            }
            if ($reportType === TASK) {
                array_push($filterItems, TASK_REPORT_HEAD, DATA_PRIORITY);
            }
            if ($reportType === OPPORTUNITY) {
                array_push($filterItems, OPPORTUNITY_REPORT_HEAD, DATA_SOURCE, STAGE, DATA_CATEGORY);
            }
            if ($reportType === PROJECT) {
                array_push($filterItems, PROJECT_REPORT_HEAD, STAGE, DATA_CATEGORY);
            }
            if ($reportType === ORGANIZATION) {
                array_push($filterItems, ORGANIZATION_REPORT_HEAD);
            }
            if ($reportType === USER_OWNER_ASSOCIATE) {
                array_push($filterItems, USER_OWNER_ASSOCIATE_REPORT_HEAD);
            }
            if ($reportType === USER_ACTIVITY_LOG) {
                array_push($filterItems, USER_ACTIVITY_LOG_REPORT_HEAD);
            }
            $filterData = $this->tenantReportService->filterData($filterItems);

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Filter data',
                'filterData' => $filterData,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }


    public function allLeadReportData(Request $request)
    {

        try {
            $jsonResponse = $this->requestCheck($request);
            $reportData = $this->tenantReportService->allLeadReportData($request->all());

            $filter = $this->tenantReportService->filterData([LEAD_REPORT_HEAD], $request);
            $defaultColumns = $filter['defaultColumns'] ?? [];

            if ($jsonResponse) {
                return response()->json([
                    'success' => true,
                    'code'    => 200,
                    'message' => 'All lead report',
                    'reportData'    => $reportData,
                    'defaultColumns' => $defaultColumns,
                    'filterOptions' => $request->all(),
                ]);
            } else {
                return Inertia::render(
                    'Tenant/Report/AllLeadReport',
                    array_merge(
                        $this->data,
                        [
                            'tenant' => tenant('id'),
                            'reportData' => $reportData,
                            'paginationColumn' => $defaultColumns,
                            'filterOptions' => $request->all(),
                        ]
                    )
                );
            }
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }

    public function leadByStatusReport()
    {
        return Inertia::render(
            'Tenant/Report/LeadByStatusReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    public function leadByStatusReportData()
    {

        try {
            $reportData = $this->tenantReportService->leadByStatusReport(request()->all());
            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Lead by status',
                'reportData'    => $reportData,
                'requests'    => request()->all(),
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => 'Data not found',
            ]);
        }
    }
    public function allContactReport()
    {
        return Inertia::render(
            'Tenant/Report/AllContactReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    public function allContactReportData(Request $request)
    {
        try {
            $jsonResponse = $this->requestCheck($request);
            $reportData = $this->tenantReportService->allContactReportData($request->all());

            $filter = $this->tenantReportService->filterData([CONTACT_REPORT_HEAD], $request);
            $defaultColumns = $filter['defaultColumns'] ?? [];


            if ($jsonResponse) {
                return response()->json([
                    'success' => true,
                    'code'    => 200,
                    'message' => 'All contact report',
                    'reportData'    => $reportData,
                    'defaultColumns' => $defaultColumns,
                    'filterOptions' => $request->all(),
                ]);
            } else {
                return Inertia::render(
                    'Tenant/Report/AllContactReport',
                    array_merge(
                        $this->data,
                        [
                            'tenant' => tenant('id'),
                            'reportData' => $reportData,
                            'paginationColumn' => $defaultColumns,
                            'filterOptions' => $request->all(),
                        ]
                    )
                );
            }
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }

    public function allTaskReport()
    {
        return Inertia::render(
            'Tenant/Report/AllTaskReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    public function allTaskReportData(Request $request)
    {
        try {
            $jsonResponse = $this->requestCheck($request);
            $reportData = $this->tenantReportService->allTaskReportData($request->all());

            $filter = $this->tenantReportService->filterData([TASK_REPORT_HEAD], $request);
            $defaultColumns = $filter['defaultColumns'] ?? [];


            if ($jsonResponse) {
                return response()->json([
                    'success' => true,
                    'code'    => 200,
                    'message' => 'All task report',
                    'reportData'    => $reportData,
                    'defaultColumns' => $defaultColumns,
                    'filterOptions' => $request->all(),
                ]);
            } else {
                return Inertia::render(
                    'Tenant/Report/AllTaskReport',
                    array_merge(
                        $this->data,
                        [
                            'tenant' => tenant('id'),
                            'reportData' => $reportData,
                            'paginationColumn' => $defaultColumns,
                            'filterOptions' => $request->all(),
                        ]
                    )
                );
            }
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }

    public function allOpportunityReport()
    {
        return Inertia::render(
            'Tenant/Report/AllOpportunityReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    public function allOpportunityReportData(Request $request)
    {
        try {
            $jsonResponse = $this->requestCheck($request);
            $reportData = $this->tenantReportService->allOpportunityReportData($request->all());

            $filter = $this->tenantReportService->filterData([OPPORTUNITY_REPORT_HEAD, DATA_SOURCE], $request);
            $defaultColumns = $filter['defaultColumns'] ?? [];


            if ($jsonResponse) {
                return response()->json([
                    'success' => true,
                    'code'    => 200,
                    'message' => 'All task report',
                    'reportData'    => $reportData['data'] ?? [],
                    'defaultColumns' => $defaultColumns,
                    'filterOptions' => $request->all(),
                    'amountRange' => $reportData['amountRange'] ?? []
                ]);
            } else {
                return Inertia::render(
                    'Tenant/Report/AllOpportunityReport',
                    array_merge(
                        $this->data,
                        [
                            'tenant' => tenant('id'),
                            'reportData' => $reportData['data'] ?? [],
                            'paginationColumn' => $defaultColumns,
                            'filterOptions' => $request->all(),
                            'amountRange' => $reportData['amountRange'] ?? []
                        ]
                    )
                );
            }
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }

    public function allProjectReport()
    {

        return Inertia::render(
            'Tenant/Report/AllProjectReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    public function allProjectReportData(Request $request)
    {
        try {
            $jsonResponse = $this->requestCheck($request);
            $reportData = $this->tenantReportService->allProjectReportData($request->all());

            $filter = $this->tenantReportService->filterData([PROJECT_REPORT_HEAD], $request);
            $defaultColumns = $filter['defaultColumns'] ?? [];


            if ($jsonResponse) {
                return response()->json([
                    'success' => true,
                    'code'    => 200,
                    'message' => 'All project report',
                    'reportData'    => $reportData,
                    'defaultColumns' => $defaultColumns,
                    'filterOptions' => $request->all(),
                ]);
            } else {
                return Inertia::render(
                    'Tenant/Report/AllProjectReport',
                    array_merge(
                        $this->data,
                        [
                            'tenant' => tenant('id'),
                            'reportData' => $reportData,
                            'paginationColumn' => $defaultColumns,
                            'filterOptions' => $request->all(),
                        ]
                    )
                );
            }
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }

    public function allOrganizationReport()
    {
        return Inertia::render(
            'Tenant/Report/AllOrganizationReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    public function allOrganizationReportData(Request $request)
    {
        try {
            $jsonResponse = $this->requestCheck($request);
            $reportData = $this->tenantReportService->allOrganizationReportData($request->all());

            $filter = $this->tenantReportService->filterData([ORGANIZATION_REPORT_HEAD], $request);
            $defaultColumns = $filter['defaultColumns'] ?? [];


            if ($jsonResponse) {
                return response()->json([
                    'success' => true,
                    'code'    => 200,
                    'message' => 'All organization report',
                    'reportData'    => $reportData,
                    'defaultColumns' => $defaultColumns,
                    'filterOptions' => $request->all(),
                ]);
            } else {
                return Inertia::render(
                    'Tenant/Report/AllOrganizationReport',
                    array_merge(
                        $this->data,
                        [
                            'tenant' => tenant('id'),
                            'reportData' => $reportData,
                            'paginationColumn' => $defaultColumns,
                            'filterOptions' => $request->all(),
                        ]
                    )
                );
            }
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }

    /**
     * User activity report
     * 
     * Author: <mamunhossen149191@gmail.com>
     * 
     * @return \Illuminate\Http\Response
     */
    public function userOwnerAssociateReport()
    {
        return Inertia::render(
            'Tenant/Report/AllUserOwnerAssociateReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    public function userOwnerAssociateReportData(Request $request)
    {
        try {
            $jsonResponse = $this->requestCheck($request);
            $reportData = $this->tenantReportService->allUserOwnerAssociateReportData($request->all());

            $filter = $this->tenantReportService->filterData([USER_OWNER_ASSOCIATE_REPORT_HEAD], $request);
            $defaultColumns = $filter['defaultColumns'] ?? [];


            if ($jsonResponse) {
                return response()->json([
                    'success' => true,
                    'code'    => 200,
                    'message' => 'All user owner associate report',
                    'reportData'    => $reportData,
                    'defaultColumns' => $defaultColumns,
                    'filterOptions' => $request->all(),
                ]);
            } else {
                return Inertia::render(
                    'Tenant/Report/AllUserOwnerAssociateReport',
                    array_merge(
                        $this->data,
                        [
                            'tenant' => tenant('id'),
                            'reportData' => $reportData,
                            'paginationColumn' => $defaultColumns,
                            'filterOptions' => $request->all(),
                        ]
                    )
                );
            }
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }

    public function userActivityLogReport()
    {
        return Inertia::render(
            'Tenant/Report/AllUserActivityLogReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    public function userActivityLogReportData(Request $request)
    {
        try {
            $jsonResponse = $this->requestCheck($request);
            $reportData = $this->tenantReportService->allUserActivityLogReportData($request->all());

            $filter = $this->tenantReportService->filterData([USER_ACTIVITY_LOG_REPORT_HEAD], $request);
            $defaultColumns = $filter['defaultColumns'] ?? [];


            if ($jsonResponse) {
                return response()->json([
                    'success' => true,
                    'code'    => 200,
                    'message' => 'All user activity log report',
                    'reportData'    => $reportData,
                    'defaultColumns' => $defaultColumns,
                    'filterOptions' => $request->all(),
                ]);
            } else {
                return Inertia::render(
                    'Tenant/Report/AllUserActivityLogReport',
                    array_merge(
                        $this->data,
                        [
                            'tenant' => tenant('id'),
                            'reportData' => $reportData,
                            'paginationColumn' => $defaultColumns,
                            'filterOptions' => $request->all(),
                        ]
                    )
                );
            }
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }

    public function usersActivityReport()
    {
        return Inertia::render(
            'Tenant/Report/UserActivityReport',
            array_merge(
                $this->data,
                [
                    'tenant' => tenant('id'),
                ]
            )
        );
    }

    public function usersActivityReportData(Request $request)
    {
        try {
            $jsonResponse = $this->requestCheck($request);
            $reportData = $this->tenantReportService->allUserActivityReportData($request->all());


            $filter = $this->tenantReportService->filterData([USER_ACTIVITY_REPORT_HEAD], $request);
            $defaultColumns = $filter['defaultColumns'] ?? [];


            if ($jsonResponse) {
                return response()->json([
                    'success' => true,
                    'code'    => 200,
                    'message' => 'User activity report',
                    'reportData'    => $reportData,
                    'defaultColumns' => $defaultColumns,
                    'filterOptions' => $request->all(),
                ]);
            } else {
                return Inertia::render(
                    'Tenant/Report/UserActivityReport',
                    array_merge(
                        $this->data,
                        [
                            'tenant' => tenant('id'),
                            'reportData' => $reportData,
                            'paginationColumn' => $defaultColumns,
                            'filterOptions' => $request->all(),
                        ]
                    )
                );
            }
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }

    public function taskHistoryData(Request $request)
    {
        try {
            $reportData = $this->tenantReportService->taskHistoryData($request->all());
            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Task history data',
                'reportData'    => $reportData['reportData'] ?? [],
                'historySummary' => $reportData['historySummary'] ?? [],
                'subTasks' => $reportData['subTasks'] ?? [],
                'requests'    => $request->all(),
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'code'    => 200,
                'message' => $th->getMessage(),
            ]);
        }
    }
}
