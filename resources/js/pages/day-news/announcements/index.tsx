import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Heart, MapPin, MessageSquare, Plus, Search } from "lucide-react";
import { useState } from "react";

interface Announcement {
    id: string;
    type: string;
    title: string;
    content: string;
    image: string | null;
    location: string | null;
    event_date: string | null;
    published_at: string;
    views_count: number;
    reactions_count: number;
    comments_count: number;
    user: {
        id: string;
        name: string;
        avatar: string | null;
    };
    regions: Array<{
        id: string;
        name: string;
    }>;
}

interface AnnouncementsPageProps {
    auth?: Auth;
    announcements: {
        data: Announcement[];
        links: any;
        meta: any;
    };
    featured: Announcement | null;
    filters: {
        type: string;
        search: string;
    };
}

export default function AnnouncementsIndex() {
    const { auth, announcements, featured, filters } = usePage<AnnouncementsPageProps>().props;
    const [activeType, setActiveType] = useState(filters.type || "all");

    const searchForm = useForm({
        search: filters.search || "",
        type: activeType,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/announcements", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTypeChange = (type: string) => {
        setActiveType(type);
        searchForm.setData("type", type);
        searchForm.get("/announcements", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const typeLabels: Record<string, string> = {
        all: "All",
        wedding: "Weddings",
        engagement: "Engagements",
        birth: "Births",
        graduation: "Graduations",
        anniversary: "Anniversaries",
        celebration: "Celebrations",
        general: "General",
        community_event: "Community Events",
        public_notice: "Public Notices",
        emergency_alert: "Emergency Alerts",
        meeting: "Meetings",
        volunteer_opportunity: "Volunteer Opportunities",
        road_closure: "Road Closures",
        school_announcement: "School Announcements",
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Announcements - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Announcements - Day News",
                        description: "Community announcements, celebrations, and public notices",
                        url: "/announcements",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold">Announcements</h1>
                            <p className="mt-2 text-muted-foreground">Community celebrations, events, and public notices</p>
                        </div>
                        {auth && (
                            <Button onClick={() => router.visit("/announcements/create")}>
                                <Plus className="mr-2 size-4" />
                                Create Announcement
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="mb-4 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search announcements..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing}>
                                Search
                            </Button>
                        </form>

                        {/* Type Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(typeLabels).map(([value, label]) => (
                                <Button
                                    key={value}
                                    variant={activeType === value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleTypeChange(value)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Featured Announcement */}
                    {featured && (
                        <div className="mb-8 rounded-lg border bg-card p-6">
                            <Badge className="mb-2">Featured</Badge>
                            <h2 className="mb-2 text-2xl font-bold">{featured.title}</h2>
                            {featured.image && (
                                <img src={featured.image} alt={featured.title} className="mb-4 h-64 w-full rounded-lg object-cover" />
                            )}
                            <p className="mb-4 text-muted-foreground">{featured.content}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {featured.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="size-4" />
                                        {featured.location}
                                    </div>
                                )}
                                {featured.event_date && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="size-4" />
                                        {new Date(featured.event_date).toLocaleDateString()}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Heart className="size-4" />
                                    {featured.reactions_count}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="size-4" />
                                    {featured.comments_count}
                                </div>
                            </div>
                            <Button
                                className="mt-4"
                                onClick={() => router.visit(`/announcements/${featured.id}`)}
                            >
                                Read More
                            </Button>
                        </div>
                    )}

                    {/* Announcements Grid */}
                    {announcements.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">No announcements found.</p>
                            {auth && (
                                <Button className="mt-4" onClick={() => router.visit("/announcements/create")}>
                                    Create First Announcement
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {announcements.data.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="cursor-pointer rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                                    onClick={() => router.visit(`/announcements/${announcement.id}`)}
                                >
                                    {announcement.image && (
                                        <img
                                            src={announcement.image}
                                            alt={announcement.title}
                                            className="mb-4 h-48 w-full rounded-lg object-cover"
                                        />
                                    )}
                                    <Badge variant="outline" className="mb-2 capitalize">
                                        {announcement.type.replace("_", " ")}
                                    </Badge>
                                    <h3 className="mb-2 text-xl font-semibold">{announcement.title}</h3>
                                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{announcement.content}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                        {announcement.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="size-3" />
                                                {announcement.location}
                                            </div>
                                        )}
                                        {announcement.event_date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                {new Date(announcement.event_date).toLocaleDateString()}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Heart className="size-3" />
                                            {announcement.reactions_count}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {announcements.links && announcements.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {announcements.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}

