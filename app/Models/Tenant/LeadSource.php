<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class LeadSource extends Model
{
    use HasFactory, Notifiable, HasUlids;

    protected $fillable = [
        'lead_id',
        'data_source_id',
    ];


    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['model_time'];

    /**
     * Custom model timing
     */
    protected function modelTime(): Attribute
    {
        return new Attribute(
            get: fn() => [
                'create_diff' => $this->created_at->diffForHumans(),
                'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'),
                'update_diff' => $this->updated_at->diffForHumans(),
                'update_formatted' => _dateFormat($this->updated_at, 'd M, Y (h:i A)')]
        );
    }
}
