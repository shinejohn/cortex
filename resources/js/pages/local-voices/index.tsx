import { SEO } from "@/components/common/seo";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Headphones, Mic, Plus, Search } from "lucide-react";

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
    viewMode?: string;
}

export default function LocalVoicesIndex() {
    const { auth, podcasts, filters, viewMode } = usePage<LocalVoicesPageProps>().props;

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

            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Go Local Voices
                        </h1>
                        <p className="text-xl text-gray-600 mb-6">Discover and share local podcasts from your community</p>
                        {auth && (
                            <Button
                                onClick={() => router.visit("/register")}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Become a Creator
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <form onSubmit={handleSearch} className="mb-8 space-y-4">
                        <div className="flex gap-4 max-w-2xl mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search podcasts..."
                                    className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={searchForm.processing}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                                    className={
                                        searchForm.data.category === cat.value
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                                            : "border-gray-300 hover:border-purple-500"
                                    }
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {podcasts.data.length === 0 ? (
                    <div className="py-12 text-center">
                        <Mic className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <p className="text-gray-600 text-lg mb-2">No podcasts found.</p>
                        {auth && (
                            <Button
                                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                                className="cursor-pointer rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg hover:border-purple-300"
                                onClick={() => router.visit(`/podcasts/${podcast.slug}`)}
                            >
                                {podcast.cover_image ? (
                                    <img src={podcast.cover_image} alt={podcast.title} className="h-48 w-full rounded-t-lg object-cover" />
                                ) : (
                                    <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-purple-100 to-pink-100">
                                        <Headphones className="h-12 w-12 text-purple-400" />
                                    </div>
                                )}
                                <div className="p-5">
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{podcast.title}</h3>
                                    {podcast.description && <p className="mb-3 line-clamp-2 text-sm text-gray-600">{podcast.description}</p>}
                                    <div className="mb-3 flex items-center gap-2">
                                        <img
                                            src={podcast.creator.avatar || "/default-avatar.png"}
                                            alt={podcast.creator.display_name}
                                            className="h-6 w-6 rounded-full object-cover border border-gray-200"
                                        />
                                        <span className="text-sm text-gray-600">{podcast.creator.display_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                        <div className="flex items-center gap-4">
                                            <span>{podcast.episodes_count} episodes</span>
                                            <span>{podcast.subscribers_count} subscribers</span>
                                        </div>
                                        <span>{podcast.total_listens.toLocaleString()} listens</span>
                                    </div>
                                    {podcast.category && (
                                        <Badge variant="outline" className="mt-2 border-purple-200 text-purple-700 bg-purple-50">
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
                                className={
                                    link.active
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                                        : "border-gray-300 hover:border-purple-500"
                                }
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
