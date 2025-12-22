import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { useForm } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { ArrowLeft, Calendar, Image as ImageIcon, MapPin, Megaphone, Upload } from "lucide-react";
import { router } from "@inertiajs/react";

interface CreateAnnouncementProps {
    auth?: Auth;
}

export default function CreateAnnouncement({ auth }: CreateAnnouncementProps) {
    const form = useForm({
        type: "",
        title: "",
        content: "",
        image: null as File | null,
        location: "",
        event_date: "",
        region_ids: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/announcements", {
            forceFormData: true,
            onSuccess: () => {
                router.visit("/announcements");
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            form.setData("image", e.target.files[0]);
        }
    };

    const categories = [
        { value: "wedding", label: "Wedding" },
        { value: "engagement", label: "Engagement" },
        { value: "birth", label: "Birth" },
        { value: "graduation", label: "Graduation" },
        { value: "anniversary", label: "Anniversary" },
        { value: "celebration", label: "Celebration" },
        { value: "general", label: "General" },
        { value: "community_event", label: "Community Event" },
        { value: "public_notice", label: "Public Notice" },
        { value: "emergency_alert", label: "Emergency Alert" },
        { value: "meeting", label: "Meeting" },
        { value: "volunteer_opportunity", label: "Volunteer Opportunity" },
        { value: "road_closure", label: "Road Closure" },
        { value: "school_announcement", label: "School Announcement" },
    ];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Create Announcement - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Create Announcement - Day News",
                        description: "Create a community announcement",
                        url: "/announcements/create",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <Button variant="ghost" onClick={() => router.visit("/announcements")} className="mb-6">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Announcements
                    </Button>

                    <div className="mb-6 flex items-center gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                            <Megaphone className="size-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold">Create an Announcement</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
                        {/* Type */}
                        <div>
                            <Label htmlFor="type">Category *</Label>
                            <Select value={form.data.type} onValueChange={(value) => form.setData("type", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.type && <p className="mt-1 text-sm text-destructive">{form.errors.type}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Announcement Title *</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData("title", e.target.value)}
                                placeholder="Enter a clear, attention-grabbing title"
                                required
                            />
                            {form.errors.title && <p className="mt-1 text-sm text-destructive">{form.errors.title}</p>}
                        </div>

                        {/* Content */}
                        <div>
                            <Label htmlFor="content">Announcement Details *</Label>
                            <Textarea
                                id="content"
                                value={form.data.content}
                                onChange={(e) => form.setData("content", e.target.value)}
                                placeholder="Provide all the important details about your announcement"
                                rows={6}
                                required
                            />
                            {form.errors.content && <p className="mt-1 text-sm text-destructive">{form.errors.content}</p>}
                        </div>

                        {/* Location */}
                        <div>
                            <Label htmlFor="location">Location (if applicable)</Label>
                            <div className="flex items-center">
                                <MapPin className="mr-2 size-5 text-muted-foreground" />
                                <Input
                                    id="location"
                                    value={form.data.location}
                                    onChange={(e) => form.setData("location", e.target.value)}
                                    placeholder="Enter location"
                                />
                            </div>
                        </div>

                        {/* Event Date */}
                        <div>
                            <Label htmlFor="event_date">Event Date (if applicable)</Label>
                            <div className="flex items-center">
                                <Calendar className="mr-2 size-5 text-muted-foreground" />
                                <Input
                                    id="event_date"
                                    type="date"
                                    value={form.data.event_date}
                                    onChange={(e) => form.setData("event_date", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <Label htmlFor="image">Image (optional)</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <label
                                    htmlFor="image-upload"
                                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-4 hover:bg-muted"
                                >
                                    <Upload className="size-5" />
                                    <span>{form.data.image ? form.data.image.name : "Upload Image"}</span>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                                {form.data.image && (
                                    <div className="relative">
                                        <img
                                            src={URL.createObjectURL(form.data.image)}
                                            alt="Preview"
                                            className="h-20 w-20 rounded-lg object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.visit("/announcements")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? "Publishing..." : "Publish Announcement"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}

