import { router, useForm, usePage } from "@inertiajs/react";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import DayNewsLayout from "@/layouts/day-news-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnnouncementHero } from "@/components/day-news/announcement-hero";
import { AnnouncementFilters } from "@/components/day-news/announcement-filters";
import { AnnouncementSidebar } from "@/components/day-news/announcement-sidebar";
import { AnnouncementCard } from "@/components/day-news/announcement-card";
import { FeaturedAnnouncement } from "@/components/day-news/featured-announcement";
import { cn } from "@/lib/utils";
import type { Auth } from "@/types";

interface Announcement {
    id: string;
    type: string;
    title: string;
    content: string;
    image: string | null;
    location: string | null;
    event_date: string | null;
    event_date_formatted: string | null;
    published_at: string;
    published_at_diff: string;
    views_count: number;
    reactions_count: number;
    comments_count: number;
    user: {
        id: string;
        name: string;
        avatar: string | null;
    };
}

interface AnnouncementsPageProps {
    [key: string]: any;
    auth?: Auth;
    announcements: {
        data: Announcement[];
        links: any[];
        meta: any;
    };
    featured: Announcement | null;
    memorials?: Announcement[];
    upcomingEvents?: any[];
    filters: {
        type: string;
        search: string;
    };
    currentRegion?: {
        id: string;
        name: string;
    };
}

export default function AnnouncementsIndex() {
    const {
        auth,
        announcements,
        featured,
        memorials = [],
        upcomingEvents = [],
        filters,
        currentRegion
    } = usePage<AnnouncementsPageProps>().props;

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

    return (
        <DayNewsLayout
            auth={auth}
            containerClassName="container mx-auto px-4 py-12 lg:px-8 bg-[#F8F9FB]"
            seo={{
                title: "Community Announcements - Day News",
                description: "Celebrating community milestones, life transitions, and public notices in your neighborhood.",
                url: "/announcements",
            }}
        >
            <AnnouncementHero
                location={currentRegion?.name}
            />

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {/* Main Feed */}
                <div className="lg:col-span-8">
                    {/* Search and Filters Bar */}
                    <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1 max-w-md">
                            <form onSubmit={handleSearch} className="group relative">
                                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search celebrations & notices..."
                                    className="h-12 pl-12 pr-4 shadow-sm border-none bg-white ring-1 ring-muted focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                                />
                            </form>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth && (
                                <Button
                                    onClick={() => router.visit(route("daynews.announcements.create") as any)}
                                    className="h-12 gap-2 px-6 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 rounded-xl"
                                >
                                    <Plus className="size-4" />
                                    Post News
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mb-12">
                        <AnnouncementFilters activeType={activeType} onTypeChange={handleTypeChange} />
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-16">
                        {featured && activeType === "all" && !searchForm.data.search && (
                            <section>
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="font-display text-2xl font-black tracking-tight uppercase italic text-primary">
                                        Regional Spotlight
                                    </h2>
                                </div>
                                <FeaturedAnnouncement announcement={featured} />
                            </section>
                        )}

                        <section>
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="font-display text-2xl font-black tracking-tight uppercase">
                                    {searchForm.data.search ? `Search Results for "${searchForm.data.search}"` : "Recent Community News"}
                                </h2>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    {announcements.meta?.total ?? 0} Announcements
                                </div>
                            </div>

                            {announcements.data.length === 0 ? (
                                <div className="relative rounded-3xl border-2 border-dashed p-20 text-center overflow-hidden">
                                    {/* Decorative blobs */}
                                    <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/5 blur-3xl" />
                                    <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-indigo-500/5 blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                                            <Search className="size-10 text-muted-foreground" />
                                        </div>
                                        <h3 className="mt-6 font-display text-xl font-black tracking-tight">No announcements found</h3>
                                        <p className="mt-2 text-sm font-medium text-muted-foreground">Try adjusting your filters or search query.</p>
                                        <Button
                                            variant="outline"
                                            className="mt-8 font-bold rounded-xl"
                                            onClick={() => {
                                                setActiveType("all");
                                                searchForm.setData({ search: "", type: "all" });
                                                router.get(route("daynews.announcements.index") as any);
                                            }}
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-8 md:grid-cols-2">
                                    {announcements.data.map((announcement) => (
                                        <AnnouncementCard key={announcement.id} announcement={announcement} />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {announcements.meta?.last_page > 1 && (
                                <div className="mt-16 flex justify-center gap-3">
                                    {announcements.meta.links.map((link: any, i: number) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            className={cn(
                                                "h-10 min-w-[40px] px-4 font-bold transition-all rounded-xl",
                                                link.active && "shadow-lg shadow-primary/20 scale-110"
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4">
                    <AnnouncementSidebar
                        upcomingEvents={upcomingEvents}
                        memorials={memorials}
                        location={currentRegion?.name}
                    />
                </div>
            </div>
        </DayNewsLayout>
    );
}
