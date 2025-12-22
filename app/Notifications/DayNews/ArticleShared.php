<?php

declare(strict_types=1);

namespace App\Notifications\DayNews;

use App\Models\DayNewsPost;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification as BaseNotification;

final class ArticleShared extends BaseNotification
{
    use Queueable;

    public function __construct(
        public DayNewsPost $article,
        public User $sharer
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'article_share',
            'title' => 'Your article was shared',
            'message' => "{$this->sharer->name} shared \"{$this->article->title}\"",
            'action_url' => route('daynews.posts.show', $this->article->slug),
            'data' => [
                'article_id' => $this->article->id,
                'article_slug' => $this->article->slug,
                'sharer_id' => $this->sharer->id,
                'sharer_name' => $this->sharer->name,
            ],
        ];
    }
}

