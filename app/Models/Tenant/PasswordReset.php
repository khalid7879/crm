<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    protected $table = 'password_reset_tokens';
    // protected $connection = 'tenant';
    public $timestamps = false;

    protected $fillable = [
        'email',
        'token',
        'created_at',
        'updated_at',
    ];
}
