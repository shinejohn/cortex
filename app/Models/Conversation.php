<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class Conversation extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'type',
        'title',
        'metadata',
        'last_message_at',
    ];

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->using(ConversationParticipant::class)
            ->withPivot(['id', 'joined_at', 'last_read_at', 'is_admin'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany('created_at');
    }

    public function conversationParticipants(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function getUnreadCountForUser(string $userId): int
    {
        $participant = $this->conversationParticipants()
            ->where('user_id', $userId)
            ->first();

        if (! $participant || ! $participant->last_read_at) {
            return $this->messages()->count();
        }

        return $this->messages()
            ->where('created_at', '>', $participant->last_read_at)
            ->where('sender_id', '!=', $userId)
            ->count();
    }

    public function markAsReadForUser(string $userId): void
    {
        $this->conversationParticipants()
            ->where('user_id', $userId)
            ->update(['last_read_at' => now()]);
    }

    public function isPrivate(): bool
    {
        return $this->type === 'private';
    }

    public function isGroup(): bool
    {
        return $this->type === 'group';
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'last_message_at' => 'datetime',
        ];
    }
}
