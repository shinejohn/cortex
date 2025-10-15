<?php

declare(strict_types=1);

namespace App\Filament\Resources\Stores\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class StoreForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Basic Information')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, callable $set) => $set('slug', str($state)->slug())),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->rules(['alpha_dash']),

                        RichEditor::make('description')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Branding')
                    ->schema([
                        FileUpload::make('logo')
                            ->image()
                            ->directory('stores/logos')
                            ->imageEditor(),

                        FileUpload::make('banner')
                            ->image()
                            ->directory('stores/banners')
                            ->imageEditor()
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Workspace')
                    ->schema([
                        Select::make('workspace_id')
                            ->label('Workspace')
                            ->relationship('workspace', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                    ]),

                Section::make('Status & Approval')
                    ->schema([
                        Select::make('status')
                            ->options([
                                'pending' => 'Pending',
                                'approved' => 'Approved',
                                'rejected' => 'Rejected',
                                'suspended' => 'Suspended',
                            ])
                            ->default('pending')
                            ->required()
                            ->live(),

                        Textarea::make('rejection_reason')
                            ->label('Rejection Reason')
                            ->rows(3)
                            ->visible(fn ($get) => $get('status') === 'rejected'),

                        DateTimePicker::make('approved_at')
                            ->label('Approved At')
                            ->disabled(),
                    ])
                    ->columns(2),
            ]);
    }
}
