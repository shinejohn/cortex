<?php

declare(strict_types=1);

namespace App\Filament\Resources\NewsFetchFrequencies;

use App\Filament\Resources\NewsFetchFrequencies\Pages\CreateNewsFetchFrequency;
use App\Filament\Resources\NewsFetchFrequencies\Pages\EditNewsFetchFrequency;
use App\Filament\Resources\NewsFetchFrequencies\Pages\ListNewsFetchFrequencies;
use App\Filament\Resources\NewsFetchFrequencies\Schemas\NewsFetchFrequencyForm;
use App\Filament\Resources\NewsFetchFrequencies\Tables\NewsFetchFrequenciesTable;
use App\Models\NewsFetchFrequency;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

final class NewsFetchFrequencyResource extends Resource
{
    protected static ?string $model = NewsFetchFrequency::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClock;

    protected static string|UnitEnum|null $navigationGroup = 'Day News';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Fetch Frequencies';

    protected static ?string $modelLabel = 'Fetch Frequency';

    protected static ?string $pluralModelLabel = 'Fetch Frequencies';

    public static function form(Schema $schema): Schema
    {
        return NewsFetchFrequencyForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return NewsFetchFrequenciesTable::configure($table);
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
            'index' => ListNewsFetchFrequencies::route('/'),
            'create' => CreateNewsFetchFrequency::route('/create'),
            'edit' => EditNewsFetchFrequency::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) self::getModel()::where('is_enabled', true)->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'info';
    }
}
