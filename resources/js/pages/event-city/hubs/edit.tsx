import { Head, Link, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "@/layouts/form-layout";

interface Section {
    id: string;
    type: string;
    title: string;
}

interface Member {
    id: string;
    role: string;
    user: { id: string; name: string; email: string };
}

interface Hub {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    subcategory: string | null;
    location: string | null;
    website: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    about: string | null;
    analytics_enabled: boolean;
    articles_enabled: boolean;
    community_enabled: boolean;
    events_enabled: boolean;
    gallery_enabled: boolean;
    performers_enabled: boolean;
    venues_enabled: boolean;
    sections: Section[];
    members: Member[];
}

interface Props {
    hub: Hub;
}

export default function EditHub({ hub }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: hub.name || "",
        description: hub.description || "",
        category: hub.category || "",
        subcategory: hub.subcategory || "",
        location: hub.location || "",
        website: hub.website || "",
        contact_email: hub.contact_email || "",
        contact_phone: hub.contact_phone || "",
        about: hub.about || "",
        analytics_enabled: hub.analytics_enabled ?? false,
        articles_enabled: hub.articles_enabled ?? false,
        community_enabled: hub.community_enabled ?? false,
        events_enabled: hub.events_enabled ?? false,
        gallery_enabled: hub.gallery_enabled ?? false,
        performers_enabled: hub.performers_enabled ?? false,
        venues_enabled: hub.venues_enabled ?? false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("hubs.update", hub.id) as string);
    };

    return (
        <FormLayout
            title={`Edit ${hub.name}`}
            description="Update hub settings and configuration"
            backHref={route("hubs.show", hub.slug) as string}
            backLabel="Back to Hub"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Hub Name *</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} className="mt-1" />
                            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={data.description} onChange={(e) => setData("description", e.target.value)} rows={3} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" value={data.category} onChange={(e) => setData("category", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="subcategory">Subcategory</Label>
                                <Input id="subcategory" value={data.subcategory} onChange={(e) => setData("subcategory", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="about">About</Label>
                            <Textarea id="about" value={data.about} onChange={(e) => setData("about", e.target.value)} rows={5} className="mt-1" placeholder="Tell people about this hub..." />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Contact & Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" value={data.location} onChange={(e) => setData("location", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" type="url" value={data.website} onChange={(e) => setData("website", e.target.value)} className="mt-1" placeholder="https://..." />
                                {errors.website && <p className="mt-1 text-sm text-destructive">{errors.website}</p>}
                            </div>
                            <div>
                                <Label htmlFor="contact_email">Contact Email</Label>
                                <Input id="contact_email" type="email" value={data.contact_email} onChange={(e) => setData("contact_email", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="contact_phone">Contact Phone</Label>
                                <Input id="contact_phone" value={data.contact_phone} onChange={(e) => setData("contact_phone", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Features */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Enabled Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: "analytics_enabled" as const, label: "Analytics" },
                                { key: "articles_enabled" as const, label: "Articles" },
                                { key: "community_enabled" as const, label: "Community" },
                                { key: "events_enabled" as const, label: "Events" },
                                { key: "gallery_enabled" as const, label: "Gallery" },
                                { key: "performers_enabled" as const, label: "Performers" },
                                { key: "venues_enabled" as const, label: "Venues" },
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

                {/* Members Summary */}
                {hub.members && hub.members.length > 0 && (
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Members ({hub.members.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {hub.members.slice(0, 10).map((member) => (
                                    <div key={member.id} className="flex items-center justify-between text-sm">
                                        <span>{member.user.name}</span>
                                        <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                                            {member.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route("hubs.show", hub.slug) as string}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
