<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Models\Tenant\Lead;
use Illuminate\Support\Str;
use App\Models\Tenant\Project;
use App\Models\Tenant\Attachment;
use App\Models\Tenant\Opportunity;
use App\Services\BaseModelService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;



class AttachmentModelService extends BaseModelService
{

    /**
     * Constructor
     *
     * @param Attachment $model
     */
    public function __construct(
        Attachment $model
    ) {
        parent::__construct($model);
    }

    /**
     * Return predefined attachment routes
     *
     * @return array
     */
    public function getRouteNames(): array
    {
        return [
            'attachmentsList'   => 'tenant.attachments.index',
            'attachmentsCreate' => 'tenant.attachments.create',
            'attachmentsStore'  => 'tenant.attachments.store',
            'attachmentsEdit'   => 'tenant.attachments.edit',
            'attachmentsUpdate' => 'tenant.attachments.update',
            'attachmentsDataUpdate' => 'tenant.attachments.data.update',
            'attachmentsDelete' => 'tenant.attachments.destroy',
            'attachmentsShow'   => 'tenant.attachments.show',
        ];
    }

    public function doResourceValidation(array $inputs)
    {
        return Validator::make($inputs, $this->rules(), $this->messages())->validate();
    }

    /**
     * Validation rules
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'title' => ['string', 'max:500'],
            'causer_id' => ['required'],
            'owner_id' => ['nullable', 'string'],
            'alt_text' => ['nullable', 'string'],
            'details' => ['nullable', 'string'],
            'attachment_file' => [
                'required',
                'file',
                'max:20480',
                'mimes:png,jpg,jpeg,mp3,txt,docx,doc,ppt,pptx,webp,pdf,xlsx,xls,mp4',
            ],

            'attachmentable_id' => ['required'],
            'type' => ['required'],
            'id' => ['nullable'],
            'is_active' => ['required'],
        ];
    }

    /**
     * Validation custom messages
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'title.required' => __('Field can not be empty'),
            'attachment_file.required' => __('File is required'),
            'attachment_file.file' => __('The uploaded file must be a valid file'),
            'attachment_file.mimes' => __('Allowed file types:png,jpg,jpeg,mp3,txt,docx,doc,ppt,pptx,webp,pdf,xlsx,xls,mp4'),
            'attachment_file.max' => __('The file size must not exceed 20MB'),
        ];
    }


    /**
     * Updating old stage and creating new on
     * 
     * @param array $inputs
     *  @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    public function doResourceStore(array $inputs = []): bool
    {
        // dd($inputs);
        try {
            if (empty($inputs)) {
                throw new Exception(__('Invalid input data.'));
            }

            $modelType = $inputs['type'] ?? null;
            $modelId   = $inputs['attachmentable_id'] ?? null;

            if (empty($modelType)) {
                throw new Exception(__('Model type is required for attachment.'));
            }

            $modelMap = [
                PROJECT     => Project::class,
                OPPORTUNITY => Opportunity::class,
                LEAD        => Lead::class,
            ];

            if (!isset($modelMap[$modelType])) {
                throw new Exception(__("Invalid model type: {$modelType}"));
            }

            $modelClass = $modelMap[$modelType];
            $model      = $modelClass::findOrFail($modelId);

            $uploadedFile = $inputs['attachment_file'] ?? null;
            $filePath = null;

            // if ($uploadedFile && $uploadedFile->isValid()) {
            //     $filePath = $uploadedFile->store('attachments', 'tenant_public');
            // }

            if ($uploadedFile && $uploadedFile->isValid()) {
                // Generate a unique folder per file upload
                $uniqueFolder = Str::uuid()->toString(); // or Str::random(40)
                $originalName = $uploadedFile->getClientOriginalName();

                // Store the file in a unique folder
                $filePath = $uploadedFile->storeAs(
                    "attachments/{$uniqueFolder}",
                    $originalName,
                    'tenant_public'
                );
            }

            $attachmentData = [
                'title'       => $inputs['title'] ?? '',
                'causer_id'   => $inputs['causer_id'] ?? null,
                'details'     => $inputs['details'] ?? null,
                'is_active'   => $inputs['is_active'] ?? 1,
                'attachment_file'   => $filePath,
                'alt_text'    => $inputs['alt_text'] ?? null,
            ];


            $model->attachmentFiles()->create($attachmentData);

            return true;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }


    /**
     * Get formatted attachment data (minimal)
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
                ['label' => 'Attachment name', 'value' => $model->title],
                ['label' => 'Attachment created on', 'value' => _dateFormat($model->created_at, 'd M, Y')],
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
            $model = $this->getSingleModel(modelOrId: $model,);
            if (!$model) throw new Exception(MODEL_OR_METHOD_NOT_FOUND);

            ## Base fields
            $data = $model->only(['causer_id', 'details', 'title', 'alt_text', 'attachment_file', 'is_active']);

            return $data;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage(), (int)$th->getCode(), $th);
        }
    }

    function doResourceUpdate(array $inputs = []): bool
    {
        try {
            if (empty($inputs)) {
                throw new Exception(__('Invalid input data.'));
            }

            if (empty($inputs['id'])) {
                throw new Exception(__('Attachment ID is required for update.'));
            }

            $attachment = $this->model->findOrFail($inputs['id']);
            if (!$attachment) {
                throw new Exception(__('Attachment not found.'));
            }

            $modelType = $inputs['type'] ?? null;
            $modelId   = $inputs['attachmentable_id'] ?? null;

            if (empty($modelType)) {
                throw new Exception(__('Model type is required for attachment.'));
            }

            $modelMap = [
                PROJECT     => Project::class,
                OPPORTUNITY => Opportunity::class,
                LEAD        => Lead::class,
            ];

            if (!isset($modelMap[$modelType])) {
                throw new Exception(__("Invalid model type: {$modelType}"));
            }

            $modelClass = $modelMap[$modelType];
            $model      = $modelClass::findOrFail($modelId);

            $uploadedFile = $inputs['attachment_file'] ?? null;
            $filePath = $attachment->attachment_file;


            if ($uploadedFile && $uploadedFile->isValid()) {

                // 🔹 Delete the old file and its folder if they exist
                if ($attachment->attachment_file && Storage::disk('tenant_public')->exists($attachment->attachment_file)) {
                    // Get the folder path (e.g., attachments/uuid)
                    $oldFolder = dirname($attachment->attachment_file);

                    // Delete entire directory
                    Storage::disk('tenant_public')->deleteDirectory($oldFolder);
                }

                // 🔹 Create a unique folder and preserve original filename
                $uniqueFolder = Str::uuid()->toString();
                $originalName = $uploadedFile->getClientOriginalName();

                // 🔹 Store file with unique folder + original name
                $filePath = $uploadedFile->storeAs(
                    "attachments/{$uniqueFolder}",
                    $originalName,
                    'tenant_public'
                );
            } elseif (empty($uploadedFile) && empty($inputs['attachment_file'])) {
                // 🔹 If no new file and user cleared input, delete existing file + folder
                if ($attachment->attachment_file && Storage::disk('tenant_public')->exists($attachment->attachment_file)) {
                    $oldFolder = dirname($attachment->attachment_file);
                    Storage::disk('tenant_public')->deleteDirectory($oldFolder);
                }
                $filePath = null;
            }

            $attachment->update([
                'title'           => $inputs['title'],
                'causer_id'       => $inputs['causer_id'],
                'details'         => $inputs['details'] ?? null,
                'is_active'       => $inputs['is_active'],
                'attachment_file' => $filePath,
                'alt_text'        => $inputs['alt_text'] ?? null,
            ]);


            return true;
        } catch (Throwable $th) {
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
