<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CouponVote extends Model
{
    /** @use HasFactory<\Database\Factories\CouponVoteFactory> */
    use HasFactory;

    protected $fillable = [
        'coupon_id',
        'user_id',
        'vote_type',
    ];

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
