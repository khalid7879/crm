<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Tenant Product Model
 *
 * Represents a product that can belong to categories and
 * be attached to leads and opportunities within the CRM.
 *
 * @property string $id
 * @property string $name
 * @property bool $is_active
 *
 * @property-read array $model_time
 * @property-read \App\Models\Tenant\DataCategory|null $category
 * @property-read string $category_name
 *
 * @property-read \Illuminate\Database\Eloquent\Collection $leads
 * @property-read \Illuminate\Database\Eloquent\Collection $opportunities
 * @property-read \Illuminate\Database\Eloquent\Collection $categories
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
class Product extends Model
{
    use LogsActivity, HasFactory, Notifiable, HasUlids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'price',
        'is_active',
    ];

    /**
     * The accessors to append to the model's array/json.
     *
     * @var array<int, string>
     */
    protected $appends = ['first_letter', 'model_time', 'category', 'category_name'];

    /* ======================================================
     |  ATTRIBUTE ACCESSORS
     |  - firstLetter: formatted first letter with bgColor
     |  - modelTime        → Human readable timestamps
     |  - category          → First related category model (if eager loaded)
     |  - categoryName     → First related category name (if eager loaded)
     ====================================================== */

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

    protected function category(): Attribute
    {
        return Attribute::make(
            get: fn() =>
            $this->relationLoaded('categories')
                ? ($this->categories->first() ?? null)
                : null
        );
    }

    protected function categoryName(): Attribute
    {
        return Attribute::make(
            get: fn() =>
            $this->relationLoaded('categories')
                ? ($this->categories->first()?->name ?? '')
                : ''
        );
    }

    /* ======================================================
     |  ACTIVITY LOGGING
     |  - Logs create, update, delete events
     |  - Uses Spatie Activitylog
     ====================================================== */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(
                fn(string $eventName) => "This product ({$this->id}) has been {$eventName}"
            )
            ->useLogName(PRODUCT);
    }

    /* ======================================================
     |  RELATIONSHIPS
     |  - leads         → Leads related to this product
     |  - opportunities → Opportunities related to this product
     |  - categories    → Categories associated with this product
     ====================================================== */
    public function leads(): MorphToMany
    {
        return $this->morphToMany(Lead::class, 'productable')->withTimestamps();
    }

    public function opportunities(): MorphToMany
    {
        return $this->morphToMany(Opportunity::class, 'productable')->withTimestamps();
    }

    public function categories(): MorphToMany
    {
        return $this->morphToMany(
            DataCategory::class,
            'categoryable',
            'categoryables',
            'categoryable_id',
            'data_category_id'
        )->withTimestamps();
    }
}
