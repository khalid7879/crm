<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class LeadStage extends Model
{
    use HasFactory, Notifiable;
    
    public $incrementing = false;
    protected $primaryKey = null;

    protected $fillable = [
        'lead_id',
        'stage_id',
    ];


}
