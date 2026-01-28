<?php

namespace App\Filament\Resources\SalesOpportunities;

use App\Filament\Resources\SalesOpportunities\Pages\CreateSalesOpportunity;
use App\Filament\Resources\SalesOpportunities\Pages\EditSalesOpportunity;
use App\Filament\Resources\SalesOpportunities\Pages\ListSalesOpportunities;
use App\Filament\Resources\SalesOpportunities\Pages\ViewSalesOpportunity;
use App\Filament\Resources\SalesOpportunities\Schemas\SalesOpportunityForm;
use App\Filament\Resources\SalesOpportunities\Schemas\SalesOpportunityInfolist;
use App\Filament\Resources\SalesOpportunities\Tables\SalesOpportunitiesTable;
use App\Models\SalesOpportunity;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class SalesOpportunityResource extends Resource
{
    protected static ?string $model = SalesOpportunity::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'business_name';

    public static function form(Schema $schema): Schema
    {
        return SalesOpportunityForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return SalesOpportunityInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SalesOpportunitiesTable::configure($table);
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
            'index' => ListSalesOpportunities::route('/'),
            'create' => CreateSalesOpportunity::route('/create'),
            'view' => ViewSalesOpportunity::route('/{record}'),
            'edit' => EditSalesOpportunity::route('/{record}/edit'),
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
