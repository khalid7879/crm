<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\ContactModelService;
use App\Services\Tenant\OrganizationModelService;
use Illuminate\Http\Request;
use App\Services\Tenant\TaskModelService;
use App\Services\Tenant\TenantOpportunityService;
use App\Services\Tenant\TenantProjectService;

class TenantCommonController extends BaseTenantController
{
    /**
     * Constructor
     */

    public function __construct(private TaskModelService $taskModelService, private ContactModelService $contactModelService, private TenantOpportunityService $opportunityModelService, private OrganizationModelService $organizationModelService,private TenantProjectService $tenantProjectService) {}

    /**
     * Get needed resource data for task,opportunity,organization,lead,contact creation
     */
    public function neededResource(Request $request)
    {
        $request = request()->all();
        try {
            $defaultData = [];
            if ($request['model'] == 'TASK') {
                $dependencies = $this->taskModelService->getModelDependencies(
                    fromActivity: TASK,
                    neededData: [USER, DATA_CATEGORY, DATA_PRIORITY, DATA_RELATED_TYPE, STAGE]
                );
                $defaultData = [
                    'data_priority_id' => $dependencies['dataPriorities']['default'] ?? null,
                    'data_category_id' => $dependencies['dataCategoriesForTasks']['default'] ?? null,
                    'data_related_type' => $dependencies['dataRelatedTypes']['default'] ?? null,
                    'stage_id' => $dependencies['dataStagesForTask']['default'] ?? null,
                    'owner_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'causer_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'related_to_type' => $dependencies['dataRelatedTypes']['default'] ?? null,
                    'progress_percent' => 0,
                    'is_active' => 1,
                ];
            }

            if ($request['model'] == 'CONTACT') {
                $dependencies = $this->contactModelService->getModelDependencies(fromActivity: CONTACT, neededData: [USER, SALUTATION, TAG, SOCIAL_LINK, DATA_DESIGNATION, COUNTRY, CITY]);

                $defaultData = [
                    'owner_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'causer_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'social_links' => $dependencies['dataSocial'] ?? null,
                    'salutation' => $dependencies['dataSalutations']['default'] ?? null,
                    'is_active' => 1,
                ];
            }

            if($request['model'] == 'OPPORTUNITY'){
                $dependencies = $this->opportunityModelService->getModelDependencies(
                    fromActivity: OPPORTUNITY,
                    neededData: [USER, DATA_CATEGORY, DATA_PRIORITY, DATA_REVENUE, DATA_SOURCE, STAGE, CURRENCY, ORGANIZATION]
                );
                $defaultData = [
                    'data_priority_id' => $dependencies['dataPriorities']['default'] ?? null,
                    'data_category_id' => $dependencies['dataCategoriesForOpportunities']['default'] ?? null,
                    'data_revenue_type_id' => $dependencies['dataRevenueTypes']['default'] ?? null,
                    'data_source_id' => $dependencies['dataSources']['default'] ?? null,
                    'stage_id' => $dependencies['dataStagesForOpportunities']['default'] ?? null,
                    'owner_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'causer_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'progress_percent' => @$dependencies['dataStagesForOpportunities']['list'][$dependencies['dataStagesForOpportunities']['default']]['stage_percent']   ?? null,
                    'is_active' => 1,
                ];
            }

            if($request['model'] == 'ORGANIZATION'){
                $dependencies = $this->organizationModelService->getModelDependencies(fromActivity: ORGANIZATION, neededData: [USER, TAG, SOCIAL_LINK, COUNTRY]);
                $defaultData = [
                    'owner_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'causer_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'social_links' => $dependencies['dataSocial'] ?? null,
                    'is_active' => 1,
                ];
                
            }
            if($request['model'] == 'PROJECT'){
                $dependencies = $this->tenantProjectService->getModelDependencies(
                    fromActivity: PROJECT,
                    neededData: [USER, DATA_CATEGORY, STAGE, TAG]
                );
                $defaultData = [
                    'owner_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'causer_id' => $dependencies['tenantUsers']['authUser'] ?? null,
                    'stage_id' => $dependencies['dataStagesForProject']['default'] ?? null,
                    'data_category_id' => $dependencies['dataCategoriesForProject']['default'] ?? null,
                    'is_active' => 1,
                ];
                
            }

            return response()->json([
                'status' => 'success',
                'dependencies' => $dependencies,
                'defaultData' => $defaultData,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => $th->getMessage()
            ], 500);
        }
    }
}
