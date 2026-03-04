<?php

namespace App\Http\Controllers\Tenant;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\OrganizationModelService;
use App\Services\Tenant\TaskModelService;
use App\Services\Tenant\TenantLeadService;
use App\Services\Tenant\TenantOpportunityService;
use App\Services\Tenant\TenantProjectService;
use Throwable;

/**
 * Handles graph-related reporting for tenant dashboards.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class ChartReportController extends BaseTenantController
{
    /**
     * Inject tenant lead service.
     *
     * @param \App\Services\Tenant\TenantLeadService $tenantLeadService
     */
    public function __construct(
        private TenantLeadService $tenantLeadService,
        private TenantOpportunityService $opportunityModelServiceService,
        private OrganizationModelService $organizationModelService,
        private TenantProjectService $tenantProjectService,
        private TaskModelService $taskModelService,
    ) {}

    /**
     * Retrieve monthly lead creation statistics for graph visualization.
     *
     * This endpoint returns aggregated lead counts grouped by month,
     * formatted for dashboard charts (e.g., bar chart or line chart).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function leadsChartReport(): JsonResponse
    {
        // sleep(3);

        try {
            ## Validate incoming request
            $validated = request()->validate([
                'type' => 'required|string',
            ]);

            $chartType = $validated['type'];

            ## Fetch processed graph data
            $result = $this->tenantLeadService->getLeadsChartReport(type: $chartType);

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'message' => 'Graph report data retrieved successfully',
                'data'    => $result,
                'error' => null,
                'type'  => $chartType,
            ], 200);
        } catch (Throwable $e) {

            return response()->json(data: [
                'success' => false,
                'status'  => 'error',
                'code'    => 500,
                'message' => 'Failed to generate graph report',
                'data'    => null,
                'error'   => $e->getMessage(),
            ], status: 500);
        }
    }

    
    /**
     * Retrieve monthly lead creation statistics for graph visualization.
     *
     * This endpoint returns aggregated lead counts grouped by month,
     * formatted for dashboard charts (e.g., bar chart or line chart).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function opportunitiesChartReport(): JsonResponse
    {
        // sleep(3);

        try {
            ## Validate incoming request
            $validated = request()->validate([
                'type' => 'required|string',
            ]);

            $chartType = $validated['type'];

            ## Fetch processed graph data
            $result = $this->opportunityModelServiceService->getOpportunitiesChartReport(type: $chartType);

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'message' => 'Graph report data retrieved successfully',
                'data'    => $result,
                'error' => null,
                'type'  => $chartType,
            ], 200);
        } catch (Throwable $e) {

            return response()->json(data: [
                'success' => false,
                'status'  => 'error',
                'code'    => 500,
                'message' => 'Failed to generate graph report',
                'data'    => null,
                'error'   => $e->getMessage(),
            ], status: 500);
        }
    }


    /**
     * Retrieve monthly organization creation statistics for graph visualization.
     *
     * This endpoint returns aggregated organization counts grouped by month,
     * formatted for dashboard charts (e.g., bar chart or line chart).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function organizationsChartReport(): JsonResponse
    {
        // sleep(3);

        try {
            ## Validate incoming request
            $validated = request()->validate([
                'type' => 'required|string',
            ]);

            $chartType = $validated['type'];

            ## Fetch processed graph data
            $result = $this->organizationModelService->getOrganizationsChartReport(type: $chartType);

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'message' => 'Graph report data retrieved successfully',
                'data'    => $result,
                'error' => null,
                'type'  => $chartType,
            ], 200);
        } catch (Throwable $e) {

            return response()->json(data: [
                'success' => false,
                'status'  => 'error',
                'code'    => 500,
                'message' => 'Failed to generate graph report',
                'data'    => null,
                'error'   => $e->getMessage(),
            ], status: 500);
        }
    }

    /**
     * Retrieve monthly project creation statistics for graph visualization.
     *
     * This endpoint returns aggregated project counts grouped by month,
     * formatted for dashboard charts (e.g., bar chart or line chart).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function projectsChartReport(): JsonResponse
    {
        // sleep(3);

        try {
            ## Validate incoming request
            $validated = request()->validate([
                'type' => 'required|string',
            ]);

            $chartType = $validated['type'];

            ## Fetch processed graph data
            $result = $this->tenantProjectService->getProjectsChartReport(type: $chartType);

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'message' => 'Graph report data retrieved successfully',
                'data'    => $result,
                'error' => null,
                'type'  => $chartType,
            ], 200);
        } catch (Throwable $e) {

            return response()->json(data: [
                'success' => false,
                'status'  => 'error',
                'code'    => 500,
                'message' => 'Failed to generate graph report',
                'data'    => null,
                'error'   => $e->getMessage(),
            ], status: 500);
        }
    }

    /**
     * Retrieve monthly task creation statistics for graph visualization.
     *
     * This endpoint returns aggregated task counts grouped by month,
     * formatted for dashboard charts (e.g., bar chart or line chart).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function tasksChartReport(): JsonResponse
    {
        // sleep(3);

        try {
            ## Validate incoming request
            $validated = request()->validate([
                'type' => 'required|string',
            ]);

            $chartType = $validated['type'];

            ## Fetch processed graph data
            $result = $this->taskModelService->getTasksChartReport(type: $chartType);

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'message' => 'Graph report data retrieved successfully',
                'data'    => $result,
                'error' => null,
                'type'  => $chartType,
            ], 200);
        } catch (Throwable $e) {

            return response()->json(data: [
                'success' => false,
                'status'  => 'error',
                'code'    => 500,
                'message' => 'Failed to generate graph report',
                'data'    => null,
                'error'   => $e->getMessage(),
            ], status: 500);
        }
    }
}
