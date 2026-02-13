#!/bin/bash
# detect-patch-clearwater.sh
# Run from your Laravel project root: bash detect-patch-clearwater.sh

cat <<'TINKER_EOF' | php artisan tinker --no-interaction
$source = \App\Models\NewsSource::where('name', 'Patch Clearwater')->first();

if (!$source) {
    echo "ERROR: NewsSource 'Patch Clearwater' not found\n";
    exit(1);
}

echo "Found source: {$source->name} ({$source->website_url})\n";

$fetcher = app(\App\Services\Newsroom\AdaptiveFetcherService::class);
$result = $fetcher->autoConfigureMethod($source);

$source->refresh();

echo "Platform detected: {$source->detected_platform_slug}\n";
echo "Profile ID: {$source->platform_profile_id}\n";
echo "Detected at: {$source->platform_detected_at}\n";

if ($result) {
    echo "Method type: {$result->method_type}\n";
    echo "Endpoint: {$result->endpoint_url}\n";
    echo "Requires JS: " . ($result->requires_javascript ? 'yes' : 'no') . "\n";
}
TINKER_EOF
