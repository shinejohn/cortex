<?php

declare(strict_types=1);

namespace App\Filament\Resources\SocialGroups;

use App\Filament\Resources\SocialGroups\Pages\CreateSocialGroup;
use App\Filament\Resources\SocialGroups\Pages\EditSocialGroup;
use App\Filament\Resources\SocialGroups\Pages\ListSocialGroups;
use App\Filament\Resources\SocialGroups\Schemas\SocialGroupForm;
use App\Filament\Resources\SocialGroups\Tables\SocialGroupsTable;
use App\Models\SocialGroup;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

final class SocialGroupResource extends Resource
{
    protected static ?string $model = SocialGroup::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    protected static string|UnitEnum|null $navigationGroup = 'Social';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return SocialGroupForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SocialGroupsTable::configure($table);
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
            'index' => ListSocialGroups::route('/'),
            'create' => CreateSocialGroup::route('/create'),
            'edit' => EditSocialGroup::route('/{record}/edit'),
        ];
    }
}
