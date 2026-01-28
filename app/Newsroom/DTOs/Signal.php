<?php

declare(strict_types=1);

namespace App\Newsroom\DTOs;

use App\Newsroom\Enums\SignalType;
use Carbon\Carbon;
use Illuminate\Contracts\Support\Arrayable;

class Signal implements Arrayable
{
    public function __construct(
        public readonly string $title,
        public readonly ?string $content,
        public readonly ?string $url,
        public readonly string $authorName,
        public readonly ?string $sourceName,
        public readonly Carbon $publishedAt,
        public readonly SignalType $type,
        public readonly array $metadata = [],
        public readonly ?string $originalId = null,
        public readonly ?string $contentHash = null
    ) {
    }

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'content' => $this->content,
            'url' => $this->url,
            'author_name' => $this->authorName,
            'source_name' => $this->sourceName,
            'published_at' => $this->publishedAt->toIso8601String(),
            'type' => $this->type->value,
            'metadata' => $this->metadata,
            'original_id' => $this->originalId,
            'content_hash' => $this->contentHash ?? $this->generateHash(),
        ];
    }

    public function generateHash(): string
    {
        return hash('sha256', "{$this->type->value}|{$this->url}|{$this->title}");
    }
}
