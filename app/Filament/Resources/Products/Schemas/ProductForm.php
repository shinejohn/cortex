<?php

declare(strict_types=1);

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Basic Information')
                    ->schema([
                        Select::make('store_id')
                            ->label('Store')
                            ->relationship('store', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),

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

                Section::make('Images')
                    ->schema([
                        FileUpload::make('images')
                            ->multiple()
                            ->image()
                            ->directory('products')
                            ->imageEditor()
                            ->reorderable()
                            ->maxFiles(10)
                            ->columnSpanFull(),
                    ]),

                Section::make('Pricing')
                    ->schema([
                        TextInput::make('price')
                            ->required()
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01),

                        TextInput::make('compare_at_price')
                            ->label('Compare at Price')
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01)
                            ->helperText('Original price for showing discounts'),
                    ])
                    ->columns(2),

                Section::make('Inventory')
                    ->schema([
                        Toggle::make('track_inventory')
                            ->label('Track Inventory')
                            ->default(true)
                            ->live(),

                        TextInput::make('quantity')
                            ->numeric()
                            ->minValue(0)
                            ->default(0)
                            ->visible(fn ($get) => $get('track_inventory')),

                        TextInput::make('sku')
                            ->label('SKU')
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                    ])
                    ->columns(3),

                Section::make('Visibility & Features')
                    ->schema([
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),

                        Toggle::make('is_featured')
                            ->label('Featured Product')
                            ->default(false),
                    ])
                    ->columns(2),

                Section::make('Stripe Integration')
                    ->schema([
                        TextInput::make('stripe_product_id')
                            ->label('Stripe Product ID')
                            ->disabled(),

                        TextInput::make('stripe_price_id')
                            ->label('Stripe Price ID')
                            ->disabled(),
                    ])
                    ->columns(2)
                    ->collapsed(),
            ]);
    }
}
