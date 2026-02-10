import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Headphones, Mic, Plus, Search, TrendingUp } from "lucide-react";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
import type { Auth } from "@/types";

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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface LocalVoicesPageProps {
    auth?: Auth;
    podcasts: {
        data: Podcast[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    filters: {
        category: string;
        sort: string;
        search: string;
    };
    viewMode?: string;
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
        searchForm.get("/", {
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
        <GoLocalVoicesLayout auth={auth}>
            <Head title="Go Local Voices - Community Podcasts" />
            <SEO
                type="website"
                site="go-local-voices"
                data={{
                    title: "Go Local Voices - Community Podcasts",
                    description: "Discover and share local podcasts from your community. Connect with creators and explore diverse voices.",
                    url: "/",
                }}
            />

            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Go Local Voices
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">Discover and share local podcasts from your community</p>
                        {auth && (
                            <Button
                                onClick={() => router.visit("/register")}
                                size="lg"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Become a Creator
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <form onSubmit={handleSearch} className="mb-8 space-y-5">
                        <div className="flex gap-3 max-w-2xl mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search podcasts..."
                                    className="pl-12 h-12 rounded-xl border focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={searchForm.processing}
                                className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                Search
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map((cat) => (
                                <Button
                                    key={cat.value}
                                    type="button"
                                    variant={searchForm.data.category === cat.value ? "default" : "outline"}
                                    size="sm"
                                    className={`rounded-full ${
                                        searchForm.data.category === cat.value
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-sm"
                                            : "border hover:border-purple-400 hover:text-purple-600"
                                    }`}
                                    onClick={() => {
                                        searchForm.setData("category", cat.value);
                                        searchForm.get("/", {
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
                </div>
            </div>

            {/* Podcasts Grid */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {podcasts.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <Mic className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
                        <p className="text-muted-foreground text-lg font-medium mb-2">No podcasts found.</p>
                        <p className="text-muted-foreground text-sm mb-6">Try adjusting your search or filters</p>
                        {auth && (
                            <Button
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                onClick={() => router.visit("/register")}
                            >
                                Become a Creator
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {podcasts.data.map((podcast) => (
                            <div
                                key={podcast.id}
                                className="group cursor-pointer rounded-2xl bg-card overflow-hidden border-none shadow-sm hover:shadow-md transition-all"
                                onClick={() => router.visit(`/podcasts/${podcast.slug}`)}
                            >
                                {podcast.cover_image ? (
                                    <div className="overflow-hidden">
                                        <img
                                            src={podcast.cover_image}
                                            alt={podcast.title}
                                            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                                        <Headphones className="h-12 w-12 text-purple-400" />
                                    </div>
                                )}
                                <div className="p-5">
                                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-purple-600 transition-colors">
                                        {podcast.title}
                                    </h3>
                                    {podcast.description && (
                                        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{podcast.description}</p>
                                    )}
                                    <div className="mb-3 flex items-center gap-2">
                                        <img
                                            src={podcast.creator?.avatar || "/default-avatar.png"}
                                            alt={podcast.creator?.display_name}
                                            className="h-6 w-6 rounded-full object-cover ring-2 ring-background"
                                        />
                                        <span className="text-sm text-muted-foreground">{podcast.creator?.display_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                        <div className="flex items-center gap-4">
                                            <span>{podcast.episodes_count ?? 0} episodes</span>
                                            <span>{podcast.subscribers_count ?? 0} subscribers</span>
                                        </div>
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            {podcast.total_listens?.toLocaleString() ?? 0}
                                        </span>
                                    </div>
                                    {podcast.category && (
                                        <Badge variant="outline" className="border-purple-200 text-purple-600 bg-purple-50">
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
                    <div className="mt-10 flex justify-center gap-1.5">
                        {podcasts.links.map((link: PaginationLink, index: number) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                className={`rounded-lg ${
                                    link.active
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                                        : "border hover:border-purple-400"
                                }`}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </GoLocalVoicesLayout>
    );
}
