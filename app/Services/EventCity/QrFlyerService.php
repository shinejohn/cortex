<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Models\Performer;
use App\Models\QrFlyer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

final class QrFlyerService
{
    /**
     * Generate a QR flyer for a performer
     */
    public function generateFlyer(Performer $performer, array $data): QrFlyer
    {
        $landingUrl = url("/p/{$performer->landing_page_slug}");

        $qrImagePath = $this->generateQrImage($landingUrl, $performer->id);

        return QrFlyer::create([
            'performer_id' => $performer->id,
            'template' => $data['template'] ?? 'default',
            'title' => $data['title'],
            'subtitle' => $data['subtitle'] ?? null,
            'qr_code_data' => $landingUrl,
            'qr_image_path' => $qrImagePath,
            'is_active' => true,
        ]);
    }

    /**
     * Track a QR code scan
     */
    public function trackScan(QrFlyer $flyer): void
    {
        $flyer->incrementScanCount();
    }

    /**
     * Get available flyer templates
     */
    public function getAvailableTemplates(): array
    {
        return [
            ['id' => 'default', 'name' => 'Default', 'description' => 'Clean and simple design'],
            ['id' => 'modern', 'name' => 'Modern', 'description' => 'Sleek dark theme'],
            ['id' => 'classic', 'name' => 'Classic', 'description' => 'Traditional concert poster style'],
            ['id' => 'neon', 'name' => 'Neon', 'description' => 'Vibrant neon-inspired design'],
        ];
    }

    /**
     * Generate QR code image using external API and store locally
     */
    private function generateQrImage(string $data, string $performerId): ?string
    {
        try {
            $response = Http::get('https://api.qrserver.com/v1/create-qr-code/', [
                'size' => '300x300',
                'data' => $data,
                'format' => 'png',
            ]);

            if ($response->successful()) {
                $filename = "qr-flyers/{$performerId}/".Str::uuid().'.png';
                Storage::disk('public')->put($filename, $response->body());

                return $filename;
            }
        } catch (Throwable $e) {
            Log::warning('Failed to generate QR code image', ['error' => $e->getMessage()]);
        }

        return null;
    }
}
