<?php

namespace App\Models\Tenant;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class ActivityLog extends Model
{
    use HasFactory;
    /* --------------------------------------------------------------------------
       MODEL CONFIGURATION
       -------------------------------------------------------------------------- */

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'activity_log';


    protected $casts = [
        'date_start'       => 'datetime',
        'date_due'         => 'datetime',
        'date_reminder'    => 'datetime',
        'progress_percent' => 'float',
    ];



    protected $appends = ['model_time'];


    /* --------------------------------------------------------------------------
       ATTRIBUTE ACCESSORS / MUTATORS
       --------------------------------------------------------------------------
       - modelTime: returns formatted created_at time
    -------------------------------------------------------------------------- */



    protected function modelTime(): Attribute
    {
        return new Attribute(
            get: fn() => $this->created_at
                ? [
                    'create_diff'      => $this->created_at->diffForHumans(),
                    'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                    'create_date_only' => _dateFormat($this->created_at, 'd M Y'),
                    'update_diff'      => $this->updated_at ? $this->updated_at->diffForHumans() : "",
                    'update_formatted' => $this->updated_at ? _dateFormat($this->updated_at, 'd M, Y (h:i A)') : "",
                ]
                : ""
        );
    }


    public function causerContact()
    {
        return $this->hasOneThrough(
            Contact::class,       // Final model
            ContactUser::class,   // Intermediate model
            'user_id',            // FK on contact_users referencing user_id
            'id',                 // FK on contacts referencing contact_id
            'causer_id',          // Local key on activity_logs
            'contact_id'          // Local key on contact_users
        );
    }
}
