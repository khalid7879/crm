<?php

namespace App\Models;

use App\Models\Tenant\Lead;
use App\Models\Tenant\Task;
use Illuminate\Support\Str;
use App\Models\Tenant\Address;
use App\Models\Tenant\Contact;
use Spatie\Permission\Traits\HasRoles;
use Stancl\Tenancy\Contracts\Syncable;
use Illuminate\Notifications\Notifiable;
use App\Traits\CleansUpMorphRelationsTrait;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Stancl\Tenancy\Database\Concerns\ResourceSyncing;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Class User
 *
 * Tenant-specific version of the User model.
 * 
 * - Supports multi-tenancy via Stancl Tenancy's `Syncable` contract.
 * - Implements role-based permissions through Spatie's `HasRoles` trait.
 * - Uses ULID instead of auto-increment IDs.
 * - Provides relations to tenant resources such as Leads, Tasks, Contacts, etc.
 * 
 * @package App\Models
 * 
 * @property string $id Unique ULID identifier
 * @property string|"" $global_id Corresponding central user ID
 * @property string $name User's full name
 * @property string $email User's email address
 * @property string $password Hashed password
 * @property \Illuminate\Support\Carbon|"" $email_verified_at When the email was verified
 * @property bool $is_active Whether the user account is active
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * 
 * @property-read array $model_time Custom formatted create/update timestamps
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class User extends Authenticatable implements Syncable
{
    use HasFactory, Notifiable, HasUlids;
    use ResourceSyncing, HasRoles;
    use CleansUpMorphRelationsTrait;

    /**
     * Primary key type and increment behavior.
     */
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Database table name.
     */
    protected $table = 'users';

    protected $fillable = [
        'global_id',
        'name',
        'email',
        'password',
        'is_active',
        'is_default_admin',
        'ip',
        'additional1',
        'additional2',
        'remember_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];


    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Append custom attributes to model's array form.
     */
    protected $appends = [
        'model_time',
        'get_department',
        'first_letter',
        'get_status',
        'get_model_stats',
        'get_data_tooltip',
        'get_is_model_deletable'
    ];


    /* --------------------------------------------------------------------------
       ATTRIBUTE ACCESSORS / MUTATORS
       --------------------------------------------------------------------------
       - getModelTime: formatted creation and update info
       - firstLetter: formatted first letter with bgColor
       - getDepartment: returns user latest department ['name' and 'id']
       - getContactReference: returns user equivalent contact reference 
       - getModelStats: returns user model stats
       - getDataTooltip: returns user data tooltip information
    -------------------------------------------------------------------------- */

    protected function getIsModelDeletable(): Attribute
    {
        return new Attribute(
            get: fn() => $this->is_default_admin == 1 ? false : true
        );
    }

    protected function getDataTooltip(): Attribute
    {
        return new Attribute(
            get: fn() => __("A verification email has been sent to your email. Please review your email and follow the instructions to verify your account", ['email' => $this->email])
        );
    }

    protected function getModelStats(): Attribute
    {
        $status = _getModelStatus((int) $this->is_active);

        return Attribute::make(
            get: fn() => [
                'primary' => [
                    [
                        'key' => 'keyStatus',
                        'label' => 'Status',
                        'value' => '<span class="badge ' . $status[1] . '">' . $status[0]  . '</span>',
                        'icon'  => 'success',
                    ],
                    [
                        'key' => 'keyEmail',
                        'label' => 'Email',
                        'value' => $this->email,
                        'icon'  => 'email',
                    ],
                    [
                        'key' => 'keyDepartment',
                        'label' => 'Department',
                        'value' => $this->relationLoaded('department')
                            ? ($this->department?->first()?->name ?? '')
                            : '',
                        'icon'  => 'departments',
                    ],
                    [
                        'key' => 'keyRole',
                        'label' => 'Role',
                        'value' => $this->relationLoaded('roles')
                            ? $this->roles->pluck('name')
                            ->map(fn($role) => '<span class="badge badge-ghost">' . e(Str::title($role)) . '</span>')
                            ->join(' ')
                            : '',
                        'icon' => 'roles',
                    ],
                ],
            ]
        );
    }
    protected function getStatus(): Attribute
    {
        $status = _getModelStatus((int) $this->is_active);
        return new Attribute(
            get: fn() => [
                'isActive'          => $this->is_active,
                'isActiveText'      => $status[0],
                'isActiveBgColor'   => $status[1],
                'isActiveBadge'     => $status[2],
            ]
        );
    }

    protected function modelTime(): Attribute
    {
        return new Attribute(
            get: fn() => [
                'create_diff'       => $this->created_at->diffForHumans(),
                'create_formatted'  => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                'create_date'  => _dateFormat($this->created_at, 'd M Y'),
                'update_diff'       => $this->updated_at->diffForHumans(),
                'update_formatted'  => _dateFormat($this->updated_at, 'd M, Y (h:i A)'),
                'update_date'  => _dateFormat($this->updated_at, 'd M Y'),
            ]
        );
    }


    protected function firstLetter(): Attribute
    {
        return Attribute::make(
            get: fn() => [
                'letter'  => $this->name ? Str::substr($this->name, 0, 1) : '',
                'bgColor' => $this->name
                    ? _getAlphabeticalColorName(Str::substr($this->name, 0, 1))
                    : 'gray',
            ]
        );
    }

    protected function getDepartment(): Attribute
    {
        return new Attribute(
            get: fn() => $this->relationLoaded('department')
                ? [
                    'name' => $this->department->sortByDesc(fn($model) => $model->pivot?->created_at)->first()?->name,
                    'id' => $this->department->sortByDesc(fn($model) => $model->pivot?->created_at)->first()?->id,
                ]
                : [
                    'name' => '',
                    'id' => ''
                ]
        );
    }

    protected function getContactReference(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->relationLoaded('contactReference')
                ? (
                    $this->contactReference->isNotEmpty()
                    ? [
                        'id'        => $this->contactReference?->first()?->id,
                        'name'      => $this->contactReference?->first()?->nickname,
                    ]
                    : [
                        'id'        => '',
                        'name'      => '',
                    ]
                )
                : [
                    'id'        => '',
                    'name'      => ''
                ]
        );
    }

    /* ============================================================
     | Syncable (Stancl Tenancy)
     * ============================================================
     | Define syncing behavior with central model.
     */

    public function getGlobalIdentifierKey()
    {
        return $this->getAttribute($this->getGlobalIdentifierKeyName());
    }

    public function getGlobalIdentifierKeyName(): string
    {
        return 'global_id';
    }

    public function getCentralModelName(): string
    {
        return CentralUser::class;
    }

    public function getSyncedAttributeNames(): array
    {
        return ['name', 'password', 'email'];
    }
    protected function ownerContact(): Attribute
    {
        return new Attribute(
            get: fn() =>
            $this->relationLoaded('userContacts')
                ? $this->userContacts->count()
                : ""
        );
    }


    /* ============================================================
     | Relationships
     * ============================================================
     | Define associations between User and tenant resources.
     */

    public function contactUser(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'contact_users', 'user_id', 'contact_id')->withTimestamps();
    }

    public function department(): BelongsToMany
    {
        return $this->belongsToMany(Department::class, 'user_departments', 'user_id', 'department_id')->withTimestamps();
    }

    public function leads(): MorphToMany
    {
        return $this->morphedByMany(Lead::class, 'associatable', 'associatables', 'contact_id', 'associatable_id');
    }

    public function address(): MorphToMany
    {
        return $this->morphedByMany(Address::class, 'addressable');
    }

    public function contactReference(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'contact_users', 'user_id', 'contact_id')->withTimestamps();
    }

    /**
     * The "booted" method of the User model.
     *
     * Hooks into the model's deleting event and ensures that all
     * pivot table entries related to the User are also
     * deleted. This helps maintain database integrity by cleaning
     * up associations automatically when a User is removed.
     *
     * @return void
     *
     * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
     */
    protected static function booted(): void
    {
        self::deleteFromPivotTables([
            'contact_users'    => 'user_id',
            'user_departments' => 'user_id',
            'associatables'    => 'contact_id',
        ]);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::ulid();
            }
        });
    }
}
