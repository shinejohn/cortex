<?php

namespace App\Services\Newsroom;

use App\Models\RawContent;
use App\Models\CollectionMethod;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Process;

class WebScrapingService
{
    public function scrape(CollectionMethod $method): array
    {
        Log::info('Web scraping', ['source' => $method->source->name]);

        try {
            if ($method->requires_javascript) {
                return $this->scrapeWithPlaywright($method);
            }
            return $this->scrapeSimple($method);
        } catch (\Exception $e) {
            Log::error('Scrape failed', ['error' => $e->getMessage()]);
            $method->recordFailure($e->getMessage());
            throw $e;
        }
    }

    private function scrapeWithPlaywright(CollectionMethod $method): array
    {
        $config = $method->scrape_config ?? [];
        $selectors = $config['selectors'] ?? [];
        $list = $selectors['list'] ?? 'article, .news-item';
        $title = $selectors['title'] ?? 'h1, h2, .title';

        $script = <<<JS
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('{$method->endpoint_url}', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('{$list}', { timeout: 30000 }).catch(() => {});
    const items = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('{$list}').forEach(el => {
            const t = el.querySelector('{$title}');
            if (t) results.push({
                title: t.innerText.trim(),
                content: el.querySelector('p')?.innerText || '',
                url: el.querySelector('a')?.href || ''
            });
        });
        return results;
    });
    console.log(JSON.stringify({ items }));
    await browser.close();
})();
JS;

        $scriptPath = storage_path('app/scrape-' . uniqid() . '.js');
        file_put_contents($scriptPath, $script);
        $result = Process::timeout(120)->run(['node', $scriptPath]);
        unlink($scriptPath);

        if (!$result->successful()) throw new \Exception("Playwright failed");

        $output = json_decode($result->output(), true);
        return $this->storeItems($method, $output['items'] ?? []);
    }

    private function scrapeSimple(CollectionMethod $method): array
    {
        $response = Http::timeout(30)->get($method->endpoint_url);
        $html = $response->body();

        libxml_use_internal_errors(true);
        $dom = new \DOMDocument();
        $dom->loadHTML($html, LIBXML_NOERROR);
        $xpath = new \DOMXPath($dom);

        $items = [];
        $nodes = $xpath->query('//article | //*[contains(@class, "news-item")]');
        foreach ($nodes as $node) {
            $title = trim($xpath->evaluate('string(.//h1 | .//h2 | .//h3)', $node));
            if ($title) {
                $items[] = [
                    'title' => $title,
                    'content' => trim($xpath->evaluate('string(.//p)', $node)),
                    'url' => $xpath->evaluate('string(.//a/@href)', $node),
                ];
            }
        }

        return $this->storeItems($method, $items);
    }

    private function storeItems(CollectionMethod $method, array $items): array
    {
        $stored = [];
        $duplicates = 0;

        foreach ($items as $item) {
            $title = trim($item['title'] ?? '');
            if (empty($title)) continue;

            $url = $this->absoluteUrl($item['url'] ?? '', $method->endpoint_url);
            $hash = RawContent::generateContentHash($title, $url);

            if (RawContent::isDuplicate($hash, $method->source->community_id)) {
                $duplicates++;
                continue;
            }

            $stored[] = RawContent::create([
                'source_id' => $method->source_id,
                'collection_method_id' => $method->id,
                'community_id' => $method->source->community_id,
                'region_id' => $method->source->region_id,
                'source_url' => $url,
                'source_title' => $title,
                'source_content' => $item['content'] ?? '',
                'content_hash' => $hash,
                'collection_method' => 'scrape',
            ]);
        }

        $method->recordCollection(count($stored), $duplicates);
        return $stored;
    }

    private function absoluteUrl(?string $url, string $base): ?string
    {
        if (!$url) return null;
        if (str_starts_with($url, 'http')) return $url;
        if (str_starts_with($url, '/')) {
            $p = parse_url($base);
            return ($p['scheme'] ?? 'https') . '://' . ($p['host'] ?? '') . $url;
        }
        return $url;
    }
}
