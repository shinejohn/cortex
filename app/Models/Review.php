<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

final class Review extends Model
{
    /** @use HasFactory<\Database\Factories\ReviewFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'reviewable_type',
        'reviewable_id',
        'user_id',
        'title',
        'content',
        'rating',
        'is_verified',
        'is_featured',
        'helpful_votes',
        'helpful_count',
        'status',
        'approved_at',
        'approved_by',
        'rejection_reason',
    ];

    public function reviewable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Helper methods
    public function markAsHelpful(int $userId): void
    {
        $helpfulVotes = $this->helpful_votes ?? [];
        if (! in_array($userId, $helpfulVotes)) {
            $helpfulVotes[] = $userId;
            $this->update([
                'helpful_votes' => $helpfulVotes,
                'helpful_count' => count($helpfulVotes),
            ]);
        }
    }

    public function removeHelpful(int $userId): void
    {
        $helpfulVotes = $this->helpful_votes ?? [];
        $helpfulVotes = array_filter($helpfulVotes, fn ($id) => $id !== $userId);
        $this->update([
            'helpful_votes' => array_values($helpfulVotes),
            'helpful_count' => count($helpfulVotes),
        ]);
    }

    public function approve(int $approvedBy): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approvedBy,
        ]);
    }

    public function reject(string $reason): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeByRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    protected function casts(): array
    {
        return [
            'helpful_votes' => 'array',
            'is_verified' => 'boolean',
            'is_featured' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }
}
