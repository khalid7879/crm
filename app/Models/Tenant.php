<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;
use Stancl\Tenancy\Database\Models\TenantPivot;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use LogsActivity;
    use HasDatabase, Notifiable, HasUlids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];

    protected static function booted()
    {
        static::creating(function ($tenant) {
            if (empty($tenant->id)) {
                $tenant->id = Str::slug($tenant->company, '-');
            }
        });
    }

    /**
     * Define custom columns for tenant
     *
     * @return array
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'company',
            'email_verify_token',
            'email_verified_at',
            'email_verify_start_at',
            'email_verify_expired_at',
            'mobile_no',
            'mobile_verify_token',
            'mobile_verified_at',
            'mobile_verified_start_at',
            'mobile_verified_expired_at',
            'timezone',
            'locale',
            'currency',
            'avatar',
            'plan',
            'trial_ends_at',
            'subscription_ends_at',
            'max_users',
            'profile_completion_percentage',
            'status'
        ];
    }


    public function getActivitylogOptions(): LogOptions
    {

        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            // ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "This {$this->id} model has been {$eventName}")
            ->useLogName("TENANT_REGISTER");
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(CentralUser::class, 'tenant_users', 'tenant_id', 'global_user_id', 'id', 'global_id')
            ->using(TenantPivot::class);
    }
}
