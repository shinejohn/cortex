<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class UpcomingShow extends Model
{
    /** @use HasFactory<\Database\Factories\UpcomingShowFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'performer_id',
        'date',
        'venue',
        'tickets_available',
        'ticket_url',
        'ticket_price',
        'description',
    ];

    public function performer(): BelongsTo
    {
        return $this->belongsTo(Performer::class);
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString());
    }

    public function scopeWithTickets($query)
    {
        return $query->where('tickets_available', true);
    }

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'tickets_available' => 'boolean',
            'ticket_price' => 'decimal:2',
        ];
    }
}
