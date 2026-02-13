#!/bin/bash
# detect-all-platforms.sh
# Run from your Laravel project root: bash detect-all-platforms.sh

cat <<'TINKER_EOF' | php artisan tinker --no-interaction
$sources = \App\Models\NewsSource::where('is_active', true)
    ->whereNotNull('website_url')
    ->where('website_url', '!=', '')
    ->get();

echo "Found {$sources->count()} active sources with URLs\n";
echo str_repeat('=', 70) . "\n\n";

$fetcher = app(\App\Services\Newsroom\AdaptiveFetcherService::class);

$success = 0;
$failed = 0;
$skipped = 0;

foreach ($sources as $source) {
    echo "► {$source->name}\n";
    echo "  URL: {$source->website_url}\n";

    if ($source->detected_platform_slug) {
        echo "  Already detected: {$source->detected_platform_slug} — skipping\n\n";
        $skipped++;
        continue;
    }

    try {
        $result = $fetcher->autoConfigureMethod($source);
        $source->refresh();

        $platform = $source->detected_platform_slug ?? 'unknown';
        $method = $result ? $result->method_type : 'none';
        $endpoint = $result ? $result->endpoint_url : 'n/a';
        $js = $result && $result->requires_javascript ? 'yes' : 'no';

        echo "  Platform: {$platform}\n";
        echo "  Method: {$method}\n";
        echo "  Endpoint: {$endpoint}\n";
        echo "  Requires JS: {$js}\n";
        $success++;
    } catch (\Exception $e) {
        echo "  ERROR: {$e->getMessage()}\n";
        $failed++;
    }

    echo "\n";
}

echo str_repeat('=', 70) . "\n";
echo "DONE: {$success} detected, {$skipped} already done, {$failed} failed\n";
echo "Total sources processed: {$sources->count()}\n";
TINKER_EOF
