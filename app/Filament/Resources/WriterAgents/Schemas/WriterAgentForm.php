<?php

declare(strict_types=1);

namespace App\Filament\Resources\WriterAgents\Schemas;

use App\Models\WriterAgent;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

final class WriterAgentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Agent Identity')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, callable $set) => $set('slug', str($state)->slug()->toString())),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('Auto-generated from name. Can be customized.'),

                        Textarea::make('bio')
                            ->rows(3)
                            ->maxLength(1000)
                            ->helperText('A short professional biography for the agent.')
                            ->columnSpanFull(),

                        TextInput::make('avatar')
                            ->label('Avatar URL')
                            ->url()
                            ->maxLength(500)
                            ->helperText('Leave empty to auto-generate a DiceBear avatar.')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Persona Configuration')
                    ->schema([
                        Select::make('writing_style')
                            ->label('Writing Style')
                            ->options([
                                WriterAgent::STYLE_FORMAL => 'Formal',
                                WriterAgent::STYLE_CASUAL => 'Casual',
                                WriterAgent::STYLE_INVESTIGATIVE => 'Investigative',
                                WriterAgent::STYLE_CONVERSATIONAL => 'Conversational',
                            ])
                            ->default(WriterAgent::STYLE_CONVERSATIONAL)
                            ->required(),

                        KeyValue::make('persona_traits')
                            ->label('Persona Traits')
                            ->keyLabel('Trait')
                            ->valueLabel('Value')
                            ->reorderable()
                            ->addActionLabel('Add Trait')
                            ->helperText('Define personality traits (e.g., tone: friendly, voice: active, approach: fact-focused)')
                            ->columnSpanFull(),

                        KeyValue::make('expertise_areas')
                            ->label('Expertise Areas')
                            ->keyLabel('Area')
                            ->valueLabel('Description')
                            ->reorderable()
                            ->addActionLabel('Add Expertise')
                            ->helperText('Areas of expertise for this agent')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Specializations')
                    ->schema([
                        CheckboxList::make('categories')
                            ->label('Categories')
                            ->options([
                                'local_news' => 'Local News',
                                'business' => 'Business',
                                'sports' => 'Sports',
                                'entertainment' => 'Entertainment',
                                'community' => 'Community',
                                'education' => 'Education',
                                'health' => 'Health',
                                'politics' => 'Politics',
                                'crime' => 'Crime',
                                'weather' => 'Weather',
                                'events' => 'Events',
                                'public_notice' => 'Public Notice',
                            ])
                            ->columns(4)
                            ->required()
                            ->helperText('Select the categories this agent specializes in.'),

                        Select::make('regions')
                            ->label('Assigned Regions')
                            ->relationship(
                                name: 'regions',
                                titleAttribute: 'name',
                                modifyQueryUsing: fn ($query) => $query->select('regions.id', 'regions.name')->orderBy('name'),
                            )
                            ->multiple()
                            ->searchable()
                            ->preload()
                            ->helperText('Select regions this agent will cover.')
                            ->columnSpanFull(),
                    ]),

                Section::make('AI Prompts')
                    ->schema([
                        Textarea::make('prompts.system_prompt')
                            ->label('System Prompt')
                            ->rows(4)
                            ->maxLength(2000)
                            ->helperText('The base system prompt that defines the agent\'s identity.')
                            ->columnSpanFull(),

                        Textarea::make('prompts.style_instructions')
                            ->label('Style Instructions')
                            ->rows(4)
                            ->maxLength(2000)
                            ->helperText('Instructions for how the agent should write articles.')
                            ->columnSpanFull(),
                    ])
                    ->collapsed(),

                Section::make('Settings')
                    ->schema([
                        Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->required()
                            ->helperText('Inactive agents will not be assigned to new articles.'),

                        TextInput::make('articles_count')
                            ->label('Articles Written')
                            ->numeric()
                            ->disabled()
                            ->default(0)
                            ->helperText('Total number of articles written by this agent.'),
                    ])
                    ->columns(2),
            ]);
    }
}
