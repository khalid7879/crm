<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class LeadDesignation extends Model
{
    use HasFactory, Notifiable, HasUlids;

    protected $fillable = [
        'lead_id',
        'data_designation_id',
    ];
}
