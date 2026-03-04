<?php

namespace App\Traits;

use Exception;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Task;
use App\Models\Tenant\Project;
use App\Models\Tenant\Opportunity;
use App\Models\Tenant\TaskHistory;
use Illuminate\Support\Collection;
use App\Models\Tenant\Organization;

/**
 * Trait TenantCommonModelTrait
 *
 * Provides helper methods for tenant-related models such as Leads, Projects, etc.,
 * particularly for generating AI-friendly summaries combining task and note history.
 * 
 * @author Mamun
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
trait TenantCommonModelTrait
{
    /**
     * Generate an AI-friendly payload summary for related tasks and notes.
     *
     * @param string $entityType        The entity type name (e.g., "Lead", "Project").
     * @param string $entityDisplayName The specific entity’s display name (e.g., lead nickname or project title).
     * @param Collection|array $tasks   A collection or array of related task models.
     * @param Collection|array $notes   A collection or array of related note models.
     * @return array                    Structured AI payload with separated and combined summaries.
     */
    public function getAiPayloadData(
        string $entityType,
        string $entityDisplayName,
        $tasks = [],
        $notes = []
    ): array {
        $taskSummaries = [];
        $noteSummaries = [];
        $combinedSummaries = [];

        $entityTypeLower = strtolower($entityType);

        /** --------------------------
         * Handle related tasks
         * -------------------------- */
        foreach ($tasks as $task) {
            $date = _dateFormat($task->created_at, 'd M Y, h:i A');
            $taskName = $task->name ?? '';
            $taskCreator = $task?->get_causer ?? '';

            $message = "{$date} - Task '{$taskName}' was created by user '{$taskCreator}' for {$entityTypeLower} '{$entityDisplayName}'";
            $taskSummaries[] = $message;
            $combinedSummaries[] = $message;
        }

        /** --------------------------
         * Handle related notes
         * -------------------------- */
        foreach ($notes as $note) {
            $date = _dateFormat($note->created_at, 'd M Y, h:i A');
            $noteTitle = $note->title ?? '';
            $noteCreator = $note?->get_causer ?? '';

            $message = "{$date} - Note '{$noteTitle}' was created by user '{$noteCreator}' for {$entityTypeLower} '{$entityDisplayName}'";
            $noteSummaries[] = $message;
            $combinedSummaries[] = $message;
        }

        /** --------------------------
         * Return structured data
         * -------------------------- */
        return [
            'tasks'     => $taskSummaries,
            'notes'     => $noteSummaries,
            'combined'  => $combinedSummaries,
        ];
    }


    /**
     * Handle sample data operations for a given model.
     *
     * This method can:
     *   - Get sample data count (when $action = 'get')
     *   - Delete sample data (when $action = 'delete')
     *
     * @param  string  $model   The model key constant name.
     * @param  string  $action  The action to perform: 'get' or 'delete'.
     * @return array|bool       Returns data array for 'get' or boolean for 'delete'.
     * @throws \Exception       If invalid input or model type.
     */
    public function handleSampleData(string $model, string $action = 'get')
    {
        try {
            ## Step 1: Validate model key
            if (empty($model)) {
                throw new Exception('Model is empty!');
            }

            ## Step 2: Validate action type
            $allowedActions = ['get', 'delete'];
            if (!in_array($action, $allowedActions)) {
                throw new Exception("Invalid action type: {$action}");
            }

            ## Step 3: Map model constants to their respective Eloquent models
            $modelMap = [
                PROJECT      => Project::class,
                ORGANIZATION => Organization::class,
                OPPORTUNITY  => Opportunity::class,
                LEAD         => Lead::class,
                TASK         => Task::class,
            ];

            ## Step 4: Check model validity
            if (!isset($modelMap[$model])) {
                throw new Exception("Invalid model type: {$model}");
            }

            ## Step 5: Resolve model class
            $modelClass = $modelMap[$model];

            ## Step 6: Perform requested action
            if ($action === 'get') {
               
                $resourceCount = $modelClass::where('is_sample', 1)->count();

                return [
                    'sampleData' => [
                        'data'   => $resourceCount,
                        'model'  => $model,
                        'result' => true,
                        'action' =>  $action,
                    ]
                ];
            }

            if ($action === 'delete') {
                $deletedCount = $modelClass::where('is_sample', 1)->delete();
                return [
                    'sampleData' => [
                        'result' => true,
                        'action' => $action,
                    ]
                ];
            }
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' | Line: ' . $th->getLine());
        }
    }

   
}
