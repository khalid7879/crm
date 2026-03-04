<?php

namespace App\Models\Tenant;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attachment extends Model
{
    use HasUlids, HasFactory, Notifiable;
    /**
     * Primary key type and increment behavior.
     */
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'causer_id',
        'attachmentable_type',
        'attachmentable_id',
        'alt_text',
        'attachment_file',
        'details',
        'is_active',
    ];

    protected $table = 'attachments';
    protected $appends = ['model_time'];


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

    public function attachmentable(): MorphTo
    {
        return $this->morphTo();
    }
}
