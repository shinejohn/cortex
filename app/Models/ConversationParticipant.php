<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

final class ConversationParticipant extends Pivot
{
    use HasFactory, HasUuid;

    protected $table = 'conversation_participants';

    protected $fillable = [
        'conversation_id',
        'user_id',
        'joined_at',
        'last_read_at',
        'is_admin',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'last_read_at' => 'datetime',
            'is_admin' => 'boolean',
        ];
    }
}
