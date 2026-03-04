<?php

namespace App\Http\Controllers\Tenant;

use App\Models\User;
use Inertia\Inertia;
use App\Jobs\TenantUserJob;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\Tenant\TenantLeadService;
use App\Http\Controllers\BaseTenantController;

/**
 * Class DashboardController
 * 
 * @author Mamun Hossen <mamunhossen149191@gmail.com> 
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class DashboardController extends BaseTenantController
{

    public function __construct(private TenantLeadService $tenantLeadService)
    {
        parent::__construct();
        $this->data['routeNames'] = [
            ...$this->data['routeNames'],
            'chartRoutes' => [
                'leadInsights' => [
                    'key' => "leadInsights",
                    'label' => "Lead insights",
                    'icon' => "lead",
                    'isDefault' => true,
                    'route' => 'tenant.chartReport.leads',
                    'type' => [
                        ["LEADS_BY_MONTH", 'col-span-2'],
                        ["LEADS_BY_STAGES", 'col-span-1'],
                        ["LEADS_BY_SOURCE", 'col-span-1'],
                        ["LEADS_BY_TOP_OWNERS", 'col-span-2'],
                        ["LEADS_BY_CONVERSION_RATE", 'col-span-1'],
                    ]
                ],
                'opportunityInsights' => [
                    'key' => "opportunityInsights",
                    'label' => "Opportunity insights",
                    'icon' => "opportunity",
                    'isDefault' => true,
                    'route' => 'tenant.chartReport.opportunities',
                    'type' => [
                        [OPPORTUNITIES_BY_MONTH, 'col-span-2'],
                        [OPPORTUNITIES_BY_SOURCE, 'col-span-2'],
                        [OPPORTUNITIES_BY_STAGES, 'col-span-2'],
                        [OPPORTUNITIES_BY_TOP_OWNERS, 'col-span-2'],
                    ]
                ],
                'organizationInsights' => [
                    'key' => "organizationInsights",
                    'label' => "Organization insights",
                    'icon' => "organization",
                    'isDefault' => true,
                    'route' => 'tenant.chartReport.organizations',
                    'type' => [
                        [ORGANIZATIONS_BY_MONTH, 'col-span-2'],
                        [ORGANIZATIONS_BY_TOP_OWNERS, 'col-span-2'],
                    ]
                ],
                'projectInsights' => [
                    'key' => "projectInsights",
                    'label' => "Project insights",
                    'icon' => "projects",
                    'isDefault' => true,
                    'route' => 'tenant.chartReport.projects',
                    'type' => [
                        [PROJECTS_BY_MONTH, 'col-span-2'],
                        [PROJECTS_BY_TOP_OWNERS, 'col-span-2'],
                        [PROJECTS_BY_CATEGORY, 'col-span-2'],
                        [PROJECTS_BY_STAGES, 'col-span-2'],
                    ]
                ],
                'taskInsights' => [
                    'key' => "taskInsights",
                    'label' => "Task insights",
                    'icon' => "task",
                    'isDefault' => true,
                    'route' => 'tenant.chartReport.tasks',
                    'type' => [
                        [TASKS_BY_MONTH, 'col-span-2'],
                        [TASKS_BY_CATEGORY, 'col-span-2'],
                        [TASKS_BY_STAGES, 'col-span-2'],
                        [TASKS_BY_PRIORITY, 'col-span-2'],
                        [TASKS_BY_TOP_OWNERS, 'col-span-2'],
                    ]
                ]

            ],
            'chartRoutesAi' => 'tenant.chartReport.ai'
        ];
    }

    /**
     * Re login and store session data
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function dashboard(Request $request)
    {


        ## Below auth process is required for re-login via auth_id query param, do not remove it ##
        $authId = $request->query('auth_id');
        $userData = User::find($authId);

        if ($authId) {
            # Do something with $authId
            session(['auth_id' => $authId]);
            if (Auth::login($userData)) {
                request()->session()->regenerate();
            }
            session(['ACTIVE_TENANT' => 'tenant' . tenant('id')]);
            # Redirect to clean URL
            return redirect()->route('tenant.dashboard', ['tenant' => tenant('id')]);
        }


        if (!Auth::check()) {
            return redirect('/login');
        }
        // $reports = $this->tenantLeadService->getLeadsGraphReport();
        // dd($reports);
        return Inertia::render(
            'Tenant/Dashboard/DashboardPage',
            [...$this->data, 'reports' => null]
        );
    }

    /**
     * Setting page show
     * 
     *  @author Mamun <mamunhossen149191@gmail.com>
     */
    public function showSetting()
    {
        return Inertia::render('Tenant/Dashboard/SettingPage', array_merge($this->data, ['tenant' => tenant('id')]));
    }

    /**
     * User setting
     * @return \Inertia\Response
     */
    public function userSetting()
    {
        return Inertia::render('Tenant/Dashboard/UserSettingPage', array_merge($this->data, ['tenant' => tenant('id')]));
    }
}
