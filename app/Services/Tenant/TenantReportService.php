<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Traits\TenantReportTrait;

class TenantReportService
{
    use TenantReportTrait;
    /**
     * Return predefined module routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'allLeadReport'   => 'tenant.leads-all.report',
            'allLeadReportData'   => 'tenant.leads-all.report.data',
            'leadByStatusReport'   => 'tenant.leads-by.status.report',
            'leadByStatusReportData'   => 'tenant.leads-by.status.report.data',

            'allContactReport'   => 'tenant.contacts-all.report',
            'allContactReportData'   => 'tenant.contacts-all.report.data',

            'allTaskReport'   => 'tenant.tasks-all.report',
            'allTaskReportData'   => 'tenant.tasks-all.report.data',
            'taskHistoryData'   => 'tenant.tasks-history.data',

            'allOpportunityReport'   => 'tenant.opportunities-all.report',
            'allOpportunityReportData'   => 'tenant.opportunities-all.report.data',

            'allProjectReport'   => 'tenant.projects-all.report',
            'allProjectReportData'   => 'tenant.projects-all.report.data',

            'allOrganizationReport'   => 'tenant.organizations-all.report',
            'allOrganizationReportData'   => 'tenant.organizations-all.report.data',

            'usersActivityReport'   => 'tenant.users-activity.report',
            'usersActivityReportData'   => 'tenant.users-activity.report.data',

            'userOwnerAssociateReport'   => 'tenant.users-owner-associate.report',
            'userOwnerAssociateReportData'   => 'tenant.users-owner-associate.report.data',

            'userActivityLogReport'   => 'tenant.users-activity.log.report',
            'userActivityLogReportData'   => 'tenant.users-activity.log.report.data',
        ];
    }

    /**
     * Return  all lead report data
     * author : <mamunhossen149191@gmail.com>
     * @return array
     */
    public function allLeadReportData($requests)
    {
        try {
            return $this->getAllLeadReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }


    public function leadByStatusReport($requests)
    {
        try {
            return $this->getLeadByStatusReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    public function filterData($neededData, $request = [])
    {
        try {
            if (isset($request['customColumn']) && $request['customColumn']) {
                $defaultColumns['defaultColumns'] = $request['customColumn'] ?? [];
                return $defaultColumns;
            }
            return $this->getFilterData($neededData);
        } catch (Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    public function allContactReportData($requests)
    {
        try {
            return $this->getAllContactReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    public function allTaskReportData($requests)
    {
        try {
            return $this->getAllTaskReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    public function allOpportunityReportData($requests)
    {
        try {
            return $this->getAllOpportunityReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    public function allProjectReportData($requests)
    {
        try {
            return $this->getAllProjectReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    public function allOrganizationReportData($requests)
    {
        try {
            return $this->getAllOrganizationReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    public function allUserOwnerAssociateReportData($requests)
    {
        try {
            return $this->getAllUserOwnerAssociateReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    public function allUserActivityLogReportData($requests)
    {
        try {
            return $this->getAllUserActivityLogReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }
    public function allUserActivityReportData($requests)
    {
        try {
            return $this->getAllUserActivityReport($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }
    public function taskHistoryData($requests)
    {
        try {
            return $this->getTaskHistoryData($requests);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }
}
