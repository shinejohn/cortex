<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AIEmployeeTask extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ai_employee_tasks';

    protected $fillable = [
        'ai_employee_id',
        'business_id',
        'type',
        'status',
        'payload',
        'result',
        'error_message',
        'scheduled_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'result' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(AIEmployee::class, 'ai_employee_id');
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
