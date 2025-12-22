<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class PodcastEpisode extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'podcast_id',
        'title',
        'slug',
        'description',
        'show_notes',
        'audio_file_path',
        'audio_file_disk',
        'duration',
        'file_size',
        'episode_number',
        'status',
        'published_at',
        'listens_count',
        'downloads_count',
        'likes_count',
        'comments_count',
    ];

    public function podcast(): BelongsTo
    {
        return $this->belongsTo(Podcast::class, 'podcast_id');
    }

    // Podcast episodes can have comments, but they would need their own comment system
    // For now, we'll use the comments_count field to track engagement
    // TODO: Create PodcastComment model if comments are needed

    public function getAudioUrlAttribute(): string
    {
        return Storage::disk($this->audio_file_disk)->url($this->audio_file_path);
    }

    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration) {
            return '0:00';
        }

        $hours = floor($this->duration / 3600);
        $minutes = floor(($this->duration % 3600) / 60);
        $seconds = $this->duration % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at');
    }

    public function incrementListensCount(): void
    {
        $this->increment('listens_count');
        $this->podcast->incrementTotalListens();
    }

    public function incrementDownloadsCount(): void
    {
        $this->increment('downloads_count');
    }

    public function incrementLikesCount(): void
    {
        $this->increment('likes_count');
    }

    public function incrementCommentsCount(): void
    {
        $this->increment('comments_count');
    }

    protected static function booted(): void
    {
        self::creating(function (PodcastEpisode $episode): void {
            if (empty($episode->slug)) {
                $episode->slug = static::generateUniqueSlug($episode->title);
            }
        });

        self::created(function (PodcastEpisode $episode): void {
            $episode->podcast->incrementEpisodesCount();
        });
    }

    protected static function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }

    protected function casts(): array
    {
        return [
            'duration' => 'integer',
            'file_size' => 'integer',
            'published_at' => 'datetime',
            'listens_count' => 'integer',
            'downloads_count' => 'integer',
            'likes_count' => 'integer',
            'comments_count' => 'integer',
        ];
    }
}

