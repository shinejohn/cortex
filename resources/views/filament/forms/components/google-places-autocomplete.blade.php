@php
    $statePath = $getStatePath();
    $latitudeField = $getLatitudeField();
    $longitudeField = $getLongitudeField();
    $neighborhoodField = $getNeighborhoodField();
    $apiKey = config('services.google.maps_api_key');
@endphp

<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        x-data="{
            state: $wire.entangle('{{ $statePath }}'),
            autocomplete: null,
            init() {
                if (!window.google) {
                    this.loadGoogleMapsScript();
                } else {
                    this.initAutocomplete();
                }
            },
            loadGoogleMapsScript() {
                const script = document.createElement('script');
                script.src = 'https://maps.googleapis.com/maps/api/js?key={{ $apiKey }}&libraries=places';
                script.async = true;
                script.defer = true;
                script.onload = () => this.initAutocomplete();
                document.head.appendChild(script);
            },
            initAutocomplete() {
                const input = this.$refs.autocompleteInput;
                if (!input) return;

                this.autocomplete = new google.maps.places.Autocomplete(input, {
                    types: ['address'],
                });

                this.autocomplete.addListener('place_changed', () => {
                    const place = this.autocomplete.getPlace();

                    if (!place.geometry || !place.geometry.location) {
                        return;
                    }

                    // Set the address
                    this.state = place.formatted_address;

                    // Set latitude
                    @if($latitudeField)
                        $wire.set('{{ $latitudeField }}', place.geometry.location.lat());
                    @endif

                    // Set longitude
                    @if($longitudeField)
                        $wire.set('{{ $longitudeField }}', place.geometry.location.lng());
                    @endif

                    // Extract and set neighborhood
                    @if($neighborhoodField)
                        let neighborhood = '';
                        if (place.address_components) {
                            for (const component of place.address_components) {
                                if (component.types.includes('neighborhood')) {
                                    neighborhood = component.long_name;
                                    break;
                                }
                            }
                        }
                        if (neighborhood) {
                            $wire.set('{{ $neighborhoodField }}', neighborhood);
                        }
                    @endif
                });
            }
        }"
        class="filament-forms-text-input-component"
    >
        <input
            x-ref="autocompleteInput"
            x-model="state"
            type="text"
            placeholder="{{ $getPlaceholder() }}"
            @if($isDisabled())
                disabled
            @endif
            @if($isRequired())
                required
            @endif
            {!! $getExtraAttributesBag()->class([
                'block w-full transition duration-75',
                'border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-inset focus:ring-primary-500',
                'dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-500',
                'rounded-lg shadow-sm',
                'disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800',
            ]) !!}
        />
    </div>
</x-dynamic-component>
