import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Search, X, Clock, Filter, TrendingUp, Calendar, Building, Hash, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";

interface SearchResult {
    id: string;
    type: "article" | "event" | "business" | "tag";
    title: string;
    excerpt?: string;
    description?: string;
    image?: string;
    published_at?: string;
    date?: string;
    author?: {
        name: string;
        avatar: string | null;
    };
    venue?: string;
    location?: string;
    address?: string;
    slug: string;
    regions?: string[];
    rating?: number;
    review_count?: number;
    article_count?: number;
    followers?: number;
}

interface SearchPageProps {
    auth?: Auth;
    query: string;
    filter: string;
    sort: string;
    timeFilter: string;
    results: {
        articles: SearchResult[];
        events: SearchResult[];
        businesses: SearchResult[];
        tags: SearchResult[];
    };
    totalResults: number;
    trendingSearches: string[];
    suggestions: string[];
}

export default function SearchPage() {
    const { auth, query: initialQuery, filter, sort, timeFilter, results, totalResults, trendingSearches, suggestions: initialSuggestions } = usePage<SearchPageProps>().props;
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);

    const searchForm = useForm({
        q: initialQuery,
        filter: filter || "all",
        sort: sort || "relevance",
        time: timeFilter || "any",
    });

    useEffect(() => {
        setSearchQuery(initialQuery);
    }, [initialQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/search", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSuggestionClick = (suggestion: string) => {
        searchForm.setData("q", suggestion);
        searchForm.get("/search", {
            preserveState: true,
            preserveScroll: true,
        });
        setShowSuggestions(false);
    };

    const handleFilterChange = (newFilter: string) => {
        searchForm.setData("filter", newFilter);
        searchForm.get("/search", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSortChange = (newSort: string) => {
        searchForm.setData("sort", newSort);
        searchForm.get("/search", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTimeFilterChange = (newTime: string) => {
        searchForm.setData("time", newTime);
        searchForm.get("/search", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const allResults = [
        ...results.articles.map((r) => ({ ...r, type: "article" as const })),
        ...results.events.map((r) => ({ ...r, type: "event" as const })),
        ...results.businesses.map((r) => ({ ...r, type: "business" as const })),
        ...results.tags.map((r) => ({ ...r, type: "tag" as const })),
    ];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`Search${searchQuery ? `: ${searchQuery}` : ""} - Day News`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `Search${searchQuery ? `: ${searchQuery}` : ""} - Day News`,
                        description: `Search results for ${searchQuery || "Day News"}`,
                        url: `/search`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        searchForm.setData("q", e.target.value);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="Search for anything in your community..."
                                    className="h-14 pl-12 pr-12 text-lg"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            searchForm.setData("q", "");
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="size-5 text-muted-foreground" />
                                    </button>
                                )}
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && (suggestions.length > 0 || trendingSearches.length > 0) && (
                                <div className="absolute z-10 mt-2 w-full rounded-lg border bg-card shadow-lg">
                                    {suggestions.length > 0 && (
                                        <div className="p-2">
                                            <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Suggestions</div>
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                                                >
                                                    <Search className="mr-2 inline size-4 text-muted-foreground" />
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {trendingSearches.length > 0 && (
                                        <div className="border-t p-2">
                                            <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold text-muted-foreground">
                                                <TrendingUp className="size-3" />
                                                Trending Searches
                                            </div>
                                            {trendingSearches.map((trending, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(trending)}
                                                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                                                >
                                                    {trending}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Filters */}
                    {searchQuery && (
                        <div className="mb-6 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="size-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Filter:</span>
                                <div className="flex gap-2">
                                    {["all", "articles", "events", "businesses", "tags"].map((f) => (
                                        <Button
                                            key={f}
                                            variant={filter === f ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleFilterChange(f)}
                                        >
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Sort:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="rounded-md border bg-background px-3 py-1.5 text-sm"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="date">Date</option>
                                    <option value="popularity">Popularity</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-muted-foreground" />
                                <select
                                    value={timeFilter}
                                    onChange={(e) => handleTimeFilterChange(e.target.value)}
                                    className="rounded-md border bg-background px-3 py-1.5 text-sm"
                                >
                                    <option value="any">Any Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {searchQuery ? (
                        <div>
                            <div className="mb-4 text-sm text-muted-foreground">
                                {totalResults} {totalResults === 1 ? "result" : "results"} for "{searchQuery}"
                            </div>

                            {totalResults === 0 ? (
                                <div className="py-12 text-center">
                                    <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-xl font-semibold">No results found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Articles */}
                                    {results.articles.length > 0 && (
                                        <div>
                                            <h2 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-2xl font-bold">
                                                <FileText className="size-5" />
                                                Articles ({results.articles.length})
                                            </h2>
                                            <div className="space-y-4">
                                                {results.articles.map((article) => (
                                                    <NewsArticleCard
                                                        key={article.id}
                                                        article={{
                                                            id: article.id,
                                                            title: article.title,
                                                            slug: article.slug,
                                                            excerpt: article.excerpt,
                                                            featured_image: article.image || null,
                                                            published_at: article.published_at || null,
                                                            view_count: 0,
                                                            author: article.author
                                                                ? {
                                                                      id: article.author.name,
                                                                      name: article.author.name,
                                                                  }
                                                                : null,
                                                            regions: article.regions?.map((r) => ({ id: r, name: r })) || [],
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Events */}
                                    {results.events.length > 0 && (
                                        <div>
                                            <h2 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-2xl font-bold">
                                                <Calendar className="size-5" />
                                                Events ({results.events.length})
                                            </h2>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {results.events.map((event) => (
                                                    <div key={event.id} className="rounded-lg border p-4">
                                                        <h3 className="mb-2 font-semibold">{event.title}</h3>
                                                        {event.description && <p className="mb-2 text-sm text-muted-foreground">{event.description}</p>}
                                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                            {event.date && <span>{new Date(event.date).toLocaleDateString()}</span>}
                                                            {event.venue && <span>• {event.venue}</span>}
                                                            {event.location && <span>• {event.location}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Businesses */}
                                    {results.businesses.length > 0 && (
                                        <div>
                                            <h2 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-2xl font-bold">
                                                <Building className="size-5" />
                                                Businesses ({results.businesses.length})
                                            </h2>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {results.businesses.map((business) => (
                                                    <div key={business.id} className="rounded-lg border p-4">
                                                        <h3 className="mb-2 font-semibold">{business.title}</h3>
                                                        {business.description && <p className="mb-2 text-sm text-muted-foreground">{business.description}</p>}
                                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                            {business.address && <span>{business.address}</span>}
                                                            {business.rating && <span>• Rating: {business.rating}/5</span>}
                                                            {business.review_count && <span>• {business.review_count} reviews</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {results.tags.length > 0 && (
                                        <div>
                                            <h2 className="mb-4 flex items-center gap-2 border-b pb-2 font-serif text-2xl font-bold">
                                                <Hash className="size-5" />
                                                Tags ({results.tags.length})
                                            </h2>
                                            <div className="flex flex-wrap gap-2">
                                                {results.tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="outline"
                                                        className="cursor-pointer px-4 py-2 text-base hover:bg-primary/10"
                                                        onClick={() => router.visit(`/tag/${tag.slug}`)}
                                                    >
                                                        {tag.title}
                                                        {tag.article_count && <span className="ml-2 text-xs">({tag.article_count})</span>}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
                            <h3 className="mb-2 text-xl font-semibold">Start your search</h3>
                            <p className="mb-6 text-muted-foreground">Search for articles, events, businesses, and more.</p>
                            {trendingSearches.length > 0 && (
                                <div>
                                    <p className="mb-2 text-sm font-medium text-muted-foreground">Trending Searches:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {trendingSearches.map((trending, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSuggestionClick(trending)}
                                            >
                                                {trending}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}

