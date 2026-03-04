<?php

namespace App\Traits;

use Exception;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Tenant\Tag;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Task;
use App\Models\Tenant\Stage;
use App\Models\Tenant\Contact;
use App\Models\Tenant\Project;
use App\Models\Tenant\DataSource;
use App\Models\Tenant\ActivityLog;
use App\Models\Tenant\ContactUser;
use App\Models\Tenant\DataCategory;
use App\Models\Tenant\Opportunity;
use App\Models\Tenant\DataPriority;
use App\Models\Tenant\DataRating;
use App\Models\Tenant\Organization;
use App\Models\Tenant\TaskHistory;

trait TenantReportTrait
{

    private function baseLeadReportQuery(array $requests)
    {
        $model = Lead::query();

        ## Date filters

        $dateField = $requests['dateField'] ?? DATE_CREATED;
        $perPage   = $requests['perPage']   ?? 10;

        $startDate = !empty($requests['startDate'])
            ? Carbon::parse($requests['startDate'])->startOfDay()
            : Carbon::today()->startOfDay();

        $endDate = !empty($requests['endDate'])
            ? Carbon::parse($requests['endDate'])->endOfDay()
            : Carbon::today()->endOfDay();

        $dateField = ($dateField == DATE_CREATED) ? 'created_at' : 'updated_at';

        ## Relations

        $model->with([
            'designations',
            'organizations',
            'owner.userReference',
            'stages',
            'sources',
            'ratings',
            'priorities',
            'categories',
            'preferableTimes',
            'socials',
            'address',
            'tasks',
            'products',
            'tags',
            'employeeSizes',
            'associates'
        ]);

        ## Apply date filter

        $model->whereBetween($dateField, [$startDate, $endDate]);

        return [$model, $perPage];
    }
    private function baseContactReportQuery(array $requests)
    {
        $model = Contact::query();

        ## Date filters

        $dateField = $requests['dateField'] ?? DATE_CREATED;
        $perPage   = $requests['perPage']   ?? 10;

        $startDate = !empty($requests['startDate'])
            ? Carbon::parse($requests['startDate'])->startOfDay()
            : Carbon::today()->startOfDay();

        $endDate = !empty($requests['endDate'])
            ? Carbon::parse($requests['endDate'])->endOfDay()
            : Carbon::today()->endOfDay();

        $dateField = ($dateField == DATE_CREATED) ? 'created_at' : 'updated_at';

        ## Relations

        $model->with([
            'designations',
            'organizations',
            'owner.userReference',
            'associates',
            'tags',
        ]);

        ## Apply date filter

        $model->whereBetween($dateField, [$startDate, $endDate]);

        return [$model, $perPage];
    }
    private function baseTaskReportQuery(array $requests)
    {
        $model = Task::query();

        ## Date filters

        $dateField = $requests['dateField'] ?? DATE_CREATED;
        $perPage   = $requests['perPage']   ?? 50;

        $startDate = !empty($requests['startDate'])
            ? Carbon::parse($requests['startDate'])->startOfDay()
            : Carbon::today()->startOfDay();

        $endDate = !empty($requests['endDate'])
            ? Carbon::parse($requests['endDate'])->endOfDay()
            : Carbon::today()->endOfDay();

        $dateField = ($dateField == DATE_CREATED) ? 'created_at' : 'updated_at';

        ## Relations

        $model->with([
            'stages',
            'priorities',
            'categories',
            'owner.userReference',
            'associates',
        ]);

        ## Apply date filter

        $model->whereBetween($dateField, [$startDate, $endDate]);

        return [$model, $perPage];
    }
    private function baseOpportunityReportQuery(array $requests)
    {
        $model = Opportunity::query();

        ## Date filters

        $dateField = $requests['dateField'] ?? DATE_CREATED;
        $perPage   = $requests['perPage']   ?? 50;

        $startDate = !empty($requests['startDate'])
            ? Carbon::parse($requests['startDate'])->startOfDay()
            : Carbon::today()->startOfDay();

        $endDate = !empty($requests['endDate'])
            ? Carbon::parse($requests['endDate'])->endOfDay()
            : Carbon::today()->endOfDay();

        $dateField = ($dateField == DATE_CREATED) ? 'created_at' : 'updated_at';

        ## Relations

        $model->with([
            'stages',
            'categories',
            'owner.userReference',
            'associates',
            'sources',
            'organizations'
        ]);

        ## Apply date filter

        $model->whereBetween($dateField, [$startDate, $endDate]);

        return [$model, $perPage];
    }
    private function baseProjectReportQuery(array $requests)
    {
        $model = Project::query();

        ## Date filters

        $dateField = $requests['dateField'] ?? DATE_CREATED;
        $perPage   = $requests['perPage']   ?? 50;

        $startDate = !empty($requests['startDate'])
            ? Carbon::parse($requests['startDate'])->startOfDay()
            : Carbon::today()->startOfDay();

        $endDate = !empty($requests['endDate'])
            ? Carbon::parse($requests['endDate'])->endOfDay()
            : Carbon::today()->endOfDay();

        $dateField = ($dateField == DATE_CREATED) ? 'created_at' : 'updated_at';

        ## Relations

        $model->with([
            'stages',
            'categories',
            'owner.userReference',
            'associates',
            'tags',
        ]);

        ## Apply date filter

        $model->whereBetween($dateField, [$startDate, $endDate]);

        return [$model, $perPage];
    }
    private function baseOrganizationReportQuery(array $requests)
    {
        $model = Organization::query();

        ## Date filters

        $dateField = $requests['dateField'] ?? DATE_CREATED;
        $perPage   = $requests['perPage']   ?? 50;

        $startDate = !empty($requests['startDate'])
            ? Carbon::parse($requests['startDate'])->startOfDay()
            : Carbon::today()->startOfDay();

        $endDate = !empty($requests['endDate'])
            ? Carbon::parse($requests['endDate'])->endOfDay()
            : Carbon::today()->endOfDay();

        $dateField = ($dateField == DATE_CREATED) ? 'created_at' : 'updated_at';

        ## Relations

        $model->with([
            'owner.userReference',
            'associates',
            'tags',
        ]);

        ## Apply date filter

        $model->whereBetween($dateField, [$startDate, $endDate]);

        return [$model, $perPage];
    }
    private function baseUserOwnerAssociateReportQuery(array $requests)
    {
        $model = Contact::query();

        ## Date filters

        $dateField = $requests['dateField'] ?? DATE_CREATED;
        $perPage   = $requests['perPage']   ?? 50;

        $startDate = !empty($requests['startDate'])
            ? Carbon::parse($requests['startDate'])->startOfDay()
            : Carbon::today()->startOfDay();

        $endDate = !empty($requests['endDate'])
            ? Carbon::parse($requests['endDate'])->endOfDay()
            : Carbon::today()->endOfDay();

        $dateField = ($dateField == DATE_CREATED) ? 'created_at' : 'updated_at';

        ## Relations

        $model->with([
            'organizations',
            'leads',
            'opportunity',
            'contacts',
            'projects',
            'owner.userReference',
            'taskAssociate',
            'noteAssociate',
            'leadOwner',
            'opportunityOwner',
            'contactOwner',
            'projectOwner',
            'organizationOwner',
            'taskOwner',
            'noteOwner',
        ]);

        ## Apply date filter

        $model->whereBetween($dateField, [$startDate, $endDate]);

        return [$model, $perPage];
    }

    private function baseUserActivityReportQuery(array $requests)
    {
        $model = Contact::query();

        ## Date filters

        $dateField = $requests['dateField'] ?? DATE_CREATED;
        $perPage   = $requests['perPage']   ?? 50;

        $startDate = !empty($requests['startDate'])
            ? Carbon::parse($requests['startDate'])->startOfDay()
            : Carbon::today()->startOfDay();

        $endDate = !empty($requests['endDate'])
            ? Carbon::parse($requests['endDate'])->endOfDay()
            : Carbon::today()->endOfDay();

        $dateField = ($dateField == DATE_CREATED) ? 'created_at' : 'updated_at';

        ## Relations

        $model->with([
            'leadCauser',
            'taskCauser',
            'contactCauser',
            'opportunityCauser',
            'organizationCauser',
            'projectCauser',
            'noteCauser',
            'userReference',
        ]);

        ## Apply date filter

        $model->whereBetween($dateField, [$startDate, $endDate]);

        return [$model, $perPage];
    }

    private function baseUserActivityLogReportQuery(array $requests)
    {
        $model = ActivityLog::query();

        ## Date filters

        $dateField = $requests['dateField'] ?? DATE_CREATED;
        $perPage   = $requests['perPage']   ?? 50;

        $startDate = !empty($requests['startDate'])
            ? Carbon::parse($requests['startDate'])->startOfDay()
            : Carbon::today()->startOfDay();

        $endDate = !empty($requests['endDate'])
            ? Carbon::parse($requests['endDate'])->endOfDay()
            : Carbon::today()->endOfDay();

        $dateField = ($dateField == DATE_CREATED) ? 'created_at' : 'updated_at';

        $model->with([
            'causerContact',
        ]);

        $model->whereBetween($dateField, [$startDate, $endDate]);

        return [$model, $perPage];
    }

    private function baseTaskHistoryActivityReportQuery(array $requests)
    {
        $taskId = $requests['taskId'] ?? null;

        $model =  TaskHistory::query()
            ->where('task_id', $taskId)
            ->with([
                'stages',
                'priorities',
                'categories',
                'owner.userReference',
                'associates',

            ]);
        return $model
            ->orderBy('created_at', 'desc')
            ->get();
    }
    private function baseSubActivityReportQuery(array $requests)
    {
        $taskId = $requests['taskId'] ?? null;

        $model = Task::with([
            'tasks',
            'tasks.stages',
            'tasks.categories',
            'tasks.priorities',
        ])->find($taskId);

        return $model;
    }



    public function getAllLeadReport(array $requests)
    {
        try {
            [$model, $perPage] = $this->baseLeadReportQuery($requests);

            $orderBy   = $requests['orderBy']   ?? 'id';
            $orderType   = $requests['orderType']   ?? 'asc';

            if (isset($requests['owner']) && !empty($requests['owner'])) {
                $model->where('owner_id', $requests['owner']);
            }
            if (isset($requests['dataSource']) && !empty($requests['dataSource'])) {
                $model->whereHas('sources', function ($q) use ($requests) {
                    $q->where('data_source_id', $requests['dataSource']);
                });
            }
            if (isset($requests['dataPriority']) && !empty($requests['dataPriority'])) {
                $model->whereHas('priorities', function ($q) use ($requests) {
                    $q->where('data_priority_id', $requests['dataPriority']);
                });
            }
            if (isset($requests['dataRating']) && !empty($requests['dataRating'])) {
                $model->whereHas('ratings', function ($q) use ($requests) {
                    $q->where('data_rating_id', $requests['dataRating']);
                });
            }
            if (isset($requests['stage']) && !empty($requests['stage'])) {
                $model->whereHas('stages', function ($q) use ($requests) {
                    $q->where('stage_id', $requests['stage']);
                });
            }
            if (isset($requests['dataCategory']) && !empty($requests['dataCategory'])) {
                $model->whereHas('categories', function ($q) use ($requests) {
                    $q->where('data_category_id', $requests['dataCategory']);
                });
            }
            if (isset($requests['isActive']) && $requests['isActive']) {
                $model->where('is_active', $requests['isActive']);
            }


            $model->orderBy($orderBy, $orderType);

            return $model->paginate($perPage)->appends($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    public function getAllContactReport(array $requests)
    {
        try {
            [$model, $perPage] = $this->baseContactReportQuery($requests);

            $orderBy   = $requests['orderBy']   ?? 'id';
            $orderType   = $requests['orderType']   ?? 'asc';

            if (isset($requests['owner']) && !empty($requests['owner'])) {
                $model->where('owner_id', $requests['owner']);
            }
            if (isset($requests['dataTag']) && !empty($requests['dataTag'])) {
                $model->whereHas('tags', function ($q) use ($requests) {
                    $q->where('tag_id', $requests['dataTag']);
                });
            }
            if ($requests['isActive']) {
                $model->where('is_active', $requests['isActive']);
            }

            $model->orderBy($orderBy, $orderType);

            return $model->paginate($perPage)->appends($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    public function getAllTaskReport(array $requests)
    {
        try {
            [$model, $perPage] = $this->baseTaskReportQuery($requests);

            $orderBy   = $requests['orderBy']   ?? 'id';
            $orderType   = $requests['orderType']   ?? 'asc';

            if (isset($requests['owner']) && !empty($requests['owner'])) {
                $model->where('owner_id', $requests['owner']);
            }
            if (isset($requests['dataPriority']) && !empty($requests['dataPriority'])) {
                $model->whereHas('priorities', function ($q) use ($requests) {
                    $q->where('data_priority_id', $requests['dataPriority']);
                });
            }


            $model->orderBy($orderBy, $orderType);

            return $model->paginate($perPage)->appends($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
    public function getAllOpportunityReport(array $requests)
    {
        try {
            [$model, $perPage] = $this->baseOpportunityReportQuery($requests);

            $orderBy   = $requests['orderBy']   ?? 'id';
            $orderType   = $requests['orderType']   ?? 'asc';

            if (isset($requests['owner']) && !empty($requests['owner'])) {
                $model->where('owner_id', $requests['owner']);
            }
            if (isset($requests['dataSource']) && !empty($requests['dataSource'])) {
                $model->whereHas('sources', function ($q) use ($requests) {
                    $q->where('data_source_id', $requests['dataSource']);
                });
            }
            if (isset($requests['stage']) && !empty($requests['stage'])) {
                $model->whereHas('stages', function ($q) use ($requests) {
                    $q->where('stage_id', $requests['stage']);
                });
            }
            if (isset($requests['opportunityValue']) && !empty($requests['opportunityValue'])) {
                if ($requests['opportunityValue'] == 'HIGH') {
                    $model->orderBy('amount', 'desc');
                }
                if ($requests['opportunityValue'] == 'LOW') {
                    $model->orderBy('amount', 'asc');
                }
            }
            if (isset($requests['amountRange']) && $requests['amountRange']) {
                $min = $requests['amountRange']['minAmount'];
                $max = $requests['amountRange']['maxAmount'];
                $model->whereBetween('amount', [$min, $max]);
            }
            if (isset($requests['isActive']) && $requests['isActive']) {
                $model->where('is_active', $requests['isActive']);
            }

            if (isset($requests['overdueStatus']) && !empty($requests['overdueStatus'])) {

                if ($requests['overdueStatus'] === 'ONLY_OVERDUE') {
                    $model->where(function ($q) {
                        $q->whereNotNull('date_forecast')
                            ->whereDate('date_forecast', '<', now())
                            ->where(function ($q2) {
                                $q2->whereNull('date_close')
                                    ->orWhereColumn('date_forecast', '<', 'date_close');
                            });
                    });
                }

                if ($requests['overdueStatus'] === 'WITH_OUT_OVERDUE') {
                    $model->where(function ($q) {
                        $q->where(function ($q2) {
                            $q2->whereNull('date_forecast')
                                ->orWhereDate('date_forecast', '>=', now())
                                ->orWhereColumn('date_forecast', '>=', 'date_close');
                        });
                    });
                }
            }
            if (isset($requests['dataCategory']) && !empty($requests['dataCategory'])) {
                $model->whereHas('categories', function ($q) use ($requests) {
                    $q->where('data_category_id', $requests['dataCategory']);
                });
            }

            $model->orderBy($orderBy, $orderType);

            $data = $model->paginate($perPage)->appends($requests);
            $amountRange['minAmount'] =  Opportunity::min('amount') ?? 0;
            $amountRange['maxAmount'] =  Opportunity::max('amount') ?? 0;

            return ['data' => $data, 'amountRange' => $amountRange];
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
    public function getAllProjectReport(array $requests)
    {
        try {
            [$model, $perPage] = $this->baseProjectReportQuery($requests);

            $orderBy   = $requests['orderBy']   ?? 'id';
            $orderType   = $requests['orderType']   ?? 'asc';

            if (isset($requests['owner']) && !empty($requests['owner'])) {
                $model->where('owner_id', $requests['owner']);
            }
            if (isset($requests['isActive']) && $requests['isActive']) {
                $model->where('is_active', $requests['isActive']);
            }
            if (isset($requests['stage']) && !empty($requests['stage'])) {
                $model->whereHas('stages', function ($q) use ($requests) {
                    $q->where('stage_id', $requests['stage']);
                });
            }
            if (isset($requests['dataCategory']) && !empty($requests['dataCategory'])) {
                $model->whereHas('categories', function ($q) use ($requests) {
                    $q->where('data_category_id', $requests['dataCategory']);
                });
            }

            $model->orderBy($orderBy, $orderType);

            return $model->paginate($perPage)->appends($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }


    public function getLeadByStatusReport(array $requests)
    {
        try {

            [$model, $perPage] = $this->baseLeadReportQuery($requests);

            ## Apply lead status filter
            if ($requests['isActive'] != null) {
                $model->where('is_active', $requests['isActive']);
            }

            return $model->paginate($perPage);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    public function getAllOrganizationReport(array $requests)
    {
        try {
            [$model, $perPage] = $this->baseOrganizationReportQuery($requests);

            $orderBy   = $requests['orderBy']   ?? 'id';
            $orderType = $requests['orderType']   ?? 'asc';

            if ($requests['isActive'] != null) {
                $model->where('is_active', $requests['isActive']);
            }

            $model->orderBy($orderBy, $orderType);

            return $model->paginate($perPage)->appends($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    public function getAllUserOwnerAssociateReport(array $requests)
    {
        try {
            [$model, $perPage] = $this->baseUserOwnerAssociateReportQuery($requests);

            $orderBy   = $requests['orderBy']   ?? 'id';
            $orderType   = $requests['orderType']   ?? 'asc';

            if ($requests['isActive'] != null) {
                $model->where('is_active', $requests['isActive']);
            }
            if (isset($requests['owner']) && !empty($requests['owner'])) {
                $model->where('owner_id', $requests['owner']);
            }

            $model->orderBy($orderBy, $orderType);

            return $model->paginate($perPage)->appends($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line no: ' . $th->getLine());
        }
    }

    public function getAllUserActivityLogReport(array $requests)
    {
        try {
            [$model, $perPage] = $this->baseUserActivityLogReportQuery($requests);

            $orderBy   = $requests['orderBy']   ?? 'id';
            $orderType   = $requests['orderType']   ?? 'asc';

            if (isset($requests['owner']) && !empty($requests['owner'])) {
                $userId = ContactUser::where('contact_id', $requests['owner'])
                    ->value('user_id');

                if ($userId) {
                    $model->where('causer_id', $userId);
                }
            }

            $model->orderBy($orderBy, $orderType);

            return $model->paginate($perPage)->appends($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line no: ' . $th->getLine());
        }
    }

    public function getAllUserActivityReport(array $requests)
    {
        try {
            [$model, $perPage] = $this->baseUserActivityReportQuery($requests);

            $orderBy   = $requests['orderBy']   ?? 'id';
            $orderType = $requests['orderType']   ?? 'asc';

            $model->whereHas('userReference', function ($q) {
                $q->where('is_active', 1);
            });
            $model->orderBy($orderBy, $orderType);

            return $model->paginate($perPage)->appends($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    public function getTaskHistoryData(array $requests)
    {
        try {
            if (empty($requests['taskId'])) {
                return null;
            }

            $model = $this->baseTaskHistoryActivityReportQuery($requests);
            $subTasks = $this->baseSubActivityReportQuery($requests);

            ## Data retrieve by desc that means last updated data first
            $last = $model->first();

            ## Data retrieve by desc that means first created data last
            $first = $model->last();

            $historySummary = [];


            if ($first) {
                $historySummary['primary'][] =   [
                    'label' => 'Task owner',
                    'value' => $first->owner->nickname ?? '',
                    'icon'  => 'usersOwner',
                ];
                $historySummary['primary'][] = [
                    'label' => 'Created at',
                    'value' => $first->model_time['create_formatted'] ?? '',
                    'icon'  => 'date',
                ];
            }
            if ($last) {
                $historySummary['primary'][]  =   [
                    'label' => 'Last updated at',
                    'value' => $last->model_time['update_formatted'] ?? '',
                    'icon'  => 'date',
                ];
            }
            if ($model) {
                $historySummary['primary'][]  =   [
                    'label' => 'Total task history',
                    'value' => $model->count(),
                    'icon'  => 'history',
                ];;
            }

            return ['reportData' => $model, 'historySummary' => $historySummary, 'subTasks' => $subTasks->tasks ?? []];
        } catch (\Throwable $th) {
            throw new Exception(
                $th->getMessage() . ' Line: ' . $th->getLine()
            );
        }
    }


    public function getFilterData($neededData = [])
    {
        $tenantUser     = [];
        $defaultColumns = [];
        $dataSources    = [];
        $dataCategories = [];
        $dataRatings    = [];
        $allColumns     = [];
        $dataPriorities = [];
        $dataTags       = [];
        $dataStages     = [];

        if (in_array(USER, $neededData)) {
            $users = User::with([
                'contactReference'
            ])->select('id', 'name')->get();
            $tenantUser = $users->map(function ($user) {
                return [
                    'label' => $user['name'] ?? null,
                    'value' => $user->get_contact_reference['id'] ?? null,
                ];
            });
        }
        if (in_array(DATA_SOURCE, $neededData)) {
            $sources = DataSource::select('id', 'name')->get();
            $dataSources = $sources->map(function ($source) {
                return [
                    'label' => $source->name ?? null,
                    'value' =>  $source->id ?? null,
                ];
            });
        }
        if (in_array(DATA_PRIORITY, $neededData)) {
            $priorities = DataPriority::select('id', 'name')->get();
            $dataPriorities = $priorities->map(function ($priority) {
                return [
                    'label' => $priority->name ?? null,
                    'value' =>  $priority->id ?? null,
                ];
            });
        }
        if (in_array(DATA_CATEGORY, $neededData)) {
            $categories = DataCategory::select('id', 'name', 'type')->get();

            $dataCategories = $categories->groupBy('type')->map(function ($items) {
                return $items->map(function ($category) {
                    return [
                        'label' => $category->name,
                        'value' => $category->id,
                    ];
                })->values();
            });
        }
        if (in_array(DATA_RATING, $neededData)) {
            $ratings = DataRating::select('id', 'name')->get();
            $dataRatings = $ratings->map(function ($rating) {
                return [
                    'label' => $rating->name ?? null,
                    'value' =>  $rating->id ?? null,
                ];
            });
        }
        if (in_array(TAG, $neededData)) {
            $tags = Tag::select('id', 'name')->get();
            $dataTags = $tags->map(function ($tag) {
                return [
                    'label' => $tag->name ?? null,
                    'value' =>  $tag->id ?? null,
                ];
            });
        }
        if (in_array(STAGE, $neededData)) {
            $stages = Stage::select('id', 'label', 'type')->get();

            $dataStages = $stages->groupBy('type')->map(function ($items) {
                return $items->map(function ($stage) {
                    return [
                        'label' => $stage->label,
                        'value' => $stage->id,
                    ];
                })->values();
            });
        }

        if (in_array(LEAD_REPORT_HEAD, $neededData)) {
            $defaultColumns = [
                ["key" => "nickname", "label" => "Name"],
                ["key" => "get_designation.name", "label" => "Title"],
                ["key" => "mobile_phone", "label" => "Phone"],
                ["key" => "email", "label" => "Email"],
                ["key" => "details", "label" => "Details"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
            ];
            $allColumns = [
                [
                    ["key" => "nickname", "label" => "Name"],
                    ["key" => "get_designation.name", "label" => "Title"],
                    ["key" => "mobile_phone", "label" => "Phone"],
                    ["key" => "email", "label" => "Email"],
                    ["key" => "details", "label" => "Details"],
                    ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                    ["key" => "get_organization.name", "label" => "Organization"],
                    ["key" => "get_lead_source.name", "label" => "Source"],
                    ["key" => "get_lead_rating.name", "label" => "Rating"],
                    ["key" => "get_lead_priority.name", "label" => "Priority"],
                    ["key" => "get_last_stage.label", "label" => "Stage status"],
                    ["key" => "get_category.name", "label" => "Category"],
                    ["key" => "model_time.create_diff", "label" => "Time"],
                    ["key" => "model_time.create_date_only", "label" => "Create at"],
                ]
            ];
        }
        if (in_array(CONTACT_REPORT_HEAD, $neededData)) {
            $defaultColumns = [
                ["key" => "nickname", "label" => "Name"],
                ["key" => "first_name", "label" => "First name"],
                ["key" => "last_name", "label" => "Last Name"],
                ["key" => "mobile_number", "label" => "Phone"],
                ["key" => "email", "label" => "Email"],
                ["key" => "details", "label" => "Details"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
            ];
            $allColumns = [
                ["key" => "nickname", "label" => "Name"],
                ["key" => "first_name", "label" => "First name"],
                ["key" => "last_name", "label" => "Last Name"],
                ["key" => "mobile_number", "label" => "Phone"],
                ["key" => "email", "label" => "Email"],
                ["key" => "details", "label" => "Details"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
                ["key" => "dob", "label" => "Date of birth"],
                ["key" => "get_deleted_status", "label" => "Deletable"],
                ["key" => "get_designation.name", "label" => "Title"],
                ["key" => "get_tags", "label" => "Tag"],
            ];
        }
        if (in_array(TASK_REPORT_HEAD, $neededData)) {
            $defaultColumns = [
                ["key" => "name", "label" => "Name"],
                ["key" => "details", "label" => "Details"],
                ["key" => "date_start", "label" => "Start date"],
                ["key" => "date_reminder", "label" => "Reminder date"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
            ];
            $allColumns = [
                ["key" => "name", "label" => "Name"],
                ["key" => "details", "label" => "Details"],
                ["key" => "date_start", "label" => "Start date"],
                ["key" => "date_reminder", "label" => "Start reminder"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
                ["key" => "get_status", "label" => "Status"],
                ["key" => "get_category_name.name", "label" => "Category"],
                ["key" => "get_task_priority.name", "label" => "Priority"],
                ["key" => "get_associates_name", "label" => "Associates"],
                ["key" => "get_last_stage.label", "label" => "Stage status"],

            ];
        }
        if (in_array(OPPORTUNITY_REPORT_HEAD, $neededData)) {
            $defaultColumns = [
                ["key" => "name", "label" => "Name"],
                ["key" => "details", "label" => "Details"],
                ["key" => "date_forecast", "label" => "Forecast date"],
                ["key" => "date_close", "label" => "Close date"],
                ["key" => "amount", "label" => "Amount"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
            ];
            $allColumns = [
                ["key" => "name", "label" => "Name"],
                ["key" => "details", "label" => "Details"],
                ["key" => "date_forecast", "label" => "Forecast date"],
                ["key" => "date_close", "label" => "Close date"],
                ["key" => "amount", "label" => "Amount"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
                ["key" => "get_status", "label" => "Status"],
                ["key" => "get_organization.name", "label" => "Organization"],
                ["key" => "get_category.name", "label" => "Category"],
                ["key" => "get_opportunity_source.name", "label" => "Source"],
                ["key" => "get_associates_name", "label" => "Associates"],
                ["key" => "get_last_stage.label", "label" => "Stage status"],
                ["key" => "get_overdue_status", "label" => "Overdue status"],

            ];
        }
        if (in_array(PROJECT_REPORT_HEAD, $neededData)) {
            $defaultColumns = [
                ["key" => "name", "label" => "Name"],
                ["key" => "details", "label" => "Details"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "get_status", "label" => "Status"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
            ];
            $allColumns = [
                ["key" => "name", "label" => "Name"],
                ["key" => "details", "label" => "Details"],
                ["key" => "get_status", "label" => "Status"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
                ["key" => "mobile_number", "label" => "Phone"],
                ["key" => "website", "label" => "Website"],
                ["key" => "get_associates_name", "label" => "Associates"],
                ["key" => "get_category.name", "label" => "Category"],
                ["key" => "get_tags_name", "label" => "Tag"],

            ];
        }
        if (in_array(USER_OWNER_ASSOCIATE_REPORT_HEAD, $neededData)) {
            $defaultColumns = [
                ["key" => "nickname", "label" => "Name"],
                ["key" => "lead_owner_and_associate", "label" => "Lead"],
                ['key' => 'opportunity_owner_and_associate', 'label' => 'Opportunity'],
                ['key' => 'project_owner_and_associate', 'label' => 'Project'],
                ['key' => 'contact_owner_and_associate', 'label' => 'Contact'],
                ['key' => 'organization_owner_and_associate', 'label' => 'Organization'],

            ];
            $allColumns = [
                ["key" => "nickname", "label" => "Name"],
                ["key" => "lead_owner_and_associate", "label" => "Lead"],
                ['key' => 'opportunity_owner_and_associate', 'label' => 'Opportunity'],
                ['key' => 'project_owner_and_associate', 'label' => 'Project'],
                ['key' => 'contact_owner_and_associate', 'label' => 'Contact'],
                ['key' => 'organization_owner_and_associate', 'label' => 'Organization'],
                ["key" => "task_owner_and_associate", "label" => "Task"],
                ["key" => "note_owner_and_associate", "label" => "Note"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
            ];
        }
        if (in_array(ORGANIZATION_REPORT_HEAD, $neededData)) {
            $defaultColumns = [
                ["key" => "name", "label" => "Name"],
                ["key" => "details", "label" => "Details"],
                ["key" => "get_status", "label" => "Status"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
            ];
            $allColumns = [
                ["key" => "name", "label" => "Name"],
                ["key" => "details", "label" => "Details"],
                ["key" => "get_status", "label" => "Status"],
                ["key" => "owner.get_user_reference.name", "label" => "Owner"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
                ["key" => "get_last_stage.label", "label" => "Stage status"],
                ["key" => "get_category_name.name", "label" => "Category"],
                ["key" => "get_associates_name", "label" => "Associates"],
                ["key" => "get_tags_name", "label" => "Tag"],

            ];
        }
        if (in_array(USER_ACTIVITY_LOG_REPORT_HEAD, $neededData)) {
            $defaultColumns = [
                ["key" => "causer_contact.nickname", "label" => "Creator"],
                ["key" => "log_name", "label" => "Name"],
                ["key" => "description", "label" => "Description"],
                ["key" => "event", "label" => "Event"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
            ];
            $allColumns = [
                ["key" => "causer_contact.nickname", "label" => "Creator"],
                ["key" => "log_name", "label" => "Name"],
                ["key" => "description", "label" => "Description"],
                ["key" => "event", "label" => "Event"],
                ["key" => "model_time.create_diff", "label" => "Time"],
                ["key" => "model_time.create_date_only", "label" => "Create at"],
            ];
        }
        if (in_array(USER_ACTIVITY_REPORT_HEAD, $neededData)) {
            $defaultColumns = [
                ["key" => "nickname", "label" => "Name"],
                ["key" => "get_causer_lead", "label" => "Lead"],
                ["key" => "get_causer_task", "label" => "Task"],
                ["key" => "get_causer_contact", "label" => "Contact"],
                ["key" => "get_causer_opportunity", "label" => "Opportunity"],
                ["key" => "get_causer_organization", "label" => "Organization"],
                ["key" => "get_causer_project", "label" => "Project"],
                ["key" => "get_causer_note", "label" => "Note"],
            ];
            $allColumns = [
                ["key" => "nickname", "label" => "Name"],
                ["key" => "get_causer_lead", "label" => "Lead"],
                ["key" => "get_causer_task", "label" => "Task"],
                ["key" => "get_causer_contact", "label" => "Contact"],
                ["key" => "get_causer_opportunity", "label" => "Opportunity"],
                ["key" => "get_causer_organization", "label" => "Organization"],
                ["key" => "get_causer_project", "label" => "Project"],
                ["key" => "get_causer_note", "label" => "Note"],
            ];
        }
        return [
            'tenantUsers' => $tenantUser,
            'defaultColumns' => $defaultColumns,
            'allColumns' => $allColumns,
            'dataSources' => $dataSources,
            'dataPriorities' => $dataPriorities,
            'dataTags' => $dataTags,
            'dataStages' => $dataStages,
            'dataCategories' => $dataCategories,
            'dataRatings' => $dataRatings,
        ];
    }
}
