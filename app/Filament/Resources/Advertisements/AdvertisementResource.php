<?php

declare(strict_types=1);

namespace App\Filament\Resources\Advertisements;

use App\Filament\Resources\Advertisements\Pages\CreateAdvertisement;
use App\Filament\Resources\Advertisements\Pages\EditAdvertisement;
use App\Filament\Resources\Advertisements\Pages\ListAdvertisements;
use App\Filament\Resources\Advertisements\Schemas\AdvertisementForm;
use App\Filament\Resources\Advertisements\Tables\AdvertisementsTable;
use App\Models\Advertisement;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

final class AdvertisementResource extends Resource
{
    protected static ?string $model = Advertisement::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleGroup;

    protected static string|UnitEnum|null $navigationGroup = 'Day News';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Advertisements';

    public static function form(Schema $schema): Schema
    {
        return AdvertisementForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AdvertisementsTable::configure($table);
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
            'index' => ListAdvertisements::route('/'),
            'create' => CreateAdvertisement::route('/create'),
            'edit' => EditAdvertisement::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) self::getModel()::where('is_active', true)->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'success';
    }
}
