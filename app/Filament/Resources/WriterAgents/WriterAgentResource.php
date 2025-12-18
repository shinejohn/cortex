<?php

declare(strict_types=1);

namespace App\Filament\Resources\WriterAgents;

use App\Filament\Resources\WriterAgents\Pages\CreateWriterAgent;
use App\Filament\Resources\WriterAgents\Pages\EditWriterAgent;
use App\Filament\Resources\WriterAgents\Pages\ListWriterAgents;
use App\Filament\Resources\WriterAgents\Schemas\WriterAgentForm;
use App\Filament\Resources\WriterAgents\Tables\WriterAgentsTable;
use App\Models\WriterAgent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

final class WriterAgentResource extends Resource
{
    protected static ?string $model = WriterAgent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserGroup;

    protected static string|UnitEnum|null $navigationGroup = 'Day News';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Writer Agents';

    protected static ?string $modelLabel = 'Writer Agent';

    protected static ?string $pluralModelLabel = 'Writer Agents';

    public static function form(Schema $schema): Schema
    {
        return WriterAgentForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return WriterAgentsTable::configure($table);
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
            'index' => ListWriterAgents::route('/'),
            'create' => CreateWriterAgent::route('/create'),
            'edit' => EditWriterAgent::route('/{record}/edit'),
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
