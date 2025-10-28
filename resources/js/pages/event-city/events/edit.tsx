import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Venue {
    id: string;
    name: string;
    address: string;
}

interface Performer {
    id: string;
    name: string;
    genres: string[];
}

interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    time: string;
    category: string;
    subcategories: string[];
    badges: string[];
    is_free: boolean;
    price_min: number;
    price_max: number;
    latitude: number;
    longitude: number;
    venue_id: string | null;
    performer_id: string | null;
    curator_notes: string | null;
    image: string | null;
}

interface Workspace {
    can_accept_payments: boolean;
}

interface Props {
    event: Event;
    venues: Venue[];
    performers: Performer[];
    workspace: Workspace;
}

export default function EditEvent({ event, venues, performers, workspace = { can_accept_payments: true } }: Props) {
    const [formData, setFormData] = useState({
        title: event.title,
        event_date: event.event_date.split("T")[0], // Convert datetime to date
        time: event.time,
        description: event.description,
        category: event.category,
        subcategories: event.subcategories || [],
        badges: event.badges || [],
        is_free: event.is_free,
        price_min: event.price_min?.toString() || "",
        price_max: event.price_max?.toString() || "",
        latitude: event.latitude?.toString() || "",
        longitude: event.longitude?.toString() || "",
        venue_id: event.venue_id || "",
        performer_id: event.performer_id || "",
        curator_notes: event.curator_notes || "",
    });

    const [venueMode, setVenueMode] = useState<"select" | "create">("select");
    const [performerMode, setPerformerMode] = useState<"select" | "create">("select");

    const [newVenue, setNewVenue] = useState({
        name: "",
        description: "",
        venue_type: "",
        capacity: "",
        address: "",
    });

    const [newPerformer, setNewPerformer] = useState({
        name: "",
        bio: "",
        genres: [] as string[],
    });

    const [subcategoryInput, setSubcategoryInput] = useState("");
    const [badgeInput, setBadgeInput] = useState("");
    const [performerGenreInput, setPerformerGenreInput] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const formDataToSend = new FormData();

            // Force is_free to true if workspace cannot accept payments
            const isFree = !workspace.can_accept_payments || formData.is_free;

            // Append regular form fields
            formDataToSend.append("title", formData.title);
            formDataToSend.append("event_date", formData.event_date);
            formDataToSend.append("time", formData.time);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("is_free", isFree ? "1" : "0");
            formDataToSend.append("price_min", isFree ? "0" : formData.price_min || "");
            formDataToSend.append("price_max", isFree ? "0" : formData.price_max || "");
            formDataToSend.append("latitude", formData.latitude || "");
            formDataToSend.append("longitude", formData.longitude || "");
            formDataToSend.append("curator_notes", formData.curator_notes);

            // Append arrays as JSON
            formDataToSend.append("subcategories", JSON.stringify(formData.subcategories));
            formDataToSend.append("badges", JSON.stringify(formData.badges));

            // Handle venue
            if (venueMode === "create") {
                formDataToSend.append(
                    "new_venue",
                    JSON.stringify({
                        ...newVenue,
                        capacity: parseInt(newVenue.capacity) || 0,
                    }),
                );
            } else if (formData.venue_id) {
                formDataToSend.append("venue_id", formData.venue_id);
            }

            // Handle performer
            if (performerMode === "create") {
                formDataToSend.append("new_performer", JSON.stringify(newPerformer));
            } else if (formData.performer_id) {
                formDataToSend.append("performer_id", formData.performer_id);
            }

            // Append image files
            imageFiles.forEach((file, index) => {
                formDataToSend.append(`images[${index}]`, file);
            });

            // Add _method for Laravel to treat this as PUT request
            formDataToSend.append("_method", "PUT");

            const response = await axios.post(route("events.update", event.id), formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200 || response.status === 302) {
                window.location.href = route("events.show", event.id);
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            console.error("Error updating event:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNewVenueChange = (field: string, value: string) => {
        setNewVenue((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNewPerformerChange = (field: string, value: string) => {
        setNewPerformer((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const addSubcategory = () => {
        if (subcategoryInput.trim() && !formData.subcategories.includes(subcategoryInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                subcategories: [...prev.subcategories, subcategoryInput.trim()],
            }));
            setSubcategoryInput("");
        }
    };

    const removeSubcategory = (subcategory: string) => {
        setFormData((prev) => ({
            ...prev,
            subcategories: prev.subcategories.filter((s) => s !== subcategory),
        }));
    };

    const addBadge = () => {
        if (badgeInput.trim() && !formData.badges.includes(badgeInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                badges: [...prev.badges, badgeInput.trim()],
            }));
            setBadgeInput("");
        }
    };

    const removeBadge = (badge: string) => {
        setFormData((prev) => ({
            ...prev,
            badges: prev.badges.filter((b) => b !== badge),
        }));
    };

    const addPerformerGenre = () => {
        if (performerGenreInput.trim() && !newPerformer.genres.includes(performerGenreInput.trim())) {
            setNewPerformer((prev) => ({
                ...prev,
                genres: [...prev.genres, performerGenreInput.trim()],
            }));
            setPerformerGenreInput("");
        }
    };

    const removePerformerGenre = (genre: string) => {
        setNewPerformer((prev) => ({
            ...prev,
            genres: prev.genres.filter((g) => g !== genre),
        }));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${event.title}`} />
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <Link href={route("events.show", event.id)}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Event
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
                        <p className="text-muted-foreground mt-1">Update your event details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Event Title *</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        placeholder="Enter event title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the event"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        required
                                        rows={4}
                                        className="mt-1"
                                    />
                                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="event_date">Event Date *</Label>
                                        <Input
                                            id="event_date"
                                            type="date"
                                            value={formData.event_date}
                                            onChange={(e) => handleInputChange("event_date", e.target.value)}
                                            required
                                            className="mt-1"
                                        />
                                        {errors.event_date && <p className="text-sm text-red-500 mt-1">{errors.event_date}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="time">Event Time *</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => handleInputChange("time", e.target.value)}
                                            required
                                            className="mt-1"
                                        />
                                        {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Input
                                        id="category"
                                        type="text"
                                        placeholder="e.g., Concert, Theater, Sports"
                                        value={formData.category}
                                        onChange={(e) => handleInputChange("category", e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                    {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                                </div>

                                <div>
                                    <Label>Event Images</Label>
                                    <ImageUpload
                                        value={imageFiles}
                                        onChange={setImageFiles}
                                        maxFiles={5}
                                        maxSize={5}
                                        label=""
                                        description="Drag and drop event images here, or click to select"
                                    />
                                    {errors.images && <p className="mt-2 text-sm text-destructive">{errors.images}</p>}
                                </div>

                                <div>
                                    <Label>Subcategories</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            type="text"
                                            placeholder="Add subcategory"
                                            value={subcategoryInput}
                                            onChange={(e) => setSubcategoryInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubcategory())}
                                        />
                                        <Button type="button" onClick={addSubcategory}>
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.subcategories.map((subcategory) => (
                                            <span
                                                key={subcategory}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm"
                                            >
                                                {subcategory}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSubcategory(subcategory)}
                                                    className="hover:text-destructive"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Badges</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            type="text"
                                            placeholder="Add badge (e.g., Featured, Popular)"
                                            value={badgeInput}
                                            onChange={(e) => setBadgeInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBadge())}
                                        />
                                        <Button type="button" onClick={addBadge}>
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.badges.map((badge) => (
                                            <span key={badge} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                                                {badge}
                                                <button type="button" onClick={() => removeBadge(badge)} className="hover:text-destructive">
                                                    ×
                                                </button>
                                            </span>
                                        ))}
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
                                            <strong>Payment restrictions:</strong> Your workspace must be approved for Stripe Connect to set paid
                                            pricing. Only free events (price = $0.00) are allowed until approval. Contact support for approval.
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_free"
                                        checked={formData.is_free || !workspace.can_accept_payments}
                                        onCheckedChange={(checked) => handleInputChange("is_free", !!checked)}
                                        disabled={!workspace.can_accept_payments}
                                    />
                                    <Label htmlFor="is_free" className="cursor-pointer">
                                        This is a free event {!workspace.can_accept_payments && "(Required)"}
                                    </Label>
                                </div>

                                {!formData.is_free && workspace.can_accept_payments && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="price_min">Minimum Price *</Label>
                                            <Input
                                                id="price_min"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.price_min}
                                                onChange={(e) => handleInputChange("price_min", e.target.value)}
                                                min="0"
                                                className="mt-1"
                                            />
                                            {errors.price_min && <p className="text-sm text-red-500 mt-1">{errors.price_min}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="price_max">Maximum Price *</Label>
                                            <Input
                                                id="price_max"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.price_max}
                                                onChange={(e) => handleInputChange("price_max", e.target.value)}
                                                min="0"
                                                className="mt-1"
                                            />
                                            {errors.price_max && <p className="text-sm text-red-500 mt-1">{errors.price_max}</p>}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Venue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={venueMode} onValueChange={(value) => setVenueMode(value as "select" | "create")}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="select">Select Existing</TabsTrigger>
                                        <TabsTrigger value="create">Create New</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="select" className="space-y-4">
                                        <div>
                                            <Label htmlFor="venue_id">Select Venue</Label>
                                            <Select value={formData.venue_id} onValueChange={(value) => handleInputChange("venue_id", value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Choose a venue" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {venues.map((venue) => (
                                                        <SelectItem key={venue.id} value={venue.id}>
                                                            {venue.name} - {venue.address}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="create" className="space-y-4">
                                        <div>
                                            <Label htmlFor="new_venue_name">Venue Name *</Label>
                                            <Input
                                                id="new_venue_name"
                                                type="text"
                                                placeholder="Enter venue name"
                                                value={newVenue.name}
                                                onChange={(e) => handleNewVenueChange("name", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="new_venue_description">Description *</Label>
                                            <Textarea
                                                id="new_venue_description"
                                                placeholder="Describe the venue"
                                                value={newVenue.description}
                                                onChange={(e) => handleNewVenueChange("description", e.target.value)}
                                                rows={3}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="new_venue_type">Venue Type *</Label>
                                                <Input
                                                    id="new_venue_type"
                                                    type="text"
                                                    placeholder="e.g., Concert Hall"
                                                    value={newVenue.venue_type}
                                                    onChange={(e) => handleNewVenueChange("venue_type", e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="new_venue_capacity">Capacity *</Label>
                                                <Input
                                                    id="new_venue_capacity"
                                                    type="number"
                                                    placeholder="Capacity"
                                                    value={newVenue.capacity}
                                                    onChange={(e) => handleNewVenueChange("capacity", e.target.value)}
                                                    min="1"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="new_venue_address">Address *</Label>
                                            <Input
                                                id="new_venue_address"
                                                type="text"
                                                placeholder="Enter full address"
                                                value={newVenue.address}
                                                onChange={(e) => handleNewVenueChange("address", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Performer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={performerMode} onValueChange={(value) => setPerformerMode(value as "select" | "create")}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="select">Select Existing</TabsTrigger>
                                        <TabsTrigger value="create">Create New</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="select" className="space-y-4">
                                        <div>
                                            <Label htmlFor="performer_id">Select Performer</Label>
                                            <Select value={formData.performer_id} onValueChange={(value) => handleInputChange("performer_id", value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Choose a performer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {performers.map((performer) => (
                                                        <SelectItem key={performer.id} value={performer.id}>
                                                            {performer.name} - {performer.genres.join(", ")}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="create" className="space-y-4">
                                        <div>
                                            <Label htmlFor="new_performer_name">Performer Name *</Label>
                                            <Input
                                                id="new_performer_name"
                                                type="text"
                                                placeholder="Enter performer name"
                                                value={newPerformer.name}
                                                onChange={(e) => handleNewPerformerChange("name", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="new_performer_bio">Bio *</Label>
                                            <Textarea
                                                id="new_performer_bio"
                                                placeholder="Tell us about the performer"
                                                value={newPerformer.bio}
                                                onChange={(e) => handleNewPerformerChange("bio", e.target.value)}
                                                rows={3}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label>Genres *</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input
                                                    type="text"
                                                    placeholder="Add genre"
                                                    value={performerGenreInput}
                                                    onChange={(e) => setPerformerGenreInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPerformerGenre())}
                                                />
                                                <Button type="button" onClick={addPerformerGenre}>
                                                    Add
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {newPerformer.genres.map((genre) => (
                                                    <span
                                                        key={genre}
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm"
                                                    >
                                                        {genre}
                                                        <button
                                                            type="button"
                                                            onClick={() => removePerformerGenre(genre)}
                                                            className="hover:text-destructive"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="latitude">Latitude *</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            placeholder="e.g., 40.7128"
                                            value={formData.latitude}
                                            onChange={(e) => handleInputChange("latitude", e.target.value)}
                                            required
                                            className="mt-1"
                                        />
                                        {errors.latitude && <p className="text-sm text-red-500 mt-1">{errors.latitude}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="longitude">Longitude *</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            placeholder="e.g., -74.0060"
                                            value={formData.longitude}
                                            onChange={(e) => handleInputChange("longitude", e.target.value)}
                                            required
                                            className="mt-1"
                                        />
                                        {errors.longitude && <p className="text-sm text-red-500 mt-1">{errors.longitude}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <Label htmlFor="curator_notes">Curator Notes</Label>
                                    <Textarea
                                        id="curator_notes"
                                        placeholder="Add any special notes or information"
                                        value={formData.curator_notes}
                                        onChange={(e) => handleInputChange("curator_notes", e.target.value)}
                                        rows={3}
                                        className="mt-1"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Link href={route("events.show", event.id)}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
