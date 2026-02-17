<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class FillerBucket extends Model
{
    use HasUuids;

    protected $fillable = [
        'region_id', 'bucket_type', 'topic', 'article_count',
        'min_threshold', 'max_capacity', 'last_deployed_at',
        'last_replenished_at', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_deployed_at' => 'datetime',
        'last_replenished_at' => 'datetime',
    ];

    public function articles()
    {
        return $this->hasMany(FillerArticle::class, 'bucket_id');
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function scopeNeedsReplenishment($query)
    {
        return $query->where('is_active', true)
            ->whereColumn('article_count', '<', 'min_threshold');
    }
}
