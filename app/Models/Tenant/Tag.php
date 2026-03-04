<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Notifications\Notifiable;

class Tag extends Model
{
    use Notifiable, HasUlids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
    ];

    /**
     * Get all of the leads that are assigned this tag
     */
    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Lead::class, 'taggable');
    }

    /**
     * Get all of the opportunity that are assigned this tag
     */
    public function opportunity(): MorphToMany
    {
        return $this->morphedByMany(Opportunity::class, 'taggable');
    }

    /**
     * Get all of the organization that are assigned this tag
     */
    public function organization(): MorphToMany
    {
        return $this->morphedByMany(Organization::class, 'taggable','taggables');
    }

    /**
     * Get all of the contact that are assigned this tag
     */
    public function contacts(): MorphToMany
    {
        return $this->morphedByMany(Contact::class, 'taggable', 'taggables');
    }
}
