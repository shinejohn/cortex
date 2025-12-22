<?php

declare(strict_types=1);

namespace App\Services\DayNews;

use App\Models\Photo;
use App\Models\PhotoAlbum;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

final class PhotoService
{
    /**
     * Upload and process a photo
     */
    public function uploadPhoto(UploadedFile $file, array $data, string $userId, ?string $albumId = null): Photo
    {
        // Validate album ownership if provided
        if ($albumId) {
            $album = PhotoAlbum::find($albumId);
            if (!$album || $album->user_id !== $userId) {
                throw new \Exception('Album not found or access denied.');
            }
        }

        // Store original image
        $path = $file->store('photos', 'public');
        $disk = 'public';

        // Get image dimensions (using getimagesize)
        $imageInfo = @getimagesize($file->getRealPath());
        $width = $imageInfo[0] ?? null;
        $height = $imageInfo[1] ?? null;
        $fileSize = $file->getSize();

        // Create thumbnail (simplified - can be enhanced with Intervention Image later)
        $thumbnailPath = $this->createThumbnail($file, $path);

        $photo = Photo::create([
            'user_id' => $userId,
            'album_id' => $albumId,
            'title' => $data['title'] ?? $file->getClientOriginalName(),
            'description' => $data['description'] ?? null,
            'image_path' => $path,
            'image_disk' => $disk,
            'thumbnail_path' => $thumbnailPath,
            'category' => $data['category'] ?? null,
            'status' => 'approved', // Auto-approve for now
            'width' => $width,
            'height' => $height,
            'file_size' => $fileSize,
        ]);

        // Attach regions if provided
        if (!empty($data['region_ids'])) {
            $photo->regions()->attach($data['region_ids']);
        }

        // Update album photo count
        if ($albumId) {
            PhotoAlbum::find($albumId)?->incrementPhotosCount();
        }

        return $photo;
    }

    /**
     * Create thumbnail from uploaded file
     * Note: Simplified version - can be enhanced with Intervention Image for better quality
     */
    private function createThumbnail(UploadedFile $file, string $originalPath): ?string
    {
        // For now, return null - thumbnails can be generated on-demand or via queue job
        // TODO: Install intervention/image and implement proper thumbnail generation
        return null;
    }

    /**
     * Create photo album
     */
    public function createAlbum(array $data, string $userId, ?string $workspaceId = null): PhotoAlbum
    {
        $album = PhotoAlbum::create([
            'user_id' => $userId,
            'workspace_id' => $workspaceId,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'visibility' => $data['visibility'] ?? 'public',
        ]);

        // Attach cover image if provided
        if (!empty($data['cover_image_id'])) {
            $photo = Photo::find($data['cover_image_id']);
            if ($photo) {
                $album->update(['cover_image' => $photo->image_url]);
            }
        }

        return $album;
    }

    /**
     * Delete photo and its files
     */
    public function deletePhoto(Photo $photo): void
    {
        // Delete files
        Storage::disk($photo->image_disk)->delete($photo->image_path);
        if ($photo->thumbnail_path) {
            Storage::disk($photo->image_disk)->delete($photo->thumbnail_path);
        }

        // Update album count
        if ($photo->album_id) {
            PhotoAlbum::find($photo->album_id)?->decrement('photos_count');
        }

        $photo->delete();
    }
}

