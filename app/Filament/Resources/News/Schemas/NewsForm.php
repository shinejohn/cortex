<?php

declare(strict_types=1);

namespace App\Filament\Resources\News\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class NewsForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Article Information')
                    ->schema([
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
                            ->helperText('Brief summary of the article (max 500 characters)')
                            ->columnSpanFull(),

                        RichEditor::make('content')
                            ->required()
                            ->columnSpanFull()
                            ->toolbarButtons([
                                'bold',
                                'italic',
                                'underline',
                                'strike',
                                'link',
                                'heading',
                                'bulletList',
                                'orderedList',
                                'blockquote',
                                'codeBlock',
                                'undo',
                                'redo',
                            ]),
                    ])
                    ->columns(2),

                Section::make('Media')
                    ->schema([
                        FileUpload::make('featured_image')
                            ->label('Featured Image')
                            ->image()
                            ->directory('news')
                            ->imageEditor()
                            ->columnSpanFull(),
                    ]),

                Section::make('Author & Publishing')
                    ->schema([
                        Select::make('author_id')
                            ->label('Author')
                            ->relationship('author', 'name')
                            ->searchable()
                            ->preload()
                            ->default(fn () => auth()->id())
                            ->required(),

                        Select::make('status')
                            ->options([
                                'draft' => 'Draft',
                                'published' => 'Published',
                                'archived' => 'Archived',
                            ])
                            ->default('draft')
                            ->required()
                            ->reactive(),

                        DateTimePicker::make('published_at')
                            ->label('Publish Date & Time')
                            ->native(false)
                            ->displayFormat('M d, Y H:i')
                            ->seconds(false)
                            ->default(now())
                            ->required(fn ($get) => $get('status') === 'published')
                            ->hidden(fn ($get) => $get('status') !== 'published'),
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
                            ->helperText('Select regions where this news should appear')
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
                    ])
                    ->collapsed(),
            ]);
    }
}
