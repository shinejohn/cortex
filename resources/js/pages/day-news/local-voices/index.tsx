import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Headphones, Mic, Plus, Search, Users } from "lucide-react";

interface Podcast {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    cover_image: string | null;
    category: string | null;
    episodes_count: number;
    subscribers_count: number;
    total_listens: number;
    creator: {
        id: string;
        display_name: string;
        avatar: string | null;
    };
}

interface LocalVoicesPageProps {
    auth?: Auth;
    podcasts: {
        data: Podcast[];
        links: any;
        meta: any;
    };
    filters: {
        category: string;
        sort: string;
        search: string;
    };
}

export default function LocalVoicesIndex() {
    const { auth, podcasts, filters } = usePage<LocalVoicesPageProps>().props;

    const searchForm = useForm({
        search: filters.search || "",
        category: filters.category || "all",
        sort: filters.sort || "trending",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/local-voices", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "news", label: "News & Politics" },
        { value: "business", label: "Business" },
        { value: "culture", label: "Culture & Arts" },
        { value: "sports", label: "Sports" },
        { value: "education", label: "Education" },
        { value: "entertainment", label: "Entertainment" },
        { value: "technology", label: "Technology" },
        { value: "health", label: "Health & Wellness" },
        { value: "family", label: "Family & Parenting" },
    ];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Local Voices - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Local Voices - Day News",
                        description: "Community podcasts and audio content",
                        url: "/local-voices",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold">Local Voices</h1>
                            <p className="mt-2 text-muted-foreground">Community podcasts and audio content</p>
                        </div>
                        {auth && (
                            <Button onClick={() => router.visit("/local-voices/register")}>
                                <Plus className="mr-2 size-4" />
                                Become a Creator
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <form onSubmit={handleSearch} className="mb-6 space-y-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search podcasts..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing}>
                                Search
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <Button
                                    key={cat.value}
                                    type="button"
                                    variant={searchForm.data.category === cat.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        searchForm.setData("category", cat.value);
                                        searchForm.get("/local-voices", {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    {cat.label}
                                </Button>
                            ))}
                        </div>
                    </form>

                    {/* Podcasts Grid */}
                    {podcasts.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Mic className="mx-auto mb-4 size-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No podcasts found.</p>
                            {auth && (
                                <Button className="mt-4" onClick={() => router.visit("/local-voices/register")}>
                                    Become a Creator
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {podcasts.data.map((podcast) => (
                                <div
                                    key={podcast.id}
                                    className="cursor-pointer rounded-lg border bg-card transition-shadow hover:shadow-md"
                                    onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}`)}
                                >
                                    {podcast.cover_image ? (
                                        <img src={podcast.cover_image} alt={podcast.title} className="h-48 w-full rounded-t-lg object-cover" />
                                    ) : (
                                        <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-muted">
                                            <Headphones className="size-12 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="mb-2 text-lg font-semibold">{podcast.title}</h3>
                                        {podcast.description && (
                                            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{podcast.description}</p>
                                        )}
                                        <div className="mb-3 flex items-center gap-2">
                                            <img
                                                src={podcast.creator.avatar || "/default-avatar.png"}
                                                alt={podcast.creator.display_name}
                                                className="size-6 rounded-full object-cover"
                                            />
                                            <span className="text-sm text-muted-foreground">{podcast.creator.display_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <span>{podcast.episodes_count} episodes</span>
                                                <span>{podcast.subscribers_count} subscribers</span>
                                            </div>
                                            <span>{podcast.total_listens.toLocaleString()} listens</span>
                                        </div>
                                        {podcast.category && (
                                            <Badge variant="outline" className="mt-2">
                                                {podcast.category}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {podcasts.links && podcasts.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {podcasts.links.map((link: any, index: number) => (
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
