import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Calendar, Image as ImageIcon, MapPin, Upload, Save, Info, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface Announcement {
    id: string;
    type: string;
    title: string;
    content: string;
    image: string | null;
    location: string | null;
    event_date: string | null;
    regions: Array<{ id: string; name: string }>;
}

interface EditAnnouncementProps {
    auth?: Auth;
    announcement: Announcement;
}

export default function EditAnnouncement({ auth, announcement }: EditAnnouncementProps) {
    const form = useForm({
        _method: "PATCH",
        type: announcement.type,
        title: announcement.title,
        content: announcement.content,
        image: null as File | null,
        location: announcement.location || "",
        event_date: announcement.event_date || "",
        region_ids: announcement.regions.map(r => r.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use post with _method: PATCH for file upload compatibility in some environments
        // Use post with _method: PATCH for file upload compatibility in some environments
        form.post(route("daynews.announcements.update", announcement.id) as any, {
            forceFormData: true,
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
        { value: "memorial", label: "Memorial" },
        { value: "celebration", label: "Celebration" },
        { value: "meeting", label: "Meeting" },
        { value: "public_notice", label: "Public Notice" },
    ];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#FDFCFB]">
                <Head title={`Edit ${announcement.title} - Day News`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `Edit Announcement: ${announcement.title}`,
                        url: `/announcements/${announcement.id}/edit`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-10">
                        <Link
                            href={route("daynews.announcements.show", announcement.id) as any}
                            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            BACK TO ANNOUNCEMENT
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        {/* Form Section */}
                        <div className="lg:col-span-8">
                            <div className="mb-10">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <Save className="size-6" />
                                    </div>
                                    <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary font-black uppercase tracking-widest text-[10px] px-3">
                                        Editor Mode
                                    </Badge>
                                </div>
                                <h1 className="font-display text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
                                    Edit Announcement
                                </h1>
                                <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                    Update your milestone details to keep the community informed.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <section className="space-y-8 rounded-3xl border bg-white p-8 shadow-sm">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-black text-zinc-900 mb-1 flex items-center gap-2">
                                            <Info className="size-5 text-primary" />
                                            Basic Information
                                        </h2>
                                        <p className="text-sm text-muted-foreground font-medium">Update the core details of your announcement.</p>
                                    </div>

                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="type" className="text-xs font-black uppercase tracking-widest text-zinc-500">Category *</Label>
                                            <Select value={form.data.type} onValueChange={(value) => form.setData("type", value)}>
                                                <SelectTrigger className="h-12 border-zinc-200 bg-zinc-50/50 focus:bg-white transition-colors rounded-xl font-bold">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-zinc-200">
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value} className="font-medium focus:bg-primary/5 focus:text-primary">
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.type && <p className="text-[11px] font-bold text-destructive uppercase tracking-widest">{form.errors.type}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-zinc-500">Announcement Title *</Label>
                                            <Input
                                                id="title"
                                                className="h-12 border-zinc-200 bg-zinc-50/50 focus:bg-white transition-colors rounded-xl font-bold"
                                                value={form.data.title}
                                                onChange={(e) => form.setData("title", e.target.value)}
                                                placeholder="e.target.value"
                                                required
                                            />
                                            {form.errors.title && <p className="text-[11px] font-bold text-destructive uppercase tracking-widest">{form.errors.title}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="content" className="text-xs font-black uppercase tracking-widest text-zinc-500">Announcement Details *</Label>
                                        <Textarea
                                            id="content"
                                            className="min-h-[200px] border-zinc-200 bg-zinc-50/50 focus:bg-white transition-colors rounded-2xl font-medium leading-relaxed resize-none p-6"
                                            value={form.data.content}
                                            onChange={(e) => form.setData("content", e.target.value)}
                                            placeholder="Write your announcement details here."
                                            required
                                        />
                                        {form.errors.content && <p className="text-[11px] font-bold text-destructive uppercase tracking-widest">{form.errors.content}</p>}
                                    </div>
                                </section>

                                <section className="space-y-8 rounded-3xl border bg-white p-8 shadow-sm">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-black text-zinc-900 mb-1 flex items-center gap-2">
                                            <Calendar className="size-5 text-primary" />
                                            Logistics & Media
                                        </h2>
                                        <p className="text-sm text-muted-foreground font-medium">Update location, date, or cover image.</p>
                                    </div>

                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-zinc-500">Location</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                                                <Input
                                                    id="location"
                                                    className="h-12 border-zinc-200 bg-zinc-50/50 pl-11 focus:bg-white transition-colors rounded-xl font-bold"
                                                    value={form.data.location}
                                                    onChange={(e) => form.setData("location", e.target.value)}
                                                    placeholder="e.g. Community Center"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="event_date" className="text-xs font-black uppercase tracking-widest text-zinc-500">Event Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                                                <Input
                                                    id="event_date"
                                                    type="date"
                                                    className="h-12 border-zinc-200 bg-zinc-50/50 pl-11 focus:bg-white transition-colors rounded-xl font-bold"
                                                    value={form.data.event_date}
                                                    onChange={(e) => form.setData("event_date", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Image Cover</Label>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <label
                                                htmlFor="image-upload"
                                                className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-10 hover:bg-zinc-100 hover:border-primary/30 transition-all cursor-pointer group"
                                            >
                                                <div className="flex size-14 items-center justify-center rounded-full bg-white border shadow-sm group-hover:scale-110 transition-transform">
                                                    <Upload className="size-6 text-zinc-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-sm font-black text-zinc-900">
                                                        {form.data.image ? form.data.image.name : "Replace current image"}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 block">PNG, JPG, or WEBP (MAX. 5MB)</span>
                                                </div>
                                                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>

                                            {(form.data.image || announcement.image) ? (
                                                <div className="relative rounded-2xl overflow-hidden border shadow-inner bg-zinc-200 aspect-video">
                                                    <img
                                                        src={form.data.image ? URL.createObjectURL(form.data.image) : (announcement.image ? (announcement.image.startsWith('http') ? announcement.image : `/storage/${announcement.image}`) : '')}
                                                        alt="Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                    {form.data.image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => form.setData("image", null)}
                                                            className="absolute top-4 right-4 size-8 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow-sm text-zinc-900 border font-black text-xs hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border-2 border-dashed border-zinc-100 bg-zinc-50/30 flex items-center justify-center text-zinc-300">
                                                    <ImageIcon className="size-12 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <div className="flex items-center justify-end gap-6 pt-6">
                                    <Link href={route("daynews.announcements.show", announcement.id) as any} className="text-xs font-black text-muted-foreground hover:text-zinc-900 uppercase tracking-widest transition-colors">
                                        Cancel & Discard
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                    >
                                        {form.processing ? "Saving Changes..." : "Save Announcement"}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar Guidelines */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 space-y-8">
                                <Card className="border-none shadow-lg shadow-zinc-200/50 rounded-3xl overflow-hidden">
                                    <div className="bg-zinc-900 p-6 text-white">
                                        <h3 className="font-display text-xl font-black tracking-tight">Community Guidelines</h3>
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">For sharing milestones</p>
                                    </div>
                                    <CardContent className="p-8 space-y-6">
                                        {[
                                            { title: "Be Respectful", desc: "Share announcements that foster community spirit and respect local values." },
                                            { title: "Stay Regional", desc: "Ensure your announcement is relevant to the selected community regions." },
                                            { title: "No Commercials", desc: "Use the Business Directory or Ads for commercial promotion." },
                                            { title: "Accuracy Matters", desc: "Double check dates, times, and locations before publishing." }
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4">
                                                <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-black text-zinc-900 leading-none mb-1.5">{item.title}</h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <div className="rounded-3xl bg-primary/5 p-8 border border-primary/10">
                                    <h4 className="font-display text-lg font-black text-zinc-900 mb-2">Need Help?</h4>
                                    <p className="text-sm text-zinc-600 font-medium leading-relaxed mb-6">
                                        If you're unsure about where to post or have questions, reach out to our community curators.
                                    </p>
                                    <Link href="/contact" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
                                        Contact Support →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}
