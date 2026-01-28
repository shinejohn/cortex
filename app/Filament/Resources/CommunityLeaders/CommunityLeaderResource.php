<?php

namespace App\Filament\Resources\CommunityLeaders;

use App\Filament\Resources\CommunityLeaders\Pages\CreateCommunityLeader;
use App\Filament\Resources\CommunityLeaders\Pages\EditCommunityLeader;
use App\Filament\Resources\CommunityLeaders\Pages\ListCommunityLeaders;
use App\Filament\Resources\CommunityLeaders\Pages\ViewCommunityLeader;
use App\Filament\Resources\CommunityLeaders\Schemas\CommunityLeaderForm;
use App\Filament\Resources\CommunityLeaders\Schemas\CommunityLeaderInfolist;
use App\Filament\Resources\CommunityLeaders\Tables\CommunityLeadersTable;
use App\Models\CommunityLeader;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CommunityLeaderResource extends Resource
{
    protected static ?string $model = CommunityLeader::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return CommunityLeaderForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return CommunityLeaderInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CommunityLeadersTable::configure($table);
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
            'index' => ListCommunityLeaders::route('/'),
            'create' => CreateCommunityLeader::route('/create'),
            'view' => ViewCommunityLeader::route('/{record}'),
            'edit' => EditCommunityLeader::route('/{record}/edit'),
        ];
    }

    public static function getRecordRouteBindingEloquentQuery(): Builder
    {
        return parent::getRecordRouteBindingEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
}
