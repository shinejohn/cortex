<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class SearchSuggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'query',
        'popularity',
        'click_count',
    ];

    public function incrementPopularity(): void
    {
        $this->increment('popularity');
    }

    public function incrementClickCount(): void
    {
        $this->increment('click_count');
    }

    protected function casts(): array
    {
        return [
            'popularity' => 'integer',
            'click_count' => 'integer',
        ];
    }
}

