import { Head, Link, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "@/layouts/form-layout";
import { useState } from "react";

interface Performer {
    id: string;
    name: string;
    bio: string;
    genres: string[];
    home_city: string;
    years_active: number;
    shows_played: number;
    profile_image: string | null;
    base_price: number | null;
    minimum_booking_hours: number;
    travel_fee_per_mile: number | null;
    setup_fee: number | null;
    cancellation_policy: string | null;
    available_for_booking: boolean;
    is_family_friendly: boolean;
    has_merchandise: boolean;
    has_original_music: boolean;
    offers_meet_and_greet: boolean;
    takes_requests: boolean;
    available_for_private_events: boolean;
    has_samples: boolean;
}

interface Props {
    performer: Performer;
}

export default function EditPerformer({ performer }: Props) {
    const [genreInput, setGenreInput] = useState("");

    const { data, setData, put, processing, errors } = useForm({
        name: performer.name || "",
        bio: performer.bio || "",
        genres: performer.genres || [],
        home_city: performer.home_city || "",
        years_active: performer.years_active?.toString() || "0",
        shows_played: performer.shows_played?.toString() || "0",
        profile_image: performer.profile_image || "",
        base_price: performer.base_price?.toString() || "",
        minimum_booking_hours: performer.minimum_booking_hours?.toString() || "1",
        travel_fee_per_mile: performer.travel_fee_per_mile?.toString() || "",
        setup_fee: performer.setup_fee?.toString() || "",
        cancellation_policy: performer.cancellation_policy || "",
        available_for_booking: performer.available_for_booking,
        is_family_friendly: performer.is_family_friendly,
        has_merchandise: performer.has_merchandise,
        has_original_music: performer.has_original_music,
        offers_meet_and_greet: performer.offers_meet_and_greet,
        takes_requests: performer.takes_requests,
        available_for_private_events: performer.available_for_private_events,
        has_samples: performer.has_samples,
    });

    const addGenre = () => {
        if (genreInput.trim() && !data.genres.includes(genreInput.trim())) {
            setData("genres", [...data.genres, genreInput.trim()]);
            setGenreInput("");
        }
    };

    const removeGenre = (genre: string) => {
        setData("genres", data.genres.filter((g) => g !== genre));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("performers.update", performer.id) as string);
    };

    return (
        <FormLayout
            title={`Edit ${performer.name}`}
            description="Update performer profile"
            backHref={route("performers.show", performer.id) as string}
            backLabel="Back to Performer"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} className="mt-1" />
                            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="bio">Bio *</Label>
                            <Textarea id="bio" value={data.bio} onChange={(e) => setData("bio", e.target.value)} rows={4} className="mt-1" />
                            {errors.bio && <p className="mt-1 text-sm text-destructive">{errors.bio}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="home_city">Home City *</Label>
                                <Input id="home_city" value={data.home_city} onChange={(e) => setData("home_city", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="years_active">Years Active *</Label>
                                <Input id="years_active" type="number" min="0" value={data.years_active} onChange={(e) => setData("years_active", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="shows_played">Shows Played *</Label>
                                <Input id="shows_played" type="number" min="0" value={data.shows_played} onChange={(e) => setData("shows_played", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="profile_image">Profile Image URL</Label>
                            <Input id="profile_image" value={data.profile_image} onChange={(e) => setData("profile_image", e.target.value)} className="mt-1" placeholder="https://..." />
                        </div>
                        <div>
                            <Label>Genres *</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    value={genreInput}
                                    onChange={(e) => setGenreInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
                                    placeholder="Add genre"
                                />
                                <Button type="button" onClick={addGenre}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {data.genres.map((genre) => (
                                    <Badge key={genre} variant="secondary" className="gap-1">
                                        {genre}
                                        <button type="button" onClick={() => removeGenre(genre)} className="hover:text-destructive ml-1">x</button>
                                    </Badge>
                                ))}
                            </div>
                            {errors.genres && <p className="mt-1 text-sm text-destructive">{errors.genres}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Pricing & Booking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="base_price">Base Price</Label>
                                <Input id="base_price" type="number" step="0.01" min="0" value={data.base_price} onChange={(e) => setData("base_price", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="minimum_booking_hours">Min. Booking Hours *</Label>
                                <Input id="minimum_booking_hours" type="number" min="1" value={data.minimum_booking_hours} onChange={(e) => setData("minimum_booking_hours", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="travel_fee_per_mile">Travel Fee/Mile</Label>
                                <Input id="travel_fee_per_mile" type="number" step="0.01" min="0" value={data.travel_fee_per_mile} onChange={(e) => setData("travel_fee_per_mile", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="setup_fee">Setup Fee</Label>
                                <Input id="setup_fee" type="number" step="0.01" min="0" value={data.setup_fee} onChange={(e) => setData("setup_fee", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                            <Textarea id="cancellation_policy" value={data.cancellation_policy} onChange={(e) => setData("cancellation_policy", e.target.value)} rows={3} className="mt-1" />
                        </div>
                    </CardContent>
                </Card>

                {/* Features */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Features & Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: "available_for_booking" as const, label: "Available for Booking" },
                                { key: "is_family_friendly" as const, label: "Family Friendly" },
                                { key: "has_merchandise" as const, label: "Has Merchandise" },
                                { key: "has_original_music" as const, label: "Has Original Music" },
                                { key: "offers_meet_and_greet" as const, label: "Offers Meet & Greet" },
                                { key: "takes_requests" as const, label: "Takes Requests" },
                                { key: "available_for_private_events" as const, label: "Private Events" },
                                { key: "has_samples" as const, label: "Has Samples" },
                            ].map(({ key, label }) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={key}
                                        checked={data[key]}
                                        onCheckedChange={(checked) => setData(key, !!checked)}
                                    />
                                    <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route("performers.show", performer.id) as string}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
