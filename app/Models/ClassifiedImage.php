<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ClassifiedImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'classified_id',
        'image_path',
        'image_disk',
        'order',
    ];

    public function classified(): BelongsTo
    {
        return $this->belongsTo(Classified::class, 'classified_id');
    }

    public function getImageUrlAttribute(): string
    {
        return \Illuminate\Support\Facades\Storage::disk($this->image_disk)->url($this->image_path);
    }
}

