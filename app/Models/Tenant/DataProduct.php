<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class DataProduct extends Model
{
    use HasFactory, Notifiable, HasUlids;

    protected $fillable = [
        'name',
        'is_active',
    ];
}
