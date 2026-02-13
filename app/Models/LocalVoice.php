<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class LocalVoice extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'local_voices';

    protected $fillable = [
        'business_id',
        'title',
        'description',
        'author',
        'url',
        'type',
        'duration',
        'image_url',
        'published_at',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }
}
