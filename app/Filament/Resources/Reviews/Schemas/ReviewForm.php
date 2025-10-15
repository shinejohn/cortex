<?php

declare(strict_types=1);

namespace App\Filament\Resources\Reviews\Schemas;

use Filament\Schemas\Schema;

final class ReviewForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                //
            ]);
    }
}
