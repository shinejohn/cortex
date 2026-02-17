<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class AIEmployee extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'ai_employees';

    protected $fillable = [
        'business_id',
        'name',
        'role',
        'personality_config',
        'status',
        'avatar_url',
    ];

    protected $casts = [
        'personality_config' => 'array',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(AIEmployeeTask::class, 'ai_employee_id');
    }
}
