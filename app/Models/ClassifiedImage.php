<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

final class ClassifiedImage extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'classified_id',
        'path',
        'disk',
        'order',
        'is_primary',
    ];

    public function classified(): BelongsTo
    {
        return $this->belongsTo(Classified::class);
    }

    public function getUrlAttribute(): string
    {
        if ($this->disk === 's3') {
            return route('daynews.img-cdn', ['path' => $this->path]);
        }

        return Storage::disk($this->disk)->url($this->path);
    }

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'is_primary' => 'boolean',
        ];
    }
}
