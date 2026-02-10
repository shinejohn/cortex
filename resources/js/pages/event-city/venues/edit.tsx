import { Head, Link, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "@/layouts/form-layout";

interface Venue {
    id: string;
    name: string;
    description: string;
    venue_type: string;
    capacity: number;
    price_per_hour: number | null;
    price_per_event: number | null;
    price_per_day: number | null;
    address: string;
    neighborhood: string | null;
    latitude: number | null;
    longitude: number | null;
    amenities: string[];
    event_types: string[];
    images: string[];
}

interface Props {
    venue: Venue;
}

export default function EditVenue({ venue }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: venue.name || "",
        description: venue.description || "",
        venue_type: venue.venue_type || "",
        capacity: venue.capacity?.toString() || "",
        price_per_hour: venue.price_per_hour?.toString() || "0",
        price_per_event: venue.price_per_event?.toString() || "0",
        price_per_day: venue.price_per_day?.toString() || "0",
        address: venue.address || "",
        neighborhood: venue.neighborhood || "",
        latitude: venue.latitude?.toString() || "",
        longitude: venue.longitude?.toString() || "",
        amenities: venue.amenities || [],
        event_types: venue.event_types || [],
        images: venue.images || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("venues.update", venue.id) as string);
    };

    return (
        <FormLayout
            title={`Edit ${venue.name}`}
            description="Update venue details"
            backHref={route("venues.show", venue.id) as string}
            backLabel="Back to Venue"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Venue Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="mt-1"
                            />
                            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                                rows={4}
                                className="mt-1"
                            />
                            {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="venue_type">Venue Type *</Label>
                                <Input
                                    id="venue_type"
                                    value={data.venue_type}
                                    onChange={(e) => setData("venue_type", e.target.value)}
                                    placeholder="e.g., Concert Hall, Bar, Theater"
                                    className="mt-1"
                                />
                                {errors.venue_type && <p className="mt-1 text-sm text-destructive">{errors.venue_type}</p>}
                            </div>
                            <div>
                                <Label htmlFor="capacity">Capacity *</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    value={data.capacity}
                                    onChange={(e) => setData("capacity", e.target.value)}
                                    className="mt-1"
                                />
                                {errors.capacity && <p className="mt-1 text-sm text-destructive">{errors.capacity}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="price_per_hour">Price per Hour *</Label>
                            <Input
                                id="price_per_hour"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price_per_hour}
                                onChange={(e) => setData("price_per_hour", e.target.value)}
                                className="mt-1"
                            />
                            {errors.price_per_hour && <p className="mt-1 text-sm text-destructive">{errors.price_per_hour}</p>}
                        </div>
                        <div>
                            <Label htmlFor="price_per_event">Price per Event *</Label>
                            <Input
                                id="price_per_event"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price_per_event}
                                onChange={(e) => setData("price_per_event", e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="price_per_day">Price per Day *</Label>
                            <Input
                                id="price_per_day"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price_per_day}
                                onChange={(e) => setData("price_per_day", e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={data.address}
                                onChange={(e) => setData("address", e.target.value)}
                                className="mt-1"
                            />
                            {errors.address && <p className="mt-1 text-sm text-destructive">{errors.address}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="neighborhood">Neighborhood</Label>
                                <Input
                                    id="neighborhood"
                                    value={data.neighborhood}
                                    onChange={(e) => setData("neighborhood", e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    value={data.latitude}
                                    onChange={(e) => setData("latitude", e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    value={data.longitude}
                                    onChange={(e) => setData("longitude", e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route("venues.show", venue.id) as string}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
