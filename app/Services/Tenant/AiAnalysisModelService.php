<?php

namespace App\Services\Tenant;

use Exception;
use Throwable;
use App\Models\Tenant\Lead;
use App\Models\Tenant\Project;
use App\Models\Tenant\AiAnalysis;
use App\Traits\TenantCommonTrait;
use App\Models\Tenant\Opportunity;
use App\Services\BaseModelService;
use App\Traits\TenantCommonModelTrait;

/**
 * Class AiAnalysisModelService
 *
 * Handles creation and updating of AI-generated analyses linked to tenant models (e.g., Leads, Opportunities).
 *
 * ## Core Responsibilities:
 * - Validate and sanitize incoming AI analysis data.
 * - Persist AI-generated summaries, recommendations, and metadata.
 * - Associate each AI analysis with a specific parent model (via polymorphic relation).
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class AiAnalysisModelService extends BaseModelService
{
    use TenantCommonTrait;
    use TenantCommonModelTrait;

    /**
     * Constructor.
     *
     * Initializes the service with the AiAnalysis model instance.
     *
     * @param AiAnalysis $model
     */
    public function __construct(AiAnalysis $model)
    {
        parent::__construct($model);
    }

    /**
     * Store or update an AI analysis record for a specific model (e.g., Lead).
     *
     * ## Responsibilities:
     * - Ensures model ID and type are valid.
     * - Extracts and sanitizes allowed fields from the input payload.
     * - Finds the target model instance (e.g., Lead).
     * - Creates or updates the AI analysis record via polymorphic relation.     
     * @param string $modelId   The ID of the parent model (e.g., Lead).
     * @param array $inputs     The AI analysis input data.
     * @param string $modelType The model type (default: 'LEAD').
     * @return AiAnalysis       The created or updated AI analysis instance.
     * @throws Exception        If validation fails or database operation fails.
     */
    public function doResourceStore(string $modelId, array $inputs = [], string $modelType = 'LEAD'): mixed
    {

        ## Validate model ID existence
        if (empty($modelId)) {
            throw new Exception("{$modelType} ID is required for AI analysis");
        }

        ## Mapping each type to its model class
        $modelMap = [
            PROJECT      => Project::class,
            OPPORTUNITY  => Opportunity::class,
            LEAD         => Lead::class,
        ];

        if (!isset($modelMap[$modelType])) {
            throw new Exception("Invalid action type: {$modelType}");
        }

        ## Prepare sanitized input payload
        $inputsCustomized = [
            'causer_id'        => $inputs['causer_id'],
            'summary'          => $inputs['summary'] ?? '',
            'current_position' => $inputs['current_position'] ?? '',
            'next_best_action' => $inputs['next_best_action'] ?? '',
            'meta'             => $inputs['meta'] ?? [],
        ];

        try {
            ## Find target model (e.g., Lead)
            
            $modelClass = $modelMap[$modelType];
            
            $model = $modelClass::findOrFail($modelId);

            ## Create a new AI analysis record linked to the model
            $analysis = $model->aiAnalysis()->create($inputsCustomized);

            return $analysis;
        } catch (Throwable $th) {
            ## Rethrow with line info for easier debugging
            throw new Exception($th->getMessage() . ' Line: ' . $th->getLine());
        }
    }
}
