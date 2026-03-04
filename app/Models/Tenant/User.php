<?php

namespace App\Models\Tenant;

use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable, HasUlids, HasRoles;

    protected $primaryKey = 'id';
    public $incrementing = false;

    protected $fillable = ['name', 'email', 'password', 'global_id'];

    protected $hidden = ['password', 'remember_token'];


    /**
     * Get the address
     */
    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    /**
     * Get the task
     */
    public function tasks(): MorphOne
    {
        return $this->morphOne(Task::class, 'associatable');
    }

    /**
     * Get the contact
     */
    public function contacts(): MorphOne
    {
        return $this->morphOne(Contact::class, 'associatable');
    }

    /**
     * User model get department data
     */
    // public function userDepartment(): HasOne
    // {
    //     return $this->hasOne(UserDepartment::class, 'user_id', 'id');
    // }

}
