<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * BaseTenantController
 * -----------------------------------------------------------
 * Shared base controller for all tenant modules.
 *
 * Responsibilities:
 *  - Dynamic model binding
 *  - Unified pagination + filtering + text search
 *  - Centralized route configuration
 *  - AI route host + header parameters
 */
class BaseTenantController extends Controller
{
    ## Dynamic model instance
    protected Model $model;

    ## AI server base URL
    protected string $aiRouteHost = 'http://114.130.69.239:5010';

    ## AI server required headers
    protected array $aiRouteHeaderParams = [
        'ssh-key' => 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHBNCGRpGhKXUU3s7gTTmYZlZRze7my233wQEsGQ1fL7',
        'token'   => 'SakilV@iDevelopedSaasCrmF0riHelpKLOnMay2O25WithHelp0fKhalidV@iMamunV@iJackyV@iAbdulV@iPrantoV@i&FinallyTheKironV@i.Alhamdulillah',
    ];

    ## Shared route names + AI routes (SET INSIDE CONSTRUCTOR)
    public array $data = [];

    /**
     * Constructor
     *
     * Inject AI routes dynamically to avoid duplication.
     */
    public function __construct()
    {
        ## Build all shared tenant route names
        $this->data = [
            'routeNames' => [
                'setting'            => 'tenant.setting',
                'report'             => 'tenant.report',
                'dashboard'          => 'tenant.dashboard',
                'userSetting'        => 'tenant.user-settings.index',
                'search'             => 'tenant.model.search',
                'neededData'         => 'tenant.needed.data',

                ## AI analysis endpoint from system end
                'aiAnalysisStore'    => 'tenant.model-analyses.store',
                ## AI analysis endpoint from 3rd party API
                'aiRoutes'            => [
                    'leadAnalysis' => (string) $this->aiRouteHost . '/crm/leadanalysis',
                    'dashboardTaskAnalysis' => (string) $this->aiRouteHost . '/crm/dashboard/analyze_tasks'
                ],

                ## CRUD store routes
                'tasksStore'         => 'tenant.tasks.store',
                'contactsStore'      => 'tenant.contacts.store',
                'opportunityStore'   => 'tenant.opportunity.store',
                'organizationStore'  => 'tenant.organization.store',
                'projectsStore'      => 'tenant.projects.store',

                ## Country → City mapping
                'countryIdWiseCity'  => 'tenant.contacts.countryId.wise.city',

                ## Reports
                'reportFilterData'   => 'tenant.report.filter.data',

                ## Data-related polymorphic fetching
                'dataRelatedRoutes' => [
                    'LEAD'         => 'tenant.leads.getLabelValueFormattedList',
                    'PROJECT'      => 'tenant.projects.getLabelValueFormattedList',
                    'OPPORTUNITY'  => 'tenant.opportunity.getLabelValueFormattedList',
                    'CONTACT'      => 'tenant.contacts.getLabelValueFormattedList',
                    'ORGANIZATION' => 'tenant.organization.getLabelValueFormattedList',
                    'TASK'         => 'tenant.tasks.getLabelValueFormattedList',
                ],
            ],

            ## Expose AI Header Params so frontend can fetch them if needed
            'aiHeaders' => $this->aiRouteHeaderParams,
        ];
    }

    /**
     * Get paginated models with filtering
     *
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPaginatedModels(array $filters = []): LengthAwarePaginator
    {
        ## Extract filters with default fallback values
        $perPage    = $filters['perPage'] ?? 10;
        $orderBy    = $filters['orderBy'] ?? 'id';
        $orderType  = $filters['orderType'] ?? 'desc';
        $isActive   = $filters['isActive'] ?? '';
        $isVerified = $filters['isVerified'] ?? '';
        $gender     = $filters['gender'] ?? '';
        $textSearch = $filters['textSearch'] ?? '';
        $with       = $filters['with'] ?? '';

        return $this->model
            ## Auto eager load relations
            ->when(!empty($with), fn($query) => $query->with($with))

            ## is_active filter
            ->when($isActive !== '', fn($query)
            => $query->where('is_active', $isActive))

            ## is_verified filter
            ->when($isVerified !== '', fn($query)
            => $query->where('is_verified', $isVerified))

            ## gender filter
            ->when(!empty($gender), fn($query)
            => $query->where('gender', $gender))

            ## text search (dynamic depending on actual table)
            ->when(!empty($textSearch), function ($query) use ($textSearch) {

                $textSearch = "%$textSearch%";
                $model      = $query->getModel();
                $table      = $model->getTable();

                ## Pre-defined searchable columns
                $searchableColumns = [
                    'name',
                    'email',
                    'gender',
                    'mobile',
                    'total_deposit',
                    'win_count',
                    'win_money',
                    'ip',
                    'created_at',
                    'updated_at',
                    'body'
                ];

                ## Only allow columns that actually exist
                $validColumns = array_filter($searchableColumns, fn($column)
                => Schema::hasColumn($table, $column));

                ## Apply OR LIKE conditions
                return $query->where(function ($q) use ($validColumns, $textSearch) {
                    foreach ($validColumns as $column) {
                        $q->orWhere($column, 'like', $textSearch);
                    }
                });
            })

            ## Sorting and pagination
            ->orderBy($orderBy, $orderType)
            ->paginate($perPage)
            ->appends($filters);
    }

    /**
     * Set model instance (dynamic binding)
     *
     * @param string $model
     * @return void
     */
    protected function setModel(string $model): void
    {
        ## Auto resolve model via Laravel container
        $this->model = app($model);
    }

    /**
     * Get current model instance
     *
     * @return Model
     */
    protected function getModel(): Model
    {
        return $this->model;
    }
}
