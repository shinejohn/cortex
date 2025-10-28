import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Workspace {
    can_accept_payments: boolean;
}

interface Props {
    workspace: Workspace;
}

export default function CreatePerformer({ workspace }: Props) {
    const [formData, setFormData] = useState({
        name: "",
        genres: [] as string[],
        bio: "",
        years_active: "",
        shows_played: "",
        home_city: "",
        available_for_booking: true,
        has_merchandise: false,
        has_original_music: false,
        offers_meet_and_greet: false,
        takes_requests: false,
        available_for_private_events: true,
        is_family_friendly: true,
        has_samples: false,
        base_price: "",
        currency: "USD",
        minimum_booking_hours: "2",
        travel_fee_per_mile: "",
        setup_fee: "",
        cancellation_policy: "",
    });

    const [genreInput, setGenreInput] = useState("");
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
            formDataToSend.append("bio", formData.bio);
            formDataToSend.append("years_active", formData.years_active);
            formDataToSend.append("shows_played", formData.shows_played);
            formDataToSend.append("home_city", formData.home_city);
            formDataToSend.append("base_price", formData.base_price || "");
            formDataToSend.append("currency", formData.currency);
            formDataToSend.append("minimum_booking_hours", formData.minimum_booking_hours);
            formDataToSend.append("travel_fee_per_mile", formData.travel_fee_per_mile || "");
            formDataToSend.append("setup_fee", formData.setup_fee || "");
            formDataToSend.append("cancellation_policy", formData.cancellation_policy);

            // Append boolean fields
            formDataToSend.append("available_for_booking", formData.available_for_booking ? "1" : "0");
            formDataToSend.append("has_merchandise", formData.has_merchandise ? "1" : "0");
            formDataToSend.append("has_original_music", formData.has_original_music ? "1" : "0");
            formDataToSend.append("offers_meet_and_greet", formData.offers_meet_and_greet ? "1" : "0");
            formDataToSend.append("takes_requests", formData.takes_requests ? "1" : "0");
            formDataToSend.append("available_for_private_events", formData.available_for_private_events ? "1" : "0");
            formDataToSend.append("is_family_friendly", formData.is_family_friendly ? "1" : "0");
            formDataToSend.append("has_samples", formData.has_samples ? "1" : "0");

            // Append genres as JSON
            formDataToSend.append("genres", JSON.stringify(formData.genres));

            // Append image files
            imageFiles.forEach((file, index) => {
                formDataToSend.append(`images[${index}]`, file);
            });

            const response = await axios.post(route("performers.store"), formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200 || response.status === 201) {
                window.location.href = route("performers.show", response.data.id || response.data.performer?.id);
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            console.error("Error creating performer:", error);
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

    const addGenre = () => {
        if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                genres: [...prev.genres, genreInput.trim()],
            }));
            setGenreInput("");
        }
    };

    const removeGenre = (genre: string) => {
        setFormData((prev) => ({
            ...prev,
            genres: prev.genres.filter((g) => g !== genre),
        }));
    };

    return (
        <AppLayout>
            <Head title="Create Performer" />
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <Link href={route("performers")}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Performers
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Create Performer Profile</h1>
                        <p className="text-muted-foreground mt-1">Add a new performer to your workspace</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Performer Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter performer name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label>Profile & Gallery Images</Label>
                                    <ImageUpload
                                        value={imageFiles}
                                        onChange={setImageFiles}
                                        maxFiles={10}
                                        maxSize={5}
                                        label=""
                                        description="Drag and drop performer images here, or click to select"
                                    />
                                    {errors.images && <p className="mt-2 text-sm text-destructive">{errors.images}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="bio">Bio *</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about the performer"
                                        value={formData.bio}
                                        onChange={(e) => handleInputChange("bio", e.target.value)}
                                        required
                                        rows={4}
                                        className="mt-1"
                                    />
                                    {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio}</p>}
                                </div>

                                <div>
                                    <Label>Genres *</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            type="text"
                                            placeholder="Add genre (e.g., Rock, Jazz, Pop)"
                                            value={genreInput}
                                            onChange={(e) => setGenreInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
                                        />
                                        <Button type="button" onClick={addGenre}>
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.genres.map((genre) => (
                                            <span key={genre} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                                                {genre}
                                                <button type="button" onClick={() => removeGenre(genre)} className="hover:text-destructive">
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    {errors.genres && <p className="text-sm text-red-500 mt-1">{errors.genres}</p>}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="years_active">Years Active</Label>
                                        <Input
                                            id="years_active"
                                            type="number"
                                            placeholder="0"
                                            value={formData.years_active}
                                            onChange={(e) => handleInputChange("years_active", e.target.value)}
                                            min="0"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="shows_played">Shows Played</Label>
                                        <Input
                                            id="shows_played"
                                            type="number"
                                            placeholder="0"
                                            value={formData.shows_played}
                                            onChange={(e) => handleInputChange("shows_played", e.target.value)}
                                            min="0"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="home_city">Home City</Label>
                                        <Input
                                            id="home_city"
                                            type="text"
                                            placeholder="City name"
                                            value={formData.home_city}
                                            onChange={(e) => handleInputChange("home_city", e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing & Booking</CardTitle>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="base_price">Base Price</Label>
                                        <Input
                                            id="base_price"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.base_price}
                                            onChange={(e) => handleInputChange("base_price", e.target.value)}
                                            min="0"
                                            max={!workspace.can_accept_payments ? "0" : undefined}
                                            disabled={!workspace.can_accept_payments}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="currency">Currency</Label>
                                        <Input
                                            id="currency"
                                            type="text"
                                            placeholder="USD"
                                            value={formData.currency}
                                            onChange={(e) => handleInputChange("currency", e.target.value)}
                                            maxLength={3}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="minimum_booking_hours">Min. Booking Hours</Label>
                                        <Input
                                            id="minimum_booking_hours"
                                            type="number"
                                            placeholder="2"
                                            value={formData.minimum_booking_hours}
                                            onChange={(e) => handleInputChange("minimum_booking_hours", e.target.value)}
                                            min="1"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="travel_fee_per_mile">Travel Fee/Mile</Label>
                                        <Input
                                            id="travel_fee_per_mile"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.travel_fee_per_mile}
                                            onChange={(e) => handleInputChange("travel_fee_per_mile", e.target.value)}
                                            min="0"
                                            max={!workspace.can_accept_payments ? "0" : undefined}
                                            disabled={!workspace.can_accept_payments}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="setup_fee">Setup Fee</Label>
                                        <Input
                                            id="setup_fee"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.setup_fee}
                                            onChange={(e) => handleInputChange("setup_fee", e.target.value)}
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

                                <div>
                                    <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                                    <Textarea
                                        id="cancellation_policy"
                                        placeholder="Describe your cancellation policy"
                                        value={formData.cancellation_policy}
                                        onChange={(e) => handleInputChange("cancellation_policy", e.target.value)}
                                        rows={3}
                                        className="mt-1"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Performer Features</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="available_for_booking"
                                        checked={formData.available_for_booking}
                                        onCheckedChange={(checked) => handleInputChange("available_for_booking", !!checked)}
                                    />
                                    <Label htmlFor="available_for_booking" className="cursor-pointer">
                                        Available for booking
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_merchandise"
                                        checked={formData.has_merchandise}
                                        onCheckedChange={(checked) => handleInputChange("has_merchandise", !!checked)}
                                    />
                                    <Label htmlFor="has_merchandise" className="cursor-pointer">
                                        Has merchandise
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_original_music"
                                        checked={formData.has_original_music}
                                        onCheckedChange={(checked) => handleInputChange("has_original_music", !!checked)}
                                    />
                                    <Label htmlFor="has_original_music" className="cursor-pointer">
                                        Has original music
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="offers_meet_and_greet"
                                        checked={formData.offers_meet_and_greet}
                                        onCheckedChange={(checked) => handleInputChange("offers_meet_and_greet", !!checked)}
                                    />
                                    <Label htmlFor="offers_meet_and_greet" className="cursor-pointer">
                                        Offers meet and greet
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="takes_requests"
                                        checked={formData.takes_requests}
                                        onCheckedChange={(checked) => handleInputChange("takes_requests", !!checked)}
                                    />
                                    <Label htmlFor="takes_requests" className="cursor-pointer">
                                        Takes requests
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="available_for_private_events"
                                        checked={formData.available_for_private_events}
                                        onCheckedChange={(checked) => handleInputChange("available_for_private_events", !!checked)}
                                    />
                                    <Label htmlFor="available_for_private_events" className="cursor-pointer">
                                        Available for private events
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_family_friendly"
                                        checked={formData.is_family_friendly}
                                        onCheckedChange={(checked) => handleInputChange("is_family_friendly", !!checked)}
                                    />
                                    <Label htmlFor="is_family_friendly" className="cursor-pointer">
                                        Family friendly
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_samples"
                                        checked={formData.has_samples}
                                        onCheckedChange={(checked) => handleInputChange("has_samples", !!checked)}
                                    />
                                    <Label htmlFor="has_samples" className="cursor-pointer">
                                        Has audio/video samples
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Link href={route("performers")}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Performer"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
