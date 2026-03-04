<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Class AiAnalysis
 *
 * Represents an AI-generated analysis record for any model (e.g., Lead, Opportunity).
 * 
 * Used to store AI insights such as a textual summary, current position in a process,
 * and next-best-action recommendations. It supports polymorphic relations to allow
 * attachment with multiple model types dynamically.
 *
 * ## Example:
 * $lead->aiAnalysis()->create([
 *     'summary' => 'Highly engaged lead with positive communication tone.',
 *     'current_position' => 'Negotiation',
 *     'next_best_action' => 'Schedule a follow-up demo call.',
 * ]);
 *
 * @property int $id
 * @property int|null $causer_id                     ID of the user/system who triggered the analysis
 * @property string|null $analysisable_type          Polymorphic model type (e.g., App\Models\Lead)
 * @property int|null $analysisable_id               Polymorphic model ID
 * @property string|null $summary                    AI-generated textual summary
 * @property string|null $current_position           Stage or position (e.g., Negotiation, Proposal Sent)
 * @property string|null $next_best_action           AI-suggested next action
 * @property array|null $meta                        Additional metadata (e.g., AI confidence, model name)
 *
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $analysisable
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class AiAnalysis extends Model
{
    use HasUlids;
    /* -------------------- PRIMARY KEY CONFIG -------------------- */

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';


    protected $table = 'ai_analysis';

    /** 
     * The attributes that are mass assignable.
     * 
     * @var array<string, string>
     */
    protected $fillable = [
        'causer_id',
        'summary',
        'current_position',
        'next_best_action',
        'meta',
    ];

    /**
     * The attributes that should be cast to native types.
     * 
     * @var array<string, string>
     */
    protected $casts = [
        'meta' => 'array',
    ];

    /* -------------------- APPENDED ACCESSORS -------------------- */
    protected $appends = [
        'model_time'
    ];

    /* -------------------- ACCESSORS -------------------- */
    protected function modelTime(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at
                ? [
                    'create_diff'      => $this->created_at?->diffForHumans(),
                    'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                    'create_date_only' => _dateFormat($this->created_at, 'd M Y'),
                    'update_diff'      => $this->updated_at?->diffForHumans(),
                    'update_formatted' => _dateFormat($this->updated_at, 'd M, Y (h:i A)'),
                ]
                : []
        );
    }


    /**
     * -----------------------------------------------------------------
     * |  RELATIONSHIPS
     * |------------------------------------------------------------------
     * Get the parent model (Lead, Opportunity, etc.) that this AI analysis belongs to.
     *
     * This is a polymorphic relationship allowing AI insights
     * to be linked to multiple entity types.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo
     */
    public function analysisable(): MorphTo
    {
        return $this->morphTo();
    }
}
