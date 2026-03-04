<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;
use App\Http\Controllers\Tenant\{AuthController, CompanySettingController, ContactController, DashboardController, DataContactTimeController, SocialLinkController, DataDesignationController, DataEmpSizeController, DataRevenueController, DepartmentController, EmailSettingController, IndustryTypeController, LeadController, LeadPriorityController, LeadRatingController, StageController, ModuleController, NoteController, NotificationSettingController, OpportunityController, OrganizationController, RoleController, UserController, PermissionController, ProductController, ProjectController, TaskController, UserSettingController, AiAnalysisController, AttachmentController, ChartReportController, SearchController, TenantCommonController, LeadSourceController, ReportController};

Route::group(
    [
        'prefix' => '/{tenant}',
        'middleware' => ['web', InitializeTenancyByPath::class],
    ],
    function () {
        Route::get('/', [DashboardController::class, 'dashboard'])->name('tenant.dashboard');
        Route::middleware('auth')->group(
            function () {
                ## Logout route
                Route::post('/logout', [AuthController::class, 'tenantLogout'])->name('tenant.logout');

                ## Main operation routes
                Route::group(['as' => 'tenant.'], function () {
                    ## Leads route
                    Route::resource('leads', LeadController::class);
                    Route::post('/leads/change/stage', [LeadController::class, 'resourceChangeStage'])
                        ->name('leads.change.stage');
                    Route::get('/leads/get/LabelValueFormatted/List', [LeadController::class, 'getLabelValueFormattedList'])
                        ->name('leads.getLabelValueFormattedList');
                    Route::post('/leads/wise/dependency', [LeadController::class, 'resourceDeleteDependencyData'])
                        ->name('leads.wise.dependency');
                    Route::post('/leads/delete/with/dependency', [LeadController::class, 'resourceDeleteWithDependency'])
                        ->name('leads.delete.with.dependency');
                    Route::post('/leads/sample/data', [LeadController::class, 'resourceHandleSampleData'])
                        ->name('leads.handle.sample.data');

                    Route::get('leads/link/data', [LeadController::class, 'leadsLinkData'])
                        ->name('leads.link.data');
                    Route::post('leads/add/link', [LeadController::class, 'addLeadsLink'])
                        ->name('leads.add.link');
                    Route::post('leads/unlink', [LeadController::class, 'leadsUnlink'])
                        ->name('leads.unlink');

                    ## Opportunities route
                    Route::resource('opportunities', OpportunityController::class)->parameters([
                        'opportunity' => 'opportunity',
                    ])->names('opportunity');
                    Route::post('/opportunity/change/stage', [OpportunityController::class, 'resourceChangeStage'])
                        ->name('opportunity.change.stage');
                    Route::post('/opportunity/wise/dependency', [OpportunityController::class, 'resourceDeleteDependencyData'])
                        ->name('opportunity.wise.dependency');
                    Route::post('/opportunity/delete/with/dependency', [OpportunityController::class, 'resourceDeleteWithDependency'])
                        ->name('opportunity.delete.with.dependency');
                    Route::get('opportunity/get/LabelValueFormatted/List', [OpportunityController::class, 'getLabelValueFormattedList'])
                        ->name('opportunity.getLabelValueFormattedList');
                    Route::post('/opportunity/sample/data', [OpportunityController::class, 'resourceHandleSampleData'])
                        ->name('opportunity.handle.sample.data');

                    Route::get('opportunity/link/data', [OpportunityController::class, 'opportunityLinkData'])
                        ->name('opportunity.link.data');
                    Route::post('opportunity/add/link', [OpportunityController::class, 'addOpportunityLink'])
                        ->name('opportunity.add.link');
                    Route::post('opportunity/unlink', [OpportunityController::class, 'opportunityUnlink'])
                        ->name('opportunity.unlink');

                    ## Organizations route
                    Route::resource('organizations', OrganizationController::class)->parameters([
                        'organization' => 'organization',
                    ])->names('organization');
                    Route::post('/organization/wise/dependency', [OrganizationController::class, 'resourceDeleteDependencyData'])
                        ->name('organization.wise.dependency');
                    Route::post('/organization/delete/with/dependency', [OrganizationController::class, 'resourceDeleteWithDependency'])
                        ->name('organization.delete.with.dependency');
                    Route::get('organization/get/LabelValueFormatted/List', [OrganizationController::class, 'getLabelValueFormattedList'])
                        ->name('organization.getLabelValueFormattedList');
                    Route::post('/organization/sample/data', [OrganizationController::class, 'resourceHandleSampleData'])
                        ->name('organization.handle.sample.data');

                    Route::get('organization/link/data', [OrganizationController::class, 'organizationsLinkData'])
                        ->name('organization.link.data');
                    Route::post('organization/add/link', [OrganizationController::class, 'addOrganizationsLink'])
                        ->name('organization.add.link');
                    Route::post('organization/unlink', [OrganizationController::class, 'organizationUnlink'])
                        ->name('organization.unlink');

                    ## Tasks route
                    Route::resource('tasks', TaskController::class);
                    Route::post('tasks/change/stage-and-progress-percent', [TaskController::class, 'changeStageAndProgressPercent'])->name('tasks.changeStageAndProgressPercent');
                    Route::post('/tasks/wise/dependency', [TaskController::class, 'resourceDeleteDependencyData'])
                        ->name('tasks.wise.dependency');
                    Route::post('/tasks/delete/with/dependency', [TaskController::class, 'resourceDeleteWithDependency'])
                        ->name('tasks.delete.with.dependency');
                    Route::get('/tasks/get/LabelValueFormatted/List', [TaskController::class, 'getLabelValueFormattedList'])
                        ->name('tasks.getLabelValueFormattedList');
                    Route::post('/tasks/sample/data', [TaskController::class, 'resourceHandleSampleData'])
                        ->name('tasks.handle.sample.data');

                    ## Note route
                    Route::resource('notes', NoteController::class);

                    ## Attachment route
                    Route::resource('attachments', AttachmentController::class);
                    Route::post('/attachments/data/update', [AttachmentController::class, 'resourceUpdate'])
                        ->name('attachments.data.update');

                    ## Project route
                    Route::resource('projects', ProjectController::class);
                    Route::post('/projects/change/stage', [ProjectController::class, 'resourceChangeStage'])
                        ->name('projects.change.stage');
                    Route::post('/projects/countryId/wise/city', [ContactController::class, 'citiesByCountryId'])
                        ->name('projects.countryId.wise.city');
                    Route::post('/projects/wise/dependency', [ProjectController::class, 'resourceDeleteDependencyData'])
                        ->name('projects.wise.dependency');
                    Route::post('/projects/delete/with/dependency', [ProjectController::class, 'resourceDeleteWithDependency'])
                        ->name('projects.delete.with.dependency');
                    Route::get('projects/get/LabelValueFormatted/List', [ProjectController::class, 'getLabelValueFormattedList'])
                        ->name('projects.getLabelValueFormattedList');
                    Route::post('/projects/sample/data', [ProjectController::class, 'resourceHandleSampleData'])
                        ->name('projects.handle.sample.data');

                    Route::get('projects/link/data', [ProjectController::class, 'projectsLinkData'])
                        ->name('projects.link.data');
                    Route::post('projects/add/link', [ProjectController::class, 'addProjectsLink'])
                        ->name('projects.add.link');
                    Route::post('projects/unlink', [ProjectController::class, 'projectUnlink'])
                        ->name('projects.unlink');

                    ## Contacts route
                    Route::resource('contacts', ContactController::class);
                    Route::post('/contacts/countryId/wise/city', [ContactController::class, 'citiesByCountryId'])
                        ->name('contacts.countryId.wise.city');
                    Route::post('/contacts/wise/dependency', [ContactController::class, 'resourceDeleteDependencyData'])
                        ->name('contacts.wise.dependency');
                    Route::post('/contacts/delete/with/dependency', [ContactController::class, 'resourceDeleteWithDependency'])
                        ->name('contacts.delete.with.dependency');
                    Route::get('contacts/get/LabelValueFormatted/List', [ContactController::class, 'getLabelValueFormattedList'])
                        ->name('contacts.getLabelValueFormattedList');

                    Route::get('contacts/link/data', [ContactController::class, 'contactsLinkData'])
                        ->name('contacts.link.data');
                    Route::post('contacts/add/link', [ContactController::class, 'addContactLink'])
                        ->name('contacts.add.link');
                    Route::post('contacts/unlink', [ContactController::class, 'contactUnlink'])
                        ->name('contacts.unlink');

                    Route::get('products/link/data', [ProductController::class, 'productsLinkData'])
                        ->name('products.link.data');
                    Route::post('products/add/link', [ProductController::class, 'addProductsLink'])
                        ->name('products.add.link');
                    Route::post('products/unlink', [ProductController::class, 'productsUnLink'])
                        ->name('products.unlink');

                    Route::get('/search', [SearchController::class, 'searchData'])
                        ->name('model.search');

                    ## Reports route
                    Route::group(['prefix' => 'reports'], function () {
                        Route::get('/',  [ReportController::class, 'report'])->name('report');
                        Route::post('/report/filter/data',  [ReportController::class, 'reportFilterData'])->name('report.filter.data');
                        Route::get('/leads-all',  [ReportController::class, 'allLeadReport'])->name('leads-all.report');
                        Route::get('/leads-all/data',  [ReportController::class, 'allLeadReportData'])->name('leads-all.report.data');

                        Route::get('/leads-by-status',  [ReportController::class, 'leadByStatusReport'])->name('leads-by.status.report');
                        Route::post('/leads-by-status/data',  [ReportController::class, 'leadByStatusReportData'])->name('leads-by.status.report.data');

                        Route::get('/contacts-all',  [ReportController::class, 'allContactReport'])->name('contacts-all.report');
                        Route::get('/contacts-all/data',  [ReportController::class, 'allContactReportData'])->name('contacts-all.report.data');

                        Route::get('/tasks-all',  [ReportController::class, 'allTaskReport'])->name('tasks-all.report');
                        Route::get('/tasks-all/data',  [ReportController::class, 'allTaskReportData'])->name('tasks-all.report.data');
                        Route::get('/tasks-history/data',  [ReportController::class, 'taskHistoryData'])->name('tasks-history.data');

                        Route::get('/opportunities-all',  [ReportController::class, 'allOpportunityReport'])->name('opportunities-all.report');
                        Route::get('/opportunities-all/data',  [ReportController::class, 'allOpportunityReportData'])->name('opportunities-all.report.data');

                        Route::get('/projects-all',  [ReportController::class, 'allProjectReport'])->name('projects-all.report');
                        Route::get('/projects-all/data',  [ReportController::class, 'allProjectReportData'])->name('projects-all.report.data');

                        Route::get('/organizations-all',  [ReportController::class, 'allOrganizationReport'])->name('organizations-all.report');
                        Route::get('/organizations-all/data',  [ReportController::class, 'allOrganizationReportData'])->name('organizations-all.report.data');

                        Route::get('/users-owner-associate',  [ReportController::class, 'userOwnerAssociateReport'])->name('users-owner-associate.report');
                        Route::get('/users-owner-associate/data',  [ReportController::class, 'userOwnerAssociateReportData'])->name('users-owner-associate.report.data');

                        Route::get('/users-activity/report',  [ReportController::class, 'usersActivityReport'])->name('users-activity.report');
                        Route::get('/users-activity/report/data',  [ReportController::class, 'usersActivityReportData'])->name('users-activity.report.data');

                        Route::get('/users-activity/log',  [ReportController::class, 'userActivityLogReport'])->name('users-activity.log.report');
                        Route::get('/users-activity/log/data',  [ReportController::class, 'userActivityLogReportData'])->name('users-activity.log.report.data');
                    });
                });

                ## Business settings routes
                Route::group(['prefix' => '/setting', 'as' => 'tenant.'], function () {
                    Route::get('/', [DashboardController::class, 'showSetting'])->name('setting');
                    Route::post('/needed/data', [TenantCommonController::class, 'neededResource'])->name('needed.data');
                    Route::resources([
                        'users' => UserController::class,
                        'modules' => ModuleController::class,
                        'roles' => RoleController::class,
                        'permissions' => PermissionController::class,
                        'departments' => DepartmentController::class,
                        'products' => ProductController::class,
                        'industryTypes' => IndustryTypeController::class,
                        'lead-sources' => LeadSourceController::class,
                        'stages' => StageController::class,
                        'lead-priorities' => LeadPriorityController::class,
                        'lead-ratings' => LeadRatingController::class,
                        'data-designations' => DataDesignationController::class,
                        'notification-settings' => NotificationSettingController::class,
                        'company-settings' => CompanySettingController::class,
                        'social-links' => SocialLinkController::class,
                        'contact-times' => DataContactTimeController::class,
                        'emp-sizes' => DataEmpSizeController::class,
                        'email-setting' => EmailSettingController::class,
                        'data-revenue' => DataRevenueController::class
                    ]);

                    Route::post('email-setting/status/change', [EmailSettingController::class, 'resourceStatusChange'])
                        ->name('email-setting.change.stage');
                    Route::post('/department/status/change', [DepartmentController::class, 'departmentStatusChange'])
                        ->name('departments.status.change');
                    Route::post('/user/status/change', [UserController::class, 'resourceStatusChange'])
                        ->name('users.status.change');
                    Route::post('/user/wise/model', [UserController::class, 'userWiseModel'])
                        ->name('user.wise.model');
                    Route::post('/user/resignOr/delete', [UserController::class, 'userReassignOrDelete'])
                        ->name('user.resignOr.delete');
                    Route::get('/roles/{role}/permissions', [RoleController::class, 'permissionAssign'])
                        ->name('roles.permissions.assign');
                    Route::post('/roles/permissions/store', [RoleController::class, 'permissionAssignStore'])
                        ->name('roles.permissions.assign.Store');
                    Route::post('/roles/status/change', [RoleController::class, 'resourceStatusChange'])
                        ->name('roles.status.change');

                    Route::post('/module/status/change', [ModuleController::class, 'modulesStatusChange'])
                        ->name('modules.status.change');
                    Route::post('/product/status/change', [ProductController::class, 'productStatusChange'])
                        ->name('products.status.change');
                    Route::post('/industryType/status/change', [IndustryTypeController::class, 'industryTypeStatusChange'])
                        ->name('industryTypes.status.change');
                    Route::post('/lead-source/status/change', [LeadSourceController::class, 'leadSourceStatusChange'])
                        ->name('leadSources.status.change');
                    Route::post('/stages/status/change', [StageController::class, 'stageStatusChange'])
                        ->name('stages.status.change');
                    Route::post('/stages/order/change', [StageController::class, 'resourceOrderChange'])
                        ->name('stages.order.change');
                    Route::post('/stages/type/status/change', [StageController::class, 'stageTypeStatusChange'])
                        ->name('stages.type.status.change');
                    Route::post('/lead-priorities/stages/status/change', [LeadPriorityController::class, 'leadPriorityStatusChange'])
                        ->name('leadPriorities.status.change');
                    Route::post('/lead-ratings/status/change', [LeadRatingController::class, 'resourceStatusChange'])
                        ->name('lead-ratings.status.change');
                    Route::post('/permission/status/change', [PermissionController::class, 'permissionStatusChange'])
                        ->name('permissions.status.change');
                    Route::post('/data-designation/status/change', [DataDesignationController::class, 'resourceStatusChange'])
                        ->name('data-designations.status.change');
                    Route::post('/notification-settings/status/change', [NotificationSettingController::class, 'resourceStatusChange'])
                        ->name('notification-settings.status.change');
                    Route::post('/company-settings/status/change', [CompanySettingController::class, 'resourceStatusChange'])
                        ->name('company-settings.status.change');
                    Route::post('/social-link/status/change', [SocialLinkController::class, 'resourceStatusChange'])
                        ->name('social-links.status.change');
                    Route::post('/social-link/order/change', [SocialLinkController::class, 'resourceOrderChange'])
                        ->name('social-links.order.change');
                    Route::post('/data-contact-time/status/change', [DataContactTimeController::class, 'resourceStatusChange'])
                        ->name('contact-times.status.change');
                    Route::post('/emp-size/status/change', [DataEmpSizeController::class, 'resourceStatusChange'])
                        ->name('emp-sizes.status.change');
                    Route::post('/data-revenue/status/change', [DataRevenueController::class, 'resourceStatusChange'])
                        ->name('data-revenue.status.change');
                });

                ## User settings routes
                Route::group(['prefix' => '/user-settings', 'as' => 'tenant.user-settings.'], function () {
                    Route::resources([
                        '/' => UserSettingController::class,
                    ]);
                    Route::post('/user-settings/country/wise/city', [UserSettingController::class, 'countryWiseCities'])
                        ->name('country.wise.cities');
                });

                ## AI related routes
                Route::group(['prefix' => '/ai', 'as' => 'tenant.'], function () {
                    Route::post('model-analyses/{modelId}', [AiAnalysisController::class, 'modelAnalysesStore'])->name('model-analyses.store');
                });

                ## Reports route for chart
                Route::group(['prefix' => '/chart-reports', 'as' => 'tenant.chartReport.'], function () {
                    Route::get('/leads',  [ChartReportController::class, 'leadsChartReport'])->name('leads');
                    Route::get('/opportunities',  [ChartReportController::class, 'opportunitiesChartReport'])->name('opportunities');
                    Route::get('/organizations',  [ChartReportController::class, 'organizationsChartReport'])->name('organizations');
                    Route::get('/projects',  [ChartReportController::class, 'projectsChartReport'])->name('projects');
                    Route::get('/tasks',  [ChartReportController::class, 'tasksChartReport'])->name('tasks');
                });
            }
        );
        // Broadcast::routes(['middleware' => ['web', 'auth']]);
    }
);
