<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Message extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'type',
        'metadata',
        'edited_at',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function isText(): bool
    {
        return $this->type === 'text';
    }

    public function isImage(): bool
    {
        return $this->type === 'image';
    }

    public function isFile(): bool
    {
        return $this->type === 'file';
    }

    public function isSystem(): bool
    {
        return $this->type === 'system';
    }

    public function isEdited(): bool
    {
        return $this->edited_at !== null;
    }

    public function markAsEdited(): void
    {
        $this->update(['edited_at' => now()]);
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'edited_at' => 'datetime',
        ];
    }
}
