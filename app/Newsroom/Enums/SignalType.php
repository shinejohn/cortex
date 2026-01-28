<?php

declare(strict_types=1);

namespace App\Newsroom\Enums;

enum SignalType: string
{
    case URL = 'url';
    case EMAIL_CONTENT = 'email_content';
    case RSS_ITEM = 'rss_item';
    case SOCIAL_POST = 'social_post';
    case PRESS_RELEASE = 'press_release';
}
