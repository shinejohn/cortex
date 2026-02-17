<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\DayNewsPost;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class SocialShareService
{
    /**
     * Post an article to selected platforms.
     *
     * @param  array  $platforms  Array of platform names ['facebook', 'twitter', 'linkedin']
     * @return array Status of each platform ['facebook' => true, 'twitter' => false]
     */
    public function post(DayNewsPost $post, array $platforms): array
    {
        $results = [];

        foreach ($platforms as $platform) {
            $method = 'postTo'.ucfirst($platform);
            if (method_exists($this, $method)) {
                try {
                    $success = $this->$method($post);
                    $results[$platform] = $success;

                    // Update the post's tracking column
                    $this->updateShareStatus($post, $platform, $success);
                } catch (Exception $e) {
                    Log::error("Failed to post to $platform: ".$e->getMessage());
                    $results[$platform] = false;
                    $this->updateShareStatus($post, $platform, false, $e->getMessage());
                }
            }
        }

        return $results;
    }

    private function updateShareStatus(DayNewsPost $post, string $platform, bool $success, ?string $error = null): void
    {
        $currentStatus = $post->social_share_status ?? [];

        $currentStatus[$platform] = [
            'status' => $success ? 'posted' : 'failed',
            'timestamp' => now()->toIso8601String(),
            'error' => $error,
        ];

        $post->update(['social_share_status' => $currentStatus]);
    }

    private function postToFacebook(DayNewsPost $post): bool
    {
        $token = config('services.facebook.page_access_token');
        $pageId = config('services.facebook.page_id');

        if (! $token || ! $pageId) {
            throw new Exception('Facebook credentials not configured');
        }

        $response = Http::post("https://graph.facebook.com/v19.0/$pageId/feed", [
            'access_token' => $token,
            'message' => $post->title."\n\n".$post->excerpt,
            'link' => route('daynews.posts.show', $post->slug),
            'published' => true,
        ]);

        return $response->successful();
    }

    private function postToTwitter(DayNewsPost $post): bool
    {
        // Placeholder for X API v2 implementation
        // Requires OAuth 1.0a or OAuth 2.0 User Context usually
        $apiKey = config('services.twitter.api_key');

        if (! $apiKey) {
            // emulate success for now if no keys, or throw exception
            // throw new \Exception('Twitter credentials not configured');
            return false;
        }

        // Implementation would go here using commonly available libraries or Http client
        return true;
    }

    private function postToLinkedin(DayNewsPost $post): bool
    {
        // Placeholder for LinkedIn UGC API
        $token = config('services.linkedin.access_token');
        $personUrn = config('services.linkedin.person_urn'); // urn:li:person:12345 or urn:li:organization:12344

        if (! $token || ! $personUrn) {
            return false;
        }

        $response = Http::withToken($token)->post('https://api.linkedin.com/v2/ugcPosts', [
            'author' => $personUrn,
            'lifecycleState' => 'PUBLISHED',
            'specificContent' => [
                'com.linkedin.ugc.ShareContent' => [
                    'shareCommentary' => [
                        'text' => $post->title.' '.route('daynews.posts.show', $post->slug),
                    ],
                    'shareMediaCategory' => 'ARTICLE',
                    'media' => [
                        [
                            'status' => 'READY',
                            'description' => [
                                'text' => $post->excerpt,
                            ],
                            'originalUrl' => route('daynews.posts.show', $post->slug),
                            'title' => [
                                'text' => $post->title,
                            ],
                        ],
                    ],
                ],
            ],
            'visibility' => [
                'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC',
            ],
        ]);

        return $response->successful();
    }
}
