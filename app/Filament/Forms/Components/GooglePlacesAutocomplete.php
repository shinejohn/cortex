<?php

declare(strict_types=1);

namespace App\Filament\Forms\Components;

use Filament\Forms\Components\Field;

final class GooglePlacesAutocomplete extends Field
{
    protected string $view = 'filament.forms.components.google-places-autocomplete';

    protected ?string $latitudeField = null;

    protected ?string $longitudeField = null;

    protected ?string $neighborhoodField = null;

    public function latitudeField(string $field): static
    {
        $this->latitudeField = $field;

        return $this;
    }

    public function longitudeField(string $field): static
    {
        $this->longitudeField = $field;

        return $this;
    }

    public function neighborhoodField(string $field): static
    {
        $this->neighborhoodField = $field;

        return $this;
    }

    public function getLatitudeField(): ?string
    {
        return $this->latitudeField;
    }

    public function getLongitudeField(): ?string
    {
        return $this->longitudeField;
    }

    public function getNeighborhoodField(): ?string
    {
        return $this->neighborhoodField;
    }
}
