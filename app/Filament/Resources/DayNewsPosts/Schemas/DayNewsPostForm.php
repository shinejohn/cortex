<?php

declare(strict_types=1);

namespace App\Filament\Resources\DayNewsPosts\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class DayNewsPostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Post Information')
                    ->schema([
                        Select::make('type')
                            ->options([
                                'article' => 'Article',
                                'announcement' => 'Announcement',
                                'notice' => 'Notice',
                                'ad' => 'Advertisement',
                                'schedule' => 'Schedule',
                            ])
                            ->required()
                            ->default('article')
                            ->reactive(),

                        Select::make('category')
                            ->options([
                                'demise' => 'Demise (Free)',
                                'missing_person' => 'Missing Person (Free)',
                                'emergency' => 'Emergency (Free)',
                            ])
                            ->nullable()
                            ->helperText('Select a free category if applicable'),

                        TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, callable $set) => $set('slug', str($state)->slug()->toString()))
                            ->columnSpanFull(),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('Auto-generated from title. Can be customized.')
                            ->columnSpanFull(),

                        Textarea::make('excerpt')
                            ->maxLength(500)
                            ->rows(3)
                            ->helperText('Brief summary (max 500 characters)')
                            ->columnSpanFull(),

                        Textarea::make('content')
                            ->required()
                            ->rows(10)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Media')
                    ->schema([
                        FileUpload::make('featured_image')
                            ->label('Featured Image')
                            ->image()
                            ->directory('day-news-posts')
                            ->imageEditor()
                            ->columnSpanFull(),
                    ]),

                Section::make('Author & Workspace')
                    ->schema([
                        Select::make('author_id')
                            ->label('Author')
                            ->relationship('author', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable(),

                        Select::make('workspace_id')
                            ->label('Workspace')
                            ->relationship('workspace', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable(),

                        Select::make('status')
                            ->options([
                                'draft' => 'Draft',
                                'published' => 'Published',
                                'expired' => 'Expired',
                                'removed' => 'Removed',
                            ])
                            ->default('draft')
                            ->required()
                            ->reactive(),

                        DateTimePicker::make('published_at')
                            ->label('Publish Date & Time')
                            ->native(false)
                            ->displayFormat('M d, Y H:i')
                            ->seconds(false)
                            ->nullable()
                            ->required(fn ($get) => $get('status') === 'published')
                            ->hidden(fn ($get) => $get('status') !== 'published'),

                        DateTimePicker::make('expires_at')
                            ->label('Expiration Date & Time')
                            ->native(false)
                            ->displayFormat('M d, Y H:i')
                            ->seconds(false)
                            ->nullable()
                            ->helperText('For ads, set expiration based on duration'),
                    ])
                    ->columns(3),

                Section::make('Regions')
                    ->schema([
                        Select::make('regions')
                            ->label('Target Regions')
                            ->relationship('regions', 'name', fn ($query) => $query->select('id', 'name', 'type'))
                            ->multiple()
                            ->searchable()
                            ->preload()
                            ->helperText('Select regions where this post should appear')
                            ->columnSpanFull(),
                    ]),

                Section::make('Metadata')
                    ->schema([
                        TextInput::make('view_count')
                            ->label('View Count')
                            ->numeric()
                            ->default(0)
                            ->disabled()
                            ->dehydrated(false),

                        TextInput::make('metadata.ad_days')
                            ->label('Ad Duration (Days)')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(90)
                            ->visible(fn ($get) => $get('type') === 'ad')
                            ->helperText('$5 per day'),

                        Select::make('metadata.ad_placement')
                            ->label('Ad Placement')
                            ->options([
                                'sidebar' => 'Sidebar',
                                'banner' => 'Banner',
                                'inline' => 'Inline',
                                'featured' => 'Featured',
                            ])
                            ->visible(fn ($get) => $get('type') === 'ad'),
                    ])
                    ->columns(3)
                    ->collapsed(),

                Section::make('Social Media Status')
                    ->schema([
                        \Filament\Forms\Components\KeyValue::make('social_share_status')
                            ->label('Sharing History')
                            ->disabled()
                            ->dehydrated(false)
                            ->columnSpanFull(),
                    ])
                    ->collapsed(),
            ]);
    }
}
