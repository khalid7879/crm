<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Models\Tenant\Note;
use App\Services\BaseModelService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;


/**
 * NoteModelService
 *
 * Handles CRUD, validation, formatting, and pivot attachments for Note resources.
 *
 * Responsibilities:
 *  - Validate incoming task data
 *  - Create/update tasks
 *  - Attach related models (associates, stage, priority, category, parent model)
 *  - Change stage and progress percent
 *  - Format task data for display
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class NoteModelService extends BaseModelService
{
    /**
     * Constructor
     *
     * @param Note $model
     * @param TenantLeadService $leadModelService
     */
    public function __construct(
        Note $model,
        private TenantLeadService $leadModelService,
        private TenantOpportunityService $opportunityModelService,
        private TenantProjectService $tenantProjectService,
        private OrganizationModelService $organizationModelService,
        private ContactModelService $contactModelService,
        private TaskModelService $taskModelService
    ) {
        parent::__construct($model);
    }

    /**
     * Return predefined task routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'notesList'   => 'tenant.notes.index',
            'notesCreate' => 'tenant.notes.create',
            'notesStore'  => 'tenant.notes.store',
            'notesEdit'   => 'tenant.notes.edit',
            'notesUpdate' => 'tenant.notes.update',
            'notesDelete' => 'tenant.notes.destroy',
            'notesShow'   => 'tenant.notes.show',
        ];
    }

    /**
     * Validate task inputs
     *
     * @param array $inputs
     * @return array
     */
    public function doResourceValidation(array $inputs)
    {
        ## Perform validation using defined rules and messages
        return Validator::make($inputs, $this->rules(), $this->messages())->validate();
    }

    /**
     * Validation rules for tasks
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'associates' => ['nullable'],
            'causer_id' => ['required'],
            'title' => ['required', 'string', 'max:500'],
            'date_reminder' => ['nullable', 'string'],
            'details' => ['nullable'],
            'is_active' => ['required'],
            'owner_id' => ['required'],
            'related_to_type' => ['required'],
            'noteable_id' => ['nullable'],
        ];
    }

    /**
     * Custom validation messages
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'title.required' => __('Note title can not be empty'),
        ];
    }

    /**
     * Store or update a Note resource
     *
     * Handles:
     *  - Extracting allowed fields
     *  - Resolving `causer_id` and `owner_id` via usersContactReference
     *  - Creating/updating task
     *  - Attaching related models: associates, stage, priority, category
     *  - Attaching task to parent model (Lead/Project/Opportunity/etc.)
     *
     * @param array $inputs Note input data
     * @return Note|string Newly created or updated task
     * @throws Exception
     */
    public function doResourceStore(array $inputs): Note|string
    {
    
        $model = null;

        try {
            ## Extract only allowed fields
            $modelInputs = collect($inputs)->only([
                'causer_id',
                'owner_id',
                'title',
                'details',
                'date_reminder',
                'is_active',
            ])->toArray();

            // dd($inputs);

            ## Create or update note
            if (!empty($inputs['id'])) {
                $model = $this->model->findOrFail($inputs['id']);
                $model->update($modelInputs);
            } else {
                $model = $this->model->create($modelInputs);
            }

            if (!$model) throw new Exception(COMMON_ERROR_MSG);

            ## Attach associates
            if (!empty($inputs['associates']) && is_array($inputs['associates'])) {
                $associates = $inputs['associates'];
                $this->doAttachWithParentModel(parentModel: $model, childModel: $associates, relationalMethod: 'associates', syncType: 'sync');
            }


            ## Attach note to parent model
            if (!empty($inputs['noteable_id']) && !empty($inputs['related_to_type'])) {
                $parentModel = $this->getNotesParentModel($inputs['related_to_type'], $inputs['noteable_id']);
                if (!$parentModel) throw new Exception("Unable to attach note to parent model.");
                $this->doAttachWithParentModel(parentModel: $parentModel, childModel: $model->id, relationalMethod: 'notes', syncType: 'attach');
                $parentModel->touch();
            }

            return $model;
        } catch (Throwable $th) {
            ## Delete newly created task on failure
            if (empty($inputs['id'])) $model?->delete();

            if ($th->getCode() === 23000) throw new Exception(MISSING_FIELD);

            throw new Exception($th->getMessage());
        }
    }

    /**
     * Retrieve paginated task list
     *
     * @param array $requests
     * @return mixed
     */
    public function resourceList(array $requests=[]): mixed
    {
        ## Fetch paginated tasks with relations
        try {
            return $this->getPaginatedModels([...$requests, 'with' => [
                'associates',
                'stages',
                'priorities',
                'categories',
                ]]);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }

    /**
     * Retrieve parent model for a task
     *
     * @param string $parentType Parent type (LEAD, PROJECT, etc.)
     * @param string $parentId Parent model ID
     * @return mixed
     * @throws Exception
     */
    public function getNotesParentModel(string $parentType, string $parentId): mixed
    {
        ## Map parent types to model services
        $parents = ['LEAD' => $this->leadModelService,'OPPORTUNITY' => $this->opportunityModelService, 'PROJECT' => $this->tenantProjectService,'ORGANIZATION' => $this->organizationModelService, 'CONTACT' => $this->contactModelService, 'TASK' =>$this->taskModelService ];

        try {
            if (!isset($parents[$parentType])) throw new Exception("Note related to type '{$parentType}' is not supported.");

            $model = $parents[$parentType]->getSingleModel($parentId);

            if (!$model) throw new Exception("Note related model not found for ID {$parentId}.");

            return $model;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), 0, $th);
        }
    }

    /**
     * Change task stage and progress percent
     *
     * @param array $inputs ['id' => taskId, 'value' => progressPercent]
     * @return mixed
     * @throws Exception
     */
    public function changeStageAndProgressPercent(array $inputs = []): mixed
    {
        try {
            if (!count($inputs)) throw new Exception(COMMON_ERROR_MSG);

            ## Destructure inputs
            ['id' => $id, 'value' => $value] = $inputs;

            ## Retrieve task
            $model = $this->model->findOrFail($id);

            ## Update progress
            $model->progress_percent = $value;
            $model->save();



           

            return $model;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }

    /**
     * Get formatted task data (minimal)
     *
     * @param Model|string|int $model
     * @return array
     * @throws Exception
     */
    public function getModelFormattedData(Model|string|int $model): array
    {
        try {
            ## Fetch model and hide appended attributes
            $model = $this->getSingleModel(modelOrId: $model, selects: ['id', 'title', 'created_at'])?->makeHidden($this->model->getAppends());
            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            ## Return formatted array
            return [
                ['label' => 'Note name', 'value' => $model->title],
                ['label' => 'Note created on', 'value' => _dateFormat($model->created_at, 'd M, Y')],
            ];
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), $th->getCode(), $th);
        }
    }

    /**
     * Get formatted task data (full)
     *
     * @param Model|string|int $model
     * @return array
     * @throws Exception
     */
    public function getModelFormattedDataAll(Model|string|int $model): array
    {
        try {
            $model = $this->getSingleModel(modelOrId: $model, with: ['associates']);
            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            ## Base fields
            $data = $model->only(['causer_id', 'owner_id','date_reminder', 'details', 'title',]);

            ## Conditional assignments
            $data['associates'] = $model->associates ? $model->associates->pluck('id')->toArray() : [];

            return $data;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), (int)$th->getCode(), $th);
        }
    }
}
