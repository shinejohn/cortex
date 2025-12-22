<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\CreatorProfile;
use App\Models\Podcast;
use App\Models\PodcastEpisode;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

final class PodcastService
{
    /**
     * Create creator profile
     */
    public function createCreatorProfile(array $data, string $userId): CreatorProfile
    {
        return CreatorProfile::create([
            'user_id' => $userId,
            'display_name' => $data['display_name'],
            'bio' => $data['bio'] ?? null,
            'social_links' => $data['social_links'] ?? null,
            'status' => 'pending', // Requires approval
        ]);
    }

    /**
     * Create podcast
     */
    public function createPodcast(array $data, string $creatorProfileId): Podcast
    {
        $podcast = Podcast::create([
            'creator_profile_id' => $creatorProfileId,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'] ?? null,
            'status' => 'draft',
        ]);

        // Handle cover image
        if (!empty($data['cover_image'])) {
            $path = $data['cover_image']->store('podcasts', 'public');
            $podcast->update(['cover_image' => $path]);
        }

        // Attach regions
        if (!empty($data['region_ids'])) {
            $podcast->regions()->attach($data['region_ids']);
        }

        return $podcast;
    }

    /**
     * Upload episode audio file
     */
    public function uploadEpisode(PodcastEpisode $episode, UploadedFile $audioFile): void
    {
        $path = $audioFile->store('podcasts/episodes', 'public');
        $fileSize = $audioFile->getSize();

        // Get duration (simplified - would need audio processing library)
        $duration = null; // TODO: Use getID3 or similar to get actual duration

        $episode->update([
            'audio_file_path' => $path,
            'audio_file_disk' => 'public',
            'file_size' => $fileSize,
            'duration' => $duration,
        ]);
    }

    /**
     * Publish episode
     */
    public function publishEpisode(PodcastEpisode $episode): void
    {
        $episode->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Update podcast episode count
        $episode->podcast->incrementEpisodesCount();
    }
}

