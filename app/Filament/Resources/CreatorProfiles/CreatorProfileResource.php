<?php

declare(strict_types=1);

namespace App\Filament\Resources\CreatorProfiles;

use App\Filament\Resources\CreatorProfiles\Pages\CreateCreatorProfile;
use App\Filament\Resources\CreatorProfiles\Pages\EditCreatorProfile;
use App\Filament\Resources\CreatorProfiles\Pages\ListCreatorProfiles;
use App\Filament\Resources\CreatorProfiles\Pages\ViewCreatorProfile;
use App\Filament\Resources\CreatorProfiles\Schemas\CreatorProfileForm;
use App\Filament\Resources\CreatorProfiles\Schemas\CreatorProfileInfolist;
use App\Filament\Resources\CreatorProfiles\Tables\CreatorProfilesTable;
use App\Models\CreatorProfile;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

final class CreatorProfileResource extends Resource
{
    protected static ?string $model = CreatorProfile::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return CreatorProfileForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return CreatorProfileInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CreatorProfilesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCreatorProfiles::route('/'),
            'create' => CreateCreatorProfile::route('/create'),
            'view' => ViewCreatorProfile::route('/{record}'),
            'edit' => EditCreatorProfile::route('/{record}/edit'),
        ];
    }
}
