<?php

declare(strict_types=1);

namespace App\Filament\Resources\SocialPosts;

use App\Filament\Resources\SocialPosts\Pages\CreateSocialPost;
use App\Filament\Resources\SocialPosts\Pages\EditSocialPost;
use App\Filament\Resources\SocialPosts\Pages\ListSocialPosts;
use App\Filament\Resources\SocialPosts\Schemas\SocialPostForm;
use App\Filament\Resources\SocialPosts\Tables\SocialPostsTable;
use App\Models\SocialPost;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

final class SocialPostResource extends Resource
{
    protected static ?string $model = SocialPost::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeftRight;

    protected static string|UnitEnum|null $navigationGroup = 'Social';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return SocialPostForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SocialPostsTable::configure($table);
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
            'index' => ListSocialPosts::route('/'),
            'create' => CreateSocialPost::route('/create'),
            'edit' => EditSocialPost::route('/{record}/edit'),
        ];
    }
}
