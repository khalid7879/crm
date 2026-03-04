<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DataEmailSetting extends Model
{

    use HasFactory, Notifiable, HasUlids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'host',
        'port',
        'password',
        'encryption',
        'user_name',
        'mail_from_address',
        'is_active',
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
            get: fn() => ['create_diff' => $this->created_at->diffForHumans(), 'create_formatted' => _dateFormat($this->created_at, 'd M, Y (h:i A)'), 'update_diff' => $this->updated_at->diffForHumans(), 'update_formatted' => _dateFormat($this->updated_at, 'd M, Y (h:i A)')]
        );
    }
}
