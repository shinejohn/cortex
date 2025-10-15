<?php

declare(strict_types=1);

namespace App\Filament\Resources\SocialPosts\Schemas;

use Filament\Schemas\Schema;

final class SocialPostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                //
            ]);
    }
}
