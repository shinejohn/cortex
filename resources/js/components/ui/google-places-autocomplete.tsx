import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { Label } from "./label";

export interface PlaceResult {
    address: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
    placeId: string;
    formattedAddress: string;
}

interface GooglePlacesAutocompleteProps {
    onPlaceSelected: (place: PlaceResult) => void;
    defaultValue?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
    id?: string;
}

export function GooglePlacesAutocomplete({
    onPlaceSelected,
    defaultValue = "",
    label,
    placeholder = "Start typing an address...",
    required = false,
    error,
    className = "",
    id = "google-places-autocomplete",
}: GooglePlacesAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(defaultValue);
    const placesLibrary = useMapsLibrary("places");

    const parsePlaceResult = useCallback((place: google.maps.places.PlaceResult): PlaceResult => {
        let streetNumber = "";
        let route = "";
        let neighborhood = "";
        let city = "";
        let state = "";
        let country = "";
        let postalCode = "";

        if (place.address_components) {
            for (const component of place.address_components) {
                const componentType = component.types[0];

                switch (componentType) {
                    case "street_number": {
                        streetNumber = component.long_name;
                        break;
                    }
                    case "route": {
                        route = component.long_name;
                        break;
                    }
                    case "neighborhood": {
                        neighborhood = component.long_name;
                        break;
                    }
                    case "locality": {
                        city = component.long_name;
                        break;
                    }
                    case "administrative_area_level_1": {
                        state = component.short_name;
                        break;
                    }
                    case "country": {
                        country = component.long_name;
                        break;
                    }
                    case "postal_code": {
                        postalCode = component.long_name;
                        break;
                    }
                }
            }
        }

        const address = `${streetNumber} ${route}`.trim();

        return {
            address: address || place.formatted_address || "",
            neighborhood: neighborhood || undefined,
            city: city || undefined,
            state: state || undefined,
            country: country || undefined,
            postalCode: postalCode || undefined,
            latitude: place.geometry!.location!.lat(),
            longitude: place.geometry!.location!.lng(),
            placeId: place.place_id || "",
            formattedAddress: place.formatted_address || "",
        };
    }, []);

    useEffect(() => {
        if (!placesLibrary || !inputRef.current) {
            return;
        }

        const autocompleteInstance = new placesLibrary.Autocomplete(inputRef.current, {
            fields: ["address_components", "geometry", "formatted_address", "place_id", "name"],
            types: ["address"],
        });

        autocompleteInstance.addListener("place_changed", () => {
            const place = autocompleteInstance.getPlace();

            if (!place.geometry?.location) {
                console.error("No geometry found for the selected place");
                return;
            }

            const result = parsePlaceResult(place);
            setInputValue(result.formattedAddress);
            onPlaceSelected(result);
        });

        setAutocomplete(autocompleteInstance);

        return () => {
            if (autocompleteInstance) {
                google.maps.event.clearInstanceListeners(autocompleteInstance);
            }
        };
    }, [placesLibrary, onPlaceSelected, parsePlaceResult]);

    return (
        <div className={className}>
            {label && (
                <Label htmlFor={id}>
                    {label} {required && "*"}
                </Label>
            )}
            <Input
                ref={inputRef}
                id={id}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="mt-1"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            {!placesLibrary && <p className="text-xs text-muted-foreground mt-1">Loading Google Places...</p>}
        </div>
    );
}
