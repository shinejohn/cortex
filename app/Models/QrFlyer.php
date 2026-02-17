<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class QrFlyer extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'performer_id',
        'template',
        'title',
        'subtitle',
        'qr_code_data',
        'qr_image_path',
        'flyer_image_path',
        'scan_count',
        'is_active',
    ];

    public function performer(): BelongsTo
    {
        return $this->belongsTo(Performer::class);
    }

    public function incrementScanCount(): void
    {
        $this->increment('scan_count');
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
