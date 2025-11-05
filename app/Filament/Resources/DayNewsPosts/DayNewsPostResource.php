<?php

declare(strict_types=1);

namespace App\Filament\Resources\DayNewsPosts;

use App\Filament\Resources\DayNewsPosts\Pages\CreateDayNewsPost;
use App\Filament\Resources\DayNewsPosts\Pages\EditDayNewsPost;
use App\Filament\Resources\DayNewsPosts\Pages\ListDayNewsPosts;
use App\Filament\Resources\DayNewsPosts\Schemas\DayNewsPostForm;
use App\Filament\Resources\DayNewsPosts\Tables\DayNewsPostsTable;
use App\Models\DayNewsPost;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

final class DayNewsPostResource extends Resource
{
    protected static ?string $model = DayNewsPost::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;

    protected static string|UnitEnum|null $navigationGroup = 'Day News';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'All Posts';

    public static function form(Schema $schema): Schema
    {
        return DayNewsPostForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DayNewsPostsTable::configure($table);
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
            'index' => ListDayNewsPosts::route('/'),
            'create' => CreateDayNewsPost::route('/create'),
            'edit' => EditDayNewsPost::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) self::getModel()::where('status', 'published')->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'success';
    }
}
