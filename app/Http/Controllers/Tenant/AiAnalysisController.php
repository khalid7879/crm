<?php

namespace App\Http\Controllers\Tenant;

use Throwable;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\BaseTenantController;
use App\Services\Tenant\AiAnalysisModelService;

/**
 * Class AiAnalysisController
 *
 * Handles creation and updating of AI-generated analyses for tenant models (e.g., Leads, Opportunities).
 * This controller delegates core logic to the AiAnalysisModelService and responds with standardized JSON output.
 *
 * @package App\Http\Controllers\Tenant
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class AiAnalysisController extends BaseTenantController
{
    /**
     * AiAnalysisController constructor.
     *
     * @param AiAnalysisModelService $aiAnalysisModelService
     *        Service responsible for storing or updating AI analysis records.
     */
    public function __construct(
        private readonly AiAnalysisModelService $aiAnalysisModelService
    ) {}

    /**
     * Store or update AI analysis data for a given model (e.g., Lead).
     *
     * This method:
     * - Accepts AI-generated analysis input from the request.
     * - Delegates persistence logic to the AiAnalysisModelService.
     * - Returns a standardized JSON response on success or error.
     *
     * ## Example Request:
     * ```json
     * {
     *   "summary": "Lead shows strong engagement.",
     *   "current_position": "Negotiation",
     *   "next_best_action": "Schedule a demo",
     *   "meta": {"confidence": 0.92, "model": "gpt-5"}
     * }
     * ```
     *
     * @param string $modelId  The ID of the model (e.g., Lead) for which the analysis is stored.
     * @return JsonResponse
     */
    public function modelAnalysesStore(string $modelId): JsonResponse
    {
        try {
            $analysis = $this->aiAnalysisModelService->doResourceStore(
                modelId: $modelId,
                inputs: request()->all(),
                modelType: request()->type ?? 'LEAD'
            );

            $responseData = [
                'summary' => $analysis?->summary,
                'current_position' => $analysis?->current_position,
                'next_best_action' => $analysis?->next_best_action,
                'meta' => $analysis?->meta,
                'created_at' => $analysis?->modelTime['create_formatted']
            ];

            return response()->json([
                'status'  => 'success',
                'code'    => 200,
                'message' => 'AI analysis saved successfully.',
                'data'    => $responseData,
            ], 200);
        } catch (Throwable $th) {
            return response()->json([
                'status'  => 'error',
                'code'    => 500,
                'message' => 'Failed to store AI analysis: ' . $th->getMessage(),
            ], 500);
        }
    }
}
