<?php

declare(strict_types=1);

namespace App\Filament\Resources\Performers;

use App\Filament\Resources\Performers\Pages\CreatePerformer;
use App\Filament\Resources\Performers\Pages\EditPerformer;
use App\Filament\Resources\Performers\Pages\ListPerformers;
use App\Filament\Resources\Performers\Schemas\PerformerForm;
use App\Filament\Resources\Performers\Tables\PerformersTable;
use App\Models\Performer;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

final class PerformerResource extends Resource
{
    protected static ?string $model = Performer::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMusicalNote;

    protected static string|UnitEnum|null $navigationGroup = 'Events & Venues';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return PerformerForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PerformersTable::configure($table);
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
            'index' => ListPerformers::route('/'),
            'create' => CreatePerformer::route('/create'),
            'edit' => EditPerformer::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) self::getModel()::where('status', 'active')->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'success';
    }
}
