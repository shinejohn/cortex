import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";
import { GoogleMapsProvider } from "@/components/providers/google-maps-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GooglePlacesAutocomplete, type PlaceResult } from "@/components/ui/google-places-autocomplete";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";

interface Workspace {
    can_accept_payments: boolean;
}

interface Props {
    workspace: Workspace;
}

export default function CreateVenue({ workspace }: Props) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        venue_type: "",
        capacity: "",
        price_per_hour: "",
        price_per_event: "",
        price_per_day: "",
        address: "",
        neighborhood: "",
        latitude: "",
        longitude: "",
        google_place_id: "",
        postal_code: "",
        amenities: [] as string[],
        event_types: [] as string[],
    });

    const [amenityInput, setAmenityInput] = useState("");
    const [eventTypeInput, setEventTypeInput] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const formDataToSend = new FormData();

            // Append regular form fields
            formDataToSend.append("name", formData.name);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("venue_type", formData.venue_type);
            formDataToSend.append("capacity", formData.capacity);
            formDataToSend.append("price_per_hour", formData.price_per_hour || "");
            formDataToSend.append("price_per_event", formData.price_per_event || "");
            formDataToSend.append("price_per_day", formData.price_per_day || "");
            formDataToSend.append("address", formData.address);
            formDataToSend.append("neighborhood", formData.neighborhood);
            formDataToSend.append("latitude", formData.latitude);
            formDataToSend.append("longitude", formData.longitude);
            formDataToSend.append("google_place_id", formData.google_place_id);
            formDataToSend.append("postal_code", formData.postal_code);

            // Append amenities and event_types as JSON
            formDataToSend.append("amenities", JSON.stringify(formData.amenities));
            formDataToSend.append("event_types", JSON.stringify(formData.event_types));

            // Append image files
            imageFiles.forEach((file, index) => {
                formDataToSend.append(`images[${index}]`, file);
            });

            const response = await axios.post(route("venues.store"), formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200 || response.status === 201) {
                router.visit(route("venues.show", response.data.id || response.data.venue?.id));
            }
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { errors?: Record<string, string[]> } } };
            if (axiosError.response?.data?.errors) {
                setErrors(axiosError.response.data.errors);
            }
            console.error("Error creating venue:", error);
            const errorMessage =
                error.response?.data?.message || error.response?.data?.error || "Failed to create venue. Please check the form for errors.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePlaceSelected = (place: PlaceResult) => {
        setFormData((prev) => ({
            ...prev,
            address: place.formattedAddress,
            neighborhood: place.neighborhood || "",
            latitude: place.latitude.toString(),
            longitude: place.longitude.toString(),
            google_place_id: place.placeId,
            postal_code: place.postalCode || "",
        }));
    };

    const addAmenity = () => {
        if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                amenities: [...prev.amenities, amenityInput.trim()],
            }));
            setAmenityInput("");
        }
    };

    const removeAmenity = (amenity: string) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.filter((a) => a !== amenity),
        }));
    };

    const addEventType = () => {
        if (eventTypeInput.trim() && !formData.event_types.includes(eventTypeInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                event_types: [...prev.event_types, eventTypeInput.trim()],
            }));
            setEventTypeInput("");
        }
    };

    const removeEventType = (eventType: string) => {
        setFormData((prev) => ({
            ...prev,
            event_types: prev.event_types.filter((t) => t !== eventType),
        }));
    };

    return (
        <AppLayout>
            <Head title="Create Venue" />
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <Link href={route("venues")}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Venues
                            </Button>
                        </Link>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Create New Venue</h1>
                        <p className="text-muted-foreground mt-1">Add a new venue to your workspace</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Venue Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter venue name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the venue"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        required
                                        rows={4}
                                        className="mt-1"
                                    />
                                    {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="venue_type">Venue Type *</Label>
                                        <Input
                                            id="venue_type"
                                            type="text"
                                            placeholder="e.g., Concert Hall, Theater, Arena"
                                            value={formData.venue_type}
                                            onChange={(e) => handleInputChange("venue_type", e.target.value)}
                                            required
                                            className="mt-1"
                                        />
                                        {errors.venue_type && <p className="text-sm text-destructive mt-1">{errors.venue_type}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="capacity">Capacity *</Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            placeholder="Enter capacity"
                                            value={formData.capacity}
                                            onChange={(e) => handleInputChange("capacity", e.target.value)}
                                            required
                                            min="1"
                                            className="mt-1"
                                        />
                                        {errors.capacity && <p className="text-sm text-destructive mt-1">{errors.capacity}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!workspace.can_accept_payments && (
                                    <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4">
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            <strong>Payment restrictions:</strong> Your workspace must be approved for Stripe Connect before you can
                                            set paid pricing. Until then, all prices must be $0.00.
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="price_per_hour">Price Per Hour</Label>
                                        <Input
                                            id="price_per_hour"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.price_per_hour}
                                            onChange={(e) => handleInputChange("price_per_hour", e.target.value)}
                                            min="0"
                                            max={!workspace.can_accept_payments ? "0" : undefined}
                                            disabled={!workspace.can_accept_payments}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="price_per_event">Price Per Event</Label>
                                        <Input
                                            id="price_per_event"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.price_per_event}
                                            onChange={(e) => handleInputChange("price_per_event", e.target.value)}
                                            min="0"
                                            max={!workspace.can_accept_payments ? "0" : undefined}
                                            disabled={!workspace.can_accept_payments}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="price_per_day">Price Per Day</Label>
                                        <Input
                                            id="price_per_day"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.price_per_day}
                                            onChange={(e) => handleInputChange("price_per_day", e.target.value)}
                                            min="0"
                                            max={!workspace.can_accept_payments ? "0" : undefined}
                                            disabled={!workspace.can_accept_payments}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                                {!workspace.can_accept_payments && (
                                    <p className="text-xs text-muted-foreground">All prices must be $0.00 until workspace is approved for payments</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <GoogleMapsProvider>
                                    <GooglePlacesAutocomplete
                                        onPlaceSelected={handlePlaceSelected}
                                        defaultValue={formData.address}
                                        label="Address"
                                        placeholder="Start typing an address..."
                                        required
                                        error={errors.address}
                                    />
                                </GoogleMapsProvider>

                                <div>
                                    <Label htmlFor="neighborhood">Neighborhood</Label>
                                    <Input
                                        id="neighborhood"
                                        type="text"
                                        placeholder="Auto-filled from address or enter manually"
                                        value={formData.neighborhood}
                                        onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            type="text"
                                            placeholder="Auto-filled from address"
                                            value={formData.latitude}
                                            readOnly
                                            className="mt-1 bg-muted"
                                        />
                                        {errors.latitude && <p className="text-sm text-destructive mt-1">{errors.latitude}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            type="text"
                                            placeholder="Auto-filled from address"
                                            value={formData.longitude}
                                            readOnly
                                            className="mt-1 bg-muted"
                                        />
                                        {errors.longitude && <p className="text-sm text-destructive mt-1">{errors.longitude}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Amenities</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Add amenity (e.g., WiFi, Parking, AC)"
                                        value={amenityInput}
                                        onChange={(e) => setAmenityInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                                    />
                                    <Button type="button" onClick={addAmenity}>
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.amenities.map((amenity) => (
                                        <span key={amenity} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                                            {amenity}
                                            <button type="button" onClick={() => removeAmenity(amenity)} className="hover:text-destructive">
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Event Types</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Add event type (e.g., Concert, Wedding, Conference)"
                                        value={eventTypeInput}
                                        onChange={(e) => setEventTypeInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEventType())}
                                    />
                                    <Button type="button" onClick={addEventType}>
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.event_types.map((eventType) => (
                                        <span key={eventType} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                                            {eventType}
                                            <button type="button" onClick={() => removeEventType(eventType)} className="hover:text-destructive">
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Images</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ImageUpload
                                    value={imageFiles}
                                    onChange={setImageFiles}
                                    maxFiles={10}
                                    maxSize={5}
                                    label=""
                                    description="Drag and drop venue images here, or click to select"
                                />
                                {errors.images && <p className="mt-2 text-sm text-destructive">{errors.images}</p>}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Link href={route("venues")}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Venue"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
