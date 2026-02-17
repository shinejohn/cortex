<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class FillerArticle extends Model
{
    use HasUuids;

    protected $fillable = [
        'bucket_id', 'region_id', 'title', 'content', 'excerpt',
        'seo_metadata', 'featured_image_url', 'status', 'deployed_at',
        'published_post_id', 'valid_from', 'valid_until',
    ];

    protected $casts = [
        'seo_metadata' => 'array',
        'deployed_at' => 'datetime',
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];

    public function bucket()
    {
        return $this->belongsTo(FillerBucket::class, 'bucket_id');
    }

    public function scopeReady($query)
    {
        return $query->where('status', 'ready')
            ->where(fn ($q) => $q->whereNull('valid_from')->orWhere('valid_from', '<=', today()))
            ->where(fn ($q) => $q->whereNull('valid_until')->orWhere('valid_until', '>=', today()));
    }
}
