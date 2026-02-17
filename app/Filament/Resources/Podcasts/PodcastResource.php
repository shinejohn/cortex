<?php

declare(strict_types=1);

namespace App\Filament\Resources\Podcasts;

use App\Filament\Resources\Podcasts\Pages\CreatePodcast;
use App\Filament\Resources\Podcasts\Pages\EditPodcast;
use App\Filament\Resources\Podcasts\Pages\ListPodcasts;
use App\Filament\Resources\Podcasts\Pages\ViewPodcast;
use App\Filament\Resources\Podcasts\Schemas\PodcastForm;
use App\Filament\Resources\Podcasts\Schemas\PodcastInfolist;
use App\Filament\Resources\Podcasts\Tables\PodcastsTable;
use App\Models\Podcast;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

final class PodcastResource extends Resource
{
    protected static ?string $model = Podcast::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return PodcastForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return PodcastInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PodcastsTable::configure($table);
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
            'index' => ListPodcasts::route('/'),
            'create' => CreatePodcast::route('/create'),
            'view' => ViewPodcast::route('/{record}'),
            'edit' => EditPodcast::route('/{record}/edit'),
        ];
    }
}
