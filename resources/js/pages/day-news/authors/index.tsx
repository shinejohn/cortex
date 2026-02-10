import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Award, Calendar, Check, Eye, MapPin, Search, Star, User, Users, X } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface Author {
    id: string;
    name: string;
    bio: string | null;
    avatar: string;
    author_slug: string | null;
    trust_score: number;
    trust_tier: string | null;
    is_verified_author: boolean;
    authored_day_news_posts_count: number;
}

interface AuthorsPageProps {
    auth?: Auth;
    authors: {
        data: Author[];
        links: any;
        meta: any;
    };
    filters: {
        search: string;
    };
}

export default function AuthorsIndex() {
    const { auth, authors, filters } = usePage<AuthorsPageProps>().props;

    const searchForm = useForm({
        search: filters.search || "",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/authors", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getTierColor = (tier: string | null) => {
        switch (tier) {
            case "platinum":
                return "bg-indigo-100 text-indigo-800";
            case "gold":
                return "bg-yellow-100 text-yellow-800";
            case "silver":
                return "bg-gray-200 text-gray-800";
            default:
                return "bg-amber-100 text-amber-800";
        }
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <Head title="Authors - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Authors - Day News",
                        description: "Meet our community authors",
                        url: "/authors",
                    }}
                />
                <DayNewsHeader auth={auth} />

                {/* Page Header */}
                <div className="border-b border-gray-200 bg-white shadow-sm">
                    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="font-display text-3xl font-black tracking-tight text-gray-900">Our Authors</h1>
                                <p className="mt-1 text-gray-600">
                                    Meet the journalists and contributors behind our community news
                                </p>
                            </div>
                            {auth && (
                                <Button
                                    onClick={() => router.visit("/authors/create")}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Become an Author
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
                    <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <form onSubmit={handleSearch} className="flex items-center gap-3">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search authors or articles..."
                                    className="pl-10"
                                />
                                {searchForm.data.search && (
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => searchForm.setData("search", "")}
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <Button type="submit" disabled={searchForm.processing} className="bg-indigo-600 hover:bg-indigo-700">
                                Search
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="text-sm text-gray-600">
                        Showing {authors.data.length} authors
                        {filters.search && <span> matching "{filters.search}"</span>}
                    </div>
                </div>

                {/* Authors Grid */}
                <div className="container mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                    {authors.data.length === 0 ? (
                        <div className="overflow-hidden rounded-lg border-none bg-white p-8 text-center shadow-sm">
                            <Users className="mx-auto mb-4 size-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No authors found</h3>
                            <p className="mb-6 text-gray-600">
                                No authors match your current search criteria. Try adjusting your search query.
                            </p>
                            <Button
                                onClick={() => {
                                    searchForm.setData("search", "");
                                    searchForm.get("/authors", { preserveState: true });
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                Reset Search
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {authors.data.map((author) => (
                                <div
                                    key={author.id}
                                    className="group cursor-pointer overflow-hidden rounded-lg border-none bg-white shadow-sm transition-shadow hover:shadow-md"
                                    onClick={() => router.visit(`/authors/${author.author_slug || author.id}`)}
                                >
                                    <div className="p-6">
                                        {/* Author Avatar and Info */}
                                        <div className="flex items-start">
                                            <div className="relative mr-4 shrink-0">
                                                <img
                                                    src={author.avatar}
                                                    alt={author.name}
                                                    className="size-16 rounded-full object-cover"
                                                />
                                                {author.is_verified_author && (
                                                    <div className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-1 text-white shadow-md">
                                                        <Check className="size-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                                                    {author.name}
                                                </h3>
                                                {author.trust_tier && (
                                                    <Badge className={`mt-1 ${getTierColor(author.trust_tier)}`}>
                                                        <Award className="mr-1 size-3" />
                                                        {author.trust_tier}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Trust Score and Metrics */}
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="mr-2 text-2xl font-bold text-indigo-600">
                                                    {author.trust_score.toFixed(1)}
                                                </div>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`size-4 ${
                                                                star <= Math.round(author.trust_score)
                                                                    ? "fill-current text-yellow-400"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Metrics */}
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                                            <div className="rounded bg-gray-50 p-2">
                                                <div className="text-lg font-semibold text-gray-800">
                                                    {author.authored_day_news_posts_count}
                                                </div>
                                                <div className="text-xs text-gray-500">Articles</div>
                                            </div>
                                            <div className="rounded bg-gray-50 p-2">
                                                <div className="text-lg font-semibold text-gray-800">
                                                    {author.trust_score.toFixed(1)}
                                                </div>
                                                <div className="text-xs text-gray-500">Trust Score</div>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        {author.bio && (
                                            <p className="mt-4 line-clamp-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                                                {author.bio}
                                            </p>
                                        )}

                                        {/* View Profile Button */}
                                        <div className="mt-4">
                                            <button className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
                                                <User className="mr-1.5 size-4" />
                                                View Full Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {authors.links && authors.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {authors.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    className={link.active ? "bg-indigo-600 hover:bg-indigo-700" : ""}
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
