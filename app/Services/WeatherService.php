<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Event;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class WeatherService
{
    private readonly string $apiKey;
    private readonly string $baseUrl;

    public function __construct()
    {
        $apiKey = config('services.openweather.api_key');
        // Don't throw - allow service to be instantiated even without API key
        // Methods will return null if API key is missing
        $this->apiKey = $apiKey ?? '';
        $this->baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    public function getWeatherForEvent(Event $event): ?array
    {
        if (!$event->latitude || !$event->longitude) {
            return null;
        }

        // Return null if API key is not configured
        if (empty($this->apiKey)) {
            return null;
        }

        $cacheKey = "weather:event:{$event->id}:".$event->event_date->format('Y-m-d');

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($event) {
            try {
                $response = Http::get("{$this->baseUrl}/forecast", [
                    'lat' => $event->latitude,
                    'lon' => $event->longitude,
                    'appid' => $this->apiKey,
                    'units' => 'imperial',
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    // Find forecast for event date/time
                    $eventDateTime = $event->event_date->copy();
                    if ($event->time) {
                        $timeParts = explode(':', $event->time);
                        $eventDateTime->setTime((int) $timeParts[0], (int) $timeParts[1]);
                    }

                    $forecast = $this->findClosestForecast($data['list'] ?? [], $eventDateTime);

                    if ($forecast) {
                        return [
                            'temperature' => $forecast['main']['temp'] ?? null,
                            'feels_like' => $forecast['main']['feels_like'] ?? null,
                            'condition' => $forecast['weather'][0]['main'] ?? null,
                            'description' => $forecast['weather'][0]['description'] ?? null,
                            'icon' => $forecast['weather'][0]['icon'] ?? null,
                            'humidity' => $forecast['main']['humidity'] ?? null,
                            'wind_speed' => $forecast['wind']['speed'] ?? null,
                            'wind_direction' => $forecast['wind']['deg'] ?? null,
                        ];
                    }
                }

                return null;
            } catch (\Exception $e) {
                Log::error('Weather API error', [
                    'event_id' => $event->id,
                    'error' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    public function getWeatherForCoordinates(float $latitude, float $longitude, ?\Carbon\Carbon $dateTime = null): ?array
    {
        return $this->getWeatherForLocation($latitude, $longitude, $dateTime);
    }

    public function getWeatherForLocation(float $latitude, float $longitude, ?\Carbon\Carbon $dateTime = null): ?array
    {
        // Return null if API key is not configured
        if (empty($this->apiKey)) {
            return null;
        }

        $cacheKey = "weather:location:{$latitude}:{$longitude}:".($dateTime ? $dateTime->format('Y-m-d-H') : 'current');

        return Cache::remember($cacheKey, now()->addHours(1), function () use ($latitude, $longitude, $dateTime) {
            try {
                if ($dateTime && $dateTime->isFuture() && $dateTime->diffInHours(now()) <= 120) {
                    // Use forecast API for future dates
                    $response = Http::get("{$this->baseUrl}/forecast", [
                        'lat' => $latitude,
                        'lon' => $longitude,
                        'appid' => $this->apiKey,
                        'units' => 'imperial',
                    ]);

                    if ($response->successful()) {
                        $data = $response->json();
                        $forecast = $this->findClosestForecast($data['list'] ?? [], $dateTime);

                        if ($forecast) {
                            return $this->formatWeatherData($forecast);
                        }
                    }
                } else {
                    // Use current weather API
                    $response = Http::get("{$this->baseUrl}/weather", [
                        'lat' => $latitude,
                        'lon' => $longitude,
                        'appid' => $this->apiKey,
                        'units' => 'imperial',
                    ]);

                    if ($response->successful()) {
                        return $this->formatWeatherData($response->json());
                    }
                }

                return null;
            } catch (\Exception $e) {
                Log::error('Weather API error', [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'error' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    private function findClosestForecast(array $forecasts, \Carbon\Carbon $targetDateTime): ?array
    {
        $closest = null;
        $minDiff = PHP_INT_MAX;

        foreach ($forecasts as $forecast) {
            $forecastTime = \Carbon\Carbon::parse($forecast['dt_txt']);
            $diff = abs($targetDateTime->diffInMinutes($forecastTime));

            if ($diff < $minDiff) {
                $minDiff = $diff;
                $closest = $forecast;
            }
        }

        return $closest;
    }

    private function formatWeatherData(array $data): array
    {
        return [
            'temperature' => $data['main']['temp'] ?? null,
            'feels_like' => $data['main']['feels_like'] ?? null,
            'condition' => $data['weather'][0]['main'] ?? null,
            'description' => $data['weather'][0]['description'] ?? null,
            'icon' => $data['weather'][0]['icon'] ?? null,
            'humidity' => $data['main']['humidity'] ?? null,
            'wind_speed' => $data['wind']['speed'] ?? null,
            'wind_direction' => $data['wind']['deg'] ?? null,
            'pressure' => $data['main']['pressure'] ?? null,
            'visibility' => $data['visibility'] ?? null,
        ];
    }
}

