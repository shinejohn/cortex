<?php

declare(strict_types=1);

namespace App\Notifications\DayNews;

use App\Models\DayNewsPost;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification as BaseNotification;

final class ArticleLiked extends BaseNotification
{
    use Queueable;

    public function __construct(
        public DayNewsPost $article,
        public User $liker
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'article_like',
            'title' => 'Someone liked your article',
            'message' => "{$this->liker->name} liked \"{$this->article->title}\"",
            'action_url' => route('daynews.posts.show', $this->article->slug),
            'data' => [
                'article_id' => $this->article->id,
                'article_slug' => $this->article->slug,
                'liker_id' => $this->liker->id,
                'liker_name' => $this->liker->name,
            ],
        ];
    }
}

