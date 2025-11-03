<?php

declare(strict_types=1);

namespace App\Filament\Resources\TicketPlans;

use App\Filament\Resources\TicketPlans\Pages\CreateTicketPlan;
use App\Filament\Resources\TicketPlans\Pages\EditTicketPlan;
use App\Filament\Resources\TicketPlans\Pages\ListTicketPlans;
use App\Filament\Resources\TicketPlans\Schemas\TicketPlanForm;
use App\Filament\Resources\TicketPlans\Tables\TicketPlansTable;
use App\Models\TicketPlan;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

final class TicketPlanResource extends Resource
{
    protected static ?string $model = TicketPlan::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleGroup;

    protected static string|UnitEnum|null $navigationGroup = 'Go Event City';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return TicketPlanForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TicketPlansTable::configure($table);
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
            'index' => ListTicketPlans::route('/'),
            'create' => CreateTicketPlan::route('/create'),
            'edit' => EditTicketPlan::route('/{record}/edit'),
        ];
    }
}
