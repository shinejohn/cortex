<?php

declare(strict_types=1);

namespace App\Notifications\DayNews;

use App\Models\DayNewsPost;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification as BaseNotification;

final class ArticleCommented extends BaseNotification
{
    use Queueable;

    public function __construct(
        public DayNewsPost $article,
        public User $commenter
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'article_comment',
            'title' => 'New comment on your article',
            'message' => "{$this->commenter->name} commented on \"{$this->article->title}\"",
            'action_url' => route('daynews.posts.show', $this->article->slug),
            'data' => [
                'article_id' => $this->article->id,
                'article_slug' => $this->article->slug,
                'commenter_id' => $this->commenter->id,
                'commenter_name' => $this->commenter->name,
            ],
        ];
    }
}

