<?php

namespace App\Services\Tenant;

use App\Models\Tenant\Contact;
use Exception;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Opportunity;
use App\Models\Tenant\Organization;
use App\Models\Tenant\Project;
use App\Models\Tenant\Task;

class TenantSearchService 

{
  
    /**
     * Return predefined role routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            
        ];
    }

    public function searchReportData(array $requests)
    {
        try {
            $queryData = $requests['data'] ?? [];
            $searchText = $queryData['query'] ?? null;
            $module = $queryData['module'] ?? null;

            // If no query text, return empty arrays instead of running heavy queries
            if (empty($searchText)) {
                return [
                    'leads'          => [],
                    'tasks'          => [],
                    'projects'       => [],
                    'contacts'       => [],
                    'opportunities'  => [],
                    'organizations'  => [],
                ];
            }

            $leads = [];
            $projects = [];
            $contacts = [];
            $opportunities = [];
            $organizations = [];
            $tasks = [];

            if($module == 'lead' || $module == 'all'){
                $leads = Lead::with('stages')->where('nickname', 'like', "%{$searchText}%")->get();
            }

            if($module == 'project' || $module == 'all'){
                $projects = Project::where('name', 'like', "%{$searchText}%")->get();
            }

            if($module == 'contact' || $module == 'all'){
                $contacts = Contact::where('nickname', 'like', "%{$searchText}%")
                    ->orWhere('email', 'like', "%{$searchText}%")
                    ->get();
            }

            if($module == 'opportunity' || $module == 'all'){
                $opportunities = Opportunity::where('name', 'like', "%{$searchText}%")->get();
            }

            if($module == 'organization' || $module == 'all'){
                $organizations = Organization::where('name', 'like', "%{$searchText}%")->get();
            }

            if($module == 'task' || $module == 'all'){
                $tasks = Task::with('stages')->where('name', 'like', "%{$searchText}%")->get();
            }

            return [
                'leads'          => $leads,
                'tasks'          => $tasks,
                'projects'       => $projects,
                'contacts'       => $contacts,
                'opportunities'  => $opportunities,
                'organizations'  => $organizations,
            ];
        } catch (\Throwable $th) {
            throw new \Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
