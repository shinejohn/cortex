import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { toast } from "sonner";

const CATEGORIES = [
    { value: "jazz", label: "Jazz" },
    { value: "kids", label: "Kids" },
    { value: "fitness", label: "Fitness" },
    { value: "seniors", label: "Seniors" },
    { value: "schools", label: "Schools" },
    { value: "sports", label: "Sports" },
    { value: "arts", label: "Arts" },
    { value: "food", label: "Food" },
    { value: "professional", label: "Professional" },
];

const UPDATE_FREQUENCIES = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
];

interface Workspace {
    can_accept_payments: boolean;
}

interface Props {
    workspace: Workspace;
}

export default function CreateCalendar({ workspace }: Props) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        about: "",
        location: "",
        update_frequency: "",
        subscription_price: "0.00",
        is_private: false,
    });

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
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("about", formData.about || "");
            formDataToSend.append("location", formData.location || "");
            formDataToSend.append("update_frequency", formData.update_frequency);
            formDataToSend.append("subscription_price", formData.subscription_price);
            formDataToSend.append("is_private", formData.is_private ? "1" : "0");

            // Append image file if exists
            if (imageFiles.length > 0) {
                formDataToSend.append("image", imageFiles[0]);
            }

            const response = await axios.post(route("calendars.store"), formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200 || response.status === 201) {
                const calendarId = response.data.id || response.data.calendar?.id;
                router.visit(route("calendars.show", { calendar: calendarId }));
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            console.error("Error creating calendar:", error);
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

    return (
        <AppLayout>
            <Head title="Create Calendar" />
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <Link href={route("calendars.index")}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Calendars
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Create New Calendar</h1>
                        <p className="text-muted-foreground mt-1">Create a curated calendar to organize and share events</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Calendar Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Calendar Title *</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        placeholder="Enter calendar title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                    {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Brief description of your calendar"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        required
                                        rows={3}
                                        className="mt-1"
                                    />
                                    {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category">Category *</Label>
                                        <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Choose a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map((category) => (
                                                    <SelectItem key={category.value} value={category.value}>
                                                        {category.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="update_frequency">Update Frequency *</Label>
                                        <Select
                                            value={formData.update_frequency}
                                            onValueChange={(value) => handleInputChange("update_frequency", value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="How often do you update?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {UPDATE_FREQUENCIES.map((freq) => (
                                                    <SelectItem key={freq.value} value={freq.value}>
                                                        {freq.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.update_frequency && <p className="text-sm text-destructive mt-1">{errors.update_frequency}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="e.g., San Francisco, CA"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange("location", e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
                                </div>

                                <div>
                                    <Label>Calendar Image</Label>
                                    <ImageUpload
                                        value={imageFiles}
                                        onChange={setImageFiles}
                                        maxFiles={1}
                                        maxSize={5}
                                        label=""
                                        description="Drag and drop a calendar cover image here, or click to select"
                                    />
                                    {errors.image && <p className="mt-2 text-sm text-destructive">{errors.image}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="about">About (Additional Details)</Label>
                                    <Textarea
                                        id="about"
                                        placeholder="Share more details about your calendar, what makes it unique, and what followers can expect"
                                        value={formData.about}
                                        onChange={(e) => handleInputChange("about", e.target.value)}
                                        rows={5}
                                        className="mt-1"
                                    />
                                    {errors.about && <p className="text-sm text-destructive mt-1">{errors.about}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing & Privacy</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!workspace.can_accept_payments && (
                                    <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4">
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            <strong>Payment restrictions:</strong> Your workspace must be approved for Stripe Connect before you can
                                            set paid pricing. Until then, all calendars must be free ($0.00).
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="subscription_price">Subscription Price (monthly) *</Label>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                        <Input
                                            id="subscription_price"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.subscription_price}
                                            onChange={(e) => handleInputChange("subscription_price", e.target.value)}
                                            min="0"
                                            max={!workspace.can_accept_payments ? "0" : "999.99"}
                                            className="pl-8"
                                            disabled={!workspace.can_accept_payments}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {!workspace.can_accept_payments
                                            ? "Must be free ($0.00) until workspace is approved for payments"
                                            : "Set to $0.00 for a free calendar"}
                                    </p>
                                    {errors.subscription_price && <p className="text-sm text-destructive mt-1">{errors.subscription_price}</p>}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_private"
                                        checked={formData.is_private}
                                        onCheckedChange={(checked) => handleInputChange("is_private", !!checked)}
                                    />
                                    <Label htmlFor="is_private" className="cursor-pointer">
                                        Make this calendar private
                                    </Label>
                                </div>
                                <p className="text-xs text-muted-foreground">Private calendars are only visible to you and people you invite</p>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Link href={route("calendars.index")}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Calendar"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
