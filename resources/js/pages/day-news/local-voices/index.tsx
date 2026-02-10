import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Headphones, Mic, Music, Newspaper, Plus, Search, Users, Video } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
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
        searchForm.get(route("daynews.local-voices.index") as any, {
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

    /* Browse-by-type cards matching spec-ui gradient pattern */
    const browseTypes = [
        { icon: Mic, label: "Audio Creators", desc: "Local podcasts and audio shows", gradient: "from-blue-500 to-indigo-600" },
        { icon: Video, label: "Video Shows", desc: "Video podcasts and vodcasts", gradient: "from-red-500 to-pink-600" },
        { icon: Newspaper, label: "News & Politics", desc: "Stay informed on local issues", gradient: "from-green-500 to-teal-600" },
        { icon: Music, label: "Culture & Events", desc: "Arts, music, and local culture", gradient: "from-purple-500 to-violet-600" },
    ];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title="Local Voices - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Local Voices - Day News",
                        description: "Community podcasts and audio content",
                        url: route("daynews.local-voices.index") as any,
                    }}
                />
                <DayNewsHeader auth={auth} />

                {/* Hero Search Section */}
                <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-10 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwIj48cGF0aCBkPSJNMCAxMCBRIDI1IDIwLCA1MCAxMCBUIDEwMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] bg-repeat" />
                    </div>
                    <div className="container relative z-10 mx-auto max-w-5xl px-4">
                        <div className="mb-6 text-center">
                            <div className="mb-2 flex items-center justify-center gap-2">
                                <Mic className="size-4 text-white/80" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Community Audio</span>
                            </div>
                            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl">
                                Discover Local Voices
                            </h1>
                            <p className="mt-2 text-lg text-white/80">
                                Podcasts and multimedia content from your community
                            </p>
                        </div>
                        <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-xl">
                            <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        type="text"
                                        value={searchForm.data.search}
                                        onChange={(e) => searchForm.setData("search", e.target.value)}
                                        placeholder="Search creators, shows, or topics"
                                        className="h-12 pl-12 pr-4 border-none bg-zinc-50 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={searchForm.processing}
                                    className="h-12 rounded-xl bg-primary px-8 font-bold shadow-lg shadow-primary/20"
                                >
                                    Search
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Browse by Type */}
                <section className="border-b border-zinc-100 bg-white py-8">
                    <div className="container mx-auto max-w-7xl px-4">
                        <h2 className="mb-4 font-display text-xl font-bold text-zinc-900">Browse by Type</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {browseTypes.map((type) => (
                                <div
                                    key={type.label}
                                    className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className={`flex h-20 items-center justify-center bg-gradient-to-r ${type.gradient}`}>
                                        <type.icon className="size-10 text-white" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-zinc-900">{type.label}</h3>
                                        <p className="text-xs text-zinc-500">{type.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header with CTA */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="font-display text-2xl font-bold text-zinc-900">Featured Creators</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Discover podcasts from your community</p>
                        </div>
                        {auth && (
                            <Button
                                onClick={() => router.visit(route("daynews.local-voices.register") as any)}
                                className="rounded-xl font-bold shadow-lg shadow-primary/20"
                            >
                                <Plus className="mr-2 size-4" />
                                Become a Creator
                            </Button>
                        )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="mb-8 flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => {
                                    searchForm.setData("category", cat.value);
                                    searchForm.get(route("daynews.local-voices.index") as any, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    });
                                }}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    searchForm.data.category === cat.value
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-200 hover:ring-primary hover:text-primary"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Podcasts Grid */}
                    {podcasts.data.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed p-20 text-center">
                            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                                <Mic className="size-10 text-muted-foreground" />
                            </div>
                            <h3 className="mt-6 font-display text-xl font-bold">No podcasts found</h3>
                            <p className="mt-2 text-muted-foreground">Try adjusting your search or filters.</p>
                            {auth && (
                                <Button
                                    className="mt-6 rounded-xl font-bold shadow-lg shadow-primary/20"
                                    onClick={() => router.visit(route("daynews.local-voices.register") as any)}
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
                                    className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all hover:shadow-md"
                                    onClick={() => router.visit(route("daynews.local-voices.podcast.show", podcast.slug) as any)}
                                >
                                    {podcast.cover_image ? (
                                        <div className="aspect-[16/10] overflow-hidden">
                                            <img
                                                src={podcast.cover_image}
                                                alt={podcast.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-50">
                                            <Headphones className="size-16 text-zinc-300" />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h3 className="mb-2 font-display text-lg font-bold group-hover:text-primary transition-colors">
                                            {podcast.title}
                                        </h3>
                                        {podcast.description && (
                                            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{podcast.description}</p>
                                        )}
                                        <div className="mb-3 flex items-center gap-2">
                                            <img
                                                src={podcast.creator.avatar || "/default-avatar.png"}
                                                alt={podcast.creator.display_name}
                                                className="size-6 rounded-full object-cover ring-2 ring-white"
                                            />
                                            <span className="text-sm font-medium text-zinc-700">{podcast.creator.display_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-zinc-500">
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium">{podcast.episodes_count} episodes</span>
                                                <span>{podcast.subscribers_count} subscribers</span>
                                            </div>
                                            <span className="font-medium">{podcast.total_listens.toLocaleString()} listens</span>
                                        </div>
                                        {podcast.category && (
                                            <Badge className="mt-3 bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.15em]">
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
                        <div className="mt-12 flex justify-center gap-3">
                            {podcasts.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    className={`font-bold ${link.active ? "shadow-lg shadow-primary/20" : ""}`}
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
