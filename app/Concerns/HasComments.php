<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\Comment;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasComments
{
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function activeComments(): MorphMany
    {
        return $this->comments()->where('is_active', true);
    }

    public function rootComments(): MorphMany
    {
        return $this->comments()->whereNull('parent_id');
    }

    public function activeRootComments(): MorphMany
    {
        return $this->activeComments()->whereNull('parent_id');
    }
}
