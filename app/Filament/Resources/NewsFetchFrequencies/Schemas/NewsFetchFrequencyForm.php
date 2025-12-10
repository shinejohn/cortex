<?php

declare(strict_types=1);

namespace App\Filament\Resources\NewsFetchFrequencies\Schemas;

use App\Models\NewsFetchFrequency;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class NewsFetchFrequencyForm
{
    public static function configure(Schema $schema): Schema
    {
        $categories = config('news-workflow.business_discovery.categories', []);
        $categoryOptions = array_combine($categories, array_map(
            fn ($cat) => str($cat)->replace('_', ' ')->title()->toString(),
            $categories
        ));

        return $schema
            ->components([
                Section::make('Category Configuration')
                    ->schema([
                        Select::make('category')
                            ->label('Category')
                            ->options($categoryOptions)
                            ->required()
                            ->searchable()
                            ->helperText('Select the category to configure fetch frequency for'),

                        Select::make('category_type')
                            ->label('Category Type')
                            ->options(NewsFetchFrequency::categoryTypeOptions())
                            ->required()
                            ->default(NewsFetchFrequency::CATEGORY_TYPE_NEWS)
                            ->helperText('News categories are searched directly. Business categories filter which businesses to fetch news for.'),
                    ])
                    ->columns(2),

                Section::make('Frequency Settings')
                    ->schema([
                        Select::make('frequency_type')
                            ->label('Fetch Frequency')
                            ->options(NewsFetchFrequency::frequencyOptions())
                            ->required()
                            ->default(NewsFetchFrequency::FREQUENCY_DAILY)
                            ->live()
                            ->helperText('How often news should be fetched for this category'),

                        TextInput::make('custom_interval_days')
                            ->label('Custom Interval (Days)')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(365)
                            ->visible(fn ($get) => $get('frequency_type') === NewsFetchFrequency::FREQUENCY_CUSTOM_DAYS)
                            ->required(fn ($get) => $get('frequency_type') === NewsFetchFrequency::FREQUENCY_CUSTOM_DAYS)
                            ->helperText('Number of days between fetches'),
                    ])
                    ->columns(2),

                Section::make('Status')
                    ->schema([
                        Toggle::make('is_enabled')
                            ->label('Enabled')
                            ->default(true)
                            ->helperText('Disable to temporarily stop fetching news for this category'),

                        DateTimePicker::make('last_fetched_at')
                            ->label('Last Fetched')
                            ->disabled()
                            ->helperText('Automatically updated when news is fetched'),
                    ])
                    ->columns(2),
            ]);
    }
}
