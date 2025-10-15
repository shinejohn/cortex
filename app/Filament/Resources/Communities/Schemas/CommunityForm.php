<?php

declare(strict_types=1);

namespace App\Filament\Resources\Communities\Schemas;

use Filament\Schemas\Schema;

final class CommunityForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                //
            ]);
    }
}
