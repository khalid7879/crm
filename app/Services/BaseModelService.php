<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Schema;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Throwable;

/**
 * Class BaseModelService
 * 
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
abstract class BaseModelService
{
    protected Model $model;

    /**
     * Constructor method
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Get a single model instance by ID or return the provided model instance.
     *
     * @param  \Illuminate\Database\Eloquent\Model|string|int  $modelOrId
     * @param  array  $with
     * @param  array  $wheres
     * @param  array  $selects
     * @return \Illuminate\Database\Eloquent\Model|null
     *
     * @author Sakil
     */
    public function getSingleModel(
        Model|string|int $modelOrId,
        array $with = [],
        array $wheres = [],
        array $selects = []
    ): ?Model {
        try {
            ## Determine model ID
            $id = $modelOrId instanceof Model
                ? $modelOrId->getKey()
                : $modelOrId;

            ## Build query with optional relations and wheres
            $model = $this->model
                ->when($selects, fn($q) => $q->select($selects))
                ->when($with, fn($q) => $q->with($with))
                ->when($wheres, fn($q) => $q->where($wheres))
                ->findOrFail($id);

            return $model;
        } catch (Throwable $th) {
            throw $th;
        }
    }


    /**
     * Get all models
     *
     * @return \Illuminate\Support\Collection
     */
    public function getAllModels($with = []): Collection
    {
        $query = $this->model->newQuery();

        $query->when(!empty($with), fn($q) => $q->with($with));

        return $query->get();
    }

    /**
     * Get all models
     *
     * @return \Illuminate\Support\Collection
     */
    public function getModelData($with = [], $columns = ['*'],$limit = 50,$orderBy = 'created_at',$orderType = 'ASC', $searchText = '', $fromAction = ''): Collection
    {
        $searchColumn = 'nickname';

        if (in_array($fromAction, [OPPORTUNITY, PROJECT, ORGANIZATION, PRODUCT])) {
            $searchColumn = 'name';
        }

        $query = $this->model->newQuery();

        $query->when(!empty($with), fn($q) => $q->with($with));

        $query->when(!empty($searchText), fn($q) => $q->where($searchColumn, 'like', "%{$searchText}%"));

        $query->when(!empty($columns), fn($q) => $q->select($columns));

        $query->when(!empty($limit), fn($q) => $q->limit($limit));

        $query->when(!empty($orderBy), fn($q) => $q->orderBy($orderBy,$orderType));

        return $query->get();
    }


    /**
     * Get all records by column/value with optional relations.
     *
     * @param  string       $column
     * @param  mixed        $value
     * @param  array        $with
     * @return \Illuminate\Support\Collection
     */
    public function getModelsByColumn(string $column, $value, array $with = [])
    {
        $query = $this->model->newQuery();

        $query->when(!empty($with), fn($q) => $q->with($with));

        $query->where($column, $value);

        return $query->get();
    }



    /**
     * Get paginated or full list of models.
     *
     * @param array $filters
     * @return LengthAwarePaginator|Collection
     * @author Sakil Jomadder
     */
    public function getPaginatedModels(array $filters = []): LengthAwarePaginator|Collection
    {
        $perPage    = $filters['perPage'] ?? 10;
        $orderBy    = $filters['orderBy'] ?? 'id';
        $orderType  = $filters['orderType'] ?? 'desc';
        $isActive   = $filters['isActive'] ?? null;
        $isVerified = $filters['isVerified'] ?? null;
        $gender     = $filters['gender'] ?? null;
        $textSearch = $filters['textSearch'] ?? null;
        $with       = $filters['with'] ?? [];
        $isPaginate = $filters['isPaginate'] ?? true;
        $columns    = $filters['columns'] ?? ['*'];
        $wheres     = $filters['wheres'] ?? [];

        $query = $this->model
            ->when(!empty($with), fn($q) => $q->with($with))
            ->when(isset($isActive), fn($q) => $q->where('is_active', $isActive))
            ->when(isset($isVerified), fn($q) => $q->where('is_verified', $isVerified))
            ->when(isset($gender), fn($q) => $q->where('gender', 'like', $gender))
            ->when(!empty($wheres), function ($query) use ($wheres) {
                foreach ($wheres as $column => $value) {
                    if (is_array($value)) {
                        $query->whereIn($column, $value);
                    } else {
                        $query->where($column, $value);
                    }
                }
                return $query;
            })
            ->when($textSearch, function ($q) use ($textSearch) {
                $model = $q->getModel();
                $table = $model->getTable();
                $columns = [
                    'name',
                    'first_name',
                    'last_name',
                    'nickname',
                    'email',
                    'gender',
                    'mobile_phone',
                    'telephone',
                    'created_at',
                    'updated_at',
                    'is_active',
                    'type',
                    'stage_percent',
                    'order',
                ];
                $validColumns = array_filter($columns, fn($col) => Schema::hasColumn($table, $col));
                return $q->where(function ($q) use ($validColumns, $textSearch) {
                    foreach ($validColumns as $col) {
                        $q->orWhere($col, 'like', "%$textSearch%");
                    }
                });
            })
            ->select($columns)
            ->orderBy($orderBy, $orderType);

        return $isPaginate
            ? $query->paginate($perPage)->appends($filters)
            : $query->get();
    }


    /**
     * Get pivot columns for morphToMany relationships
     */
    protected function getPivotColumns(string $relation): array
    {
        return match ($relation) {
            'stages' => ['id', 'causer_id', 'duration', 'created_at', 'updated_at'],
            'socials' => ['url', 'created_at', 'updated_at'],
            'tasks' => ['created_at', 'updated_at'],
            'designations', 'sources', 'ratings', 'priorities', 'categories', 'employeeSizes', 'preferableTimes', 'products', 'organization', 'tags', 'associates' => ['created_at', 'updated_at'],
            default => [],
        };
    }

    /**
     * Attach or update child models on a parent via pivot relationship.
     *
     * Behavior:
     *  - sync   => update existing pivot rows OR attach if not found (full sync)
     *  - attach => attach only if relation does not already exist (update if exists)
     *
     * @param  \Illuminate\Database\Eloquent\Model  $parentModel
     * @param  \Illuminate\Database\Eloquent\Model|int|string|array|\Illuminate\Support\Collection  $childModel
     * @param  string  $relationalMethod
     * @param  array   $additionalInputs
     * @param  string  $syncType  'sync'|'attach'
     * @return void
     *
     * @throws \Exception
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doAttachWithParentModel(
        Model $parentModel,
        Model|int|string|array|Collection $childModel,
        string $relationalMethod,
        array $additionalInputs = [],
        string $syncType = 'sync',
        bool $updateExisting = true
    ): void {


        if (!$relationalMethod || !$parentModel || !$childModel) {
            throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
        }

        if (!method_exists($parentModel, $relationalMethod)) {
            throw new Exception("Method '{$relationalMethod}' does not exist on " . get_class($parentModel));
        }

        try {
            $relation = $parentModel->$relationalMethod();

            if (!$relation instanceof BelongsToMany) {
                throw new Exception("Relationship '{$relationalMethod}' must be BelongsToMany/MorphToMany.");
            }

            ## Case 1: associative array of [id => pivotData]
            if (is_array($childModel) && $this->isAssoc($childModel)) {
                // dd('array', $parentModel, $childModel, $relationalMethod, $additionalInputs, $syncType);
                if ($syncType === 'sync') {
                    $relation->sync($childModel);
                } else {
                    foreach ($childModel as $id => $pivotData) {
                        $exists = $relation->wherePivot($relation->getRelatedPivotKeyName(), $id)->exists();
                        $exists
                            ? $relation->updateExistingPivot($id, $pivotData)
                            : $relation->attach($id, $pivotData);
                    }
                }
                return;
            }

            ## Case 2: normalize IDs (Model | Collection | array | scalar)

            if ($childModel instanceof Model) {
                $childIds = [$childModel->getKey()];
            } elseif ($childModel instanceof Collection) {
                $childIds = $childModel->map(fn($item) => $item instanceof Model ? $item->getKey() : $item)->all();
            } elseif (is_array($childModel)) {
                $childIds = collect($childModel)->map(fn($item) => $item instanceof Model ? $item->getKey() : $item)->all();
            } else {
                $childIds = [$childModel];
            }
            $childIds = array_values(array_filter($childIds, fn($id) => is_scalar($id)));


            if (empty($childIds)) {
                return;
            }

            // dd('not array', $parentModel, $childModel, $relationalMethod, $additionalInputs, $syncType,  $childIds);

            ## Apply syncType
            if ($syncType === 'sync') {
                $syncData = [];
                foreach ($childIds as $id) {
                    $syncData[$id] = $additionalInputs;
                }
                // dd($relation,$syncData);
                $relation->sync($syncData);
            } else { ## attach
                foreach ($childIds as $id) {
                    $exists = $relation->wherePivot($relation->getRelatedPivotKeyName(), $id)->exists();
                    $exists && $updateExisting
                        ? $relation->updateExistingPivot($id, $additionalInputs)
                        : $relation->attach($id, $additionalInputs);
                }
            }
        } catch (\Throwable $th) {
            throw new Exception("Failed to attach: " . $th->getMessage(), 0, $th);
        }
    }

    /***
     * Check if array is associative
     */
    private function isAssoc(array $arr): bool
    {
        return array_keys($arr) !== range(0, count($arr) - 1);
    }


    /**
     * Remove empty social linkable values passed through UI to store in system db
     * 
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     * @return array
     */
    public function removeEmptyValuesToStore(array $items = []): mixed
    {
        if (empty($items) && count($items) <= 0) return false;

        $itemsFormatted = collect($items)
            ->filter(fn($item) => !empty(trim($item['value'] ?? '')))
            ->map(function ($item, $index) {
                return [
                    'social_link_id' => $index,
                    'url' => $item['value'],
                ];
            })
            ->toArray();

        return $itemsFormatted;
    }

    /**
     * Delete a model by its ID or instance.
     *
     * Accepts either a model ID (string|int) or an actual Eloquent Model instance.
     * Finds the model and deletes it. If the model cannot be found or deletion fails,
     * an exception is thrown.
     *
     * @param  string|int|\Illuminate\Database\Eloquent\Model  $id  The model ID or Model instance to delete
     * @return bool  True if deletion was successful, false otherwise
     *
     * @throws Exception If the model is not found or deletion fails
     */
    public function deleteModelById(string|int|Model $id): bool
    {
        try {
            $model = $id instanceof Model
                ? $id
                : $this->model->find($id);

            if (!$model) {
                throw new Exception(MODEL_OR_METHOD_NOT_FOUND);
            }

            return (bool) $model->delete();
        } catch (Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }


    /**
     * Retrieve contact ID(s) for given user ID(s) (ULID format).
     *
     * - If a single user ID is provided, returns the related contact ULID or null.
     * - If an array of user IDs is provided, returns an array of contact ULIDs (skipping users without contacts).
     *
     * @param  string|array<string>  $userIds  Single user ULID or array of user ULIDs
     * @return array|string|null  Contact ULID(s) or null
     *
     * @throws \Exception
     */
    public function usersContactReference(array|string $userIds = []): array|string|null
    {
        try {
            ## Determine if input is a single value
            $isSingle = !is_array($userIds);

            ## Ensure we have an array of ULIDs
            $userIds = is_array($userIds) ? $userIds : [$userIds];

            ## Retrieve contact ULIDs for given user ULIDs
            $contacts = User::with('contactReference')
                ->whereIn('id', $userIds)
                ->get()
                ->map(fn($user) => optional($user->contactReference->first())->id)
                ->filter(fn($id) => is_string($id)) ## Ensure only strings
                ->values()
                ->toArray();

            ## Return single value if input was a single ID
            return $isSingle ? ($contacts[0] ?? null) : $contacts;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), $th->getCode(), $th);
        }
    }


    /**
     * Group tasks by progress percent and return summarized task report
     *
     * @param \Illuminate\Support\Collection $tasks
     * @return array
     * 
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    function groupTasksByProgress($tasks): array
    {
        if (empty($tasks) || count($tasks) <= 0) {
            return [
                'upcoming_activities' => [],
                'past_activities'     => [],
            ];
        }

        ## Group tasks by progress percent
        $tasksGrouped = $tasks->groupBy(
            fn($task) => ((int) $task->progress_percent < 100)
                ? 'upcoming_activities'
                : 'past_activities'
        );

        ## Return summarized task report
        return [
            'upcoming_activities' => $tasksGrouped['upcoming_activities'] ?? collect(),
            'past_activities'     => $tasksGrouped['past_activities'] ?? collect(),
        ];
    }
}
