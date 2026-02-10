import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Building, Calendar, Clock, FileText, Filter, Hash, Search, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

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
    const {
        auth,
        query: initialQuery,
        filter,
        sort,
        timeFilter,
        results,
        totalResults,
        trendingSearches,
        suggestions: initialSuggestions,
    } = usePage<SearchPageProps>().props;
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, _setSuggestions] = useState<string[]>(initialSuggestions);

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

    const _allResults = [
        ...results.articles.map((r) => ({ ...r, type: "article" as const })),
        ...results.events.map((r) => ({ ...r, type: "event" as const })),
        ...results.businesses.map((r) => ({ ...r, type: "business" as const })),
        ...results.tags.map((r) => ({ ...r, type: "tag" as const })),
    ];

    const filterOptions = [
        { value: "all", label: "All" },
        { value: "articles", label: "Articles" },
        { value: "events", label: "Events" },
        { value: "businesses", label: "Businesses" },
        { value: "tags", label: "Tags" },
    ];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
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

                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Persistent Search Bar */}
                    <div className="sticky top-0 z-10 mb-6 overflow-hidden rounded-lg border-none bg-white p-4 shadow-md">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        searchForm.setData("q", e.target.value);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="Search for anything in your community..."
                                    className="h-14 rounded-full border border-gray-300 pl-12 pr-12 text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            searchForm.setData("q", "");
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="size-5" />
                                    </button>
                                )}
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && (suggestions.length > 0 || trendingSearches.length > 0) && (
                                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {suggestions.length > 0 && (
                                        <div className="p-2">
                                            <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
                                                Suggestions
                                            </div>
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="flex w-full items-center rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Search className="mr-2 inline size-4 text-gray-400" />
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {trendingSearches.length > 0 && (
                                        <div className="border-t border-gray-100 p-2">
                                            <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase text-gray-500">
                                                <TrendingUp className="size-3" />
                                                Trending Searches
                                            </div>
                                            <div className="flex flex-wrap gap-2 px-3 pb-2">
                                                {trendingSearches.map((trending, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleSuggestionClick(trending)}
                                                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                                                    >
                                                        {trending}
                                                    </button>
                                                ))}
                                            </div>
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
                                <Filter className="size-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Filter:</span>
                                <div className="flex gap-2">
                                    {filterOptions.map((f) => (
                                        <button
                                            key={f.value}
                                            onClick={() => handleFilterChange(f.value)}
                                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                                filter === f.value
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Sort:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="date">Most Recent</option>
                                    <option value="popularity">Most Popular</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-gray-500" />
                                <select
                                    value={timeFilter}
                                    onChange={(e) => handleTimeFilterChange(e.target.value)}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                            {/* Results Summary */}
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    <span className="text-indigo-600">{totalResults}</span>{" "}
                                    {totalResults === 1 ? "result" : "results"} for &ldquo;{searchQuery}&rdquo;
                                </h2>
                            </div>

                            {totalResults === 0 ? (
                                <div className="overflow-hidden rounded-lg border-none bg-white py-12 text-center shadow-sm">
                                    <Search className="mx-auto mb-4 size-12 text-gray-400" />
                                    <h3 className="mb-2 text-xl font-bold text-gray-700">No results found</h3>
                                    <p className="mx-auto max-w-md text-gray-500">
                                        We couldn&apos;t find any matches for &ldquo;{searchQuery}&rdquo;. Try different
                                        keywords or filters.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Articles */}
                                    {results.articles.length > 0 && (
                                        <div>
                                            <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 font-display text-xl font-black tracking-tight text-gray-900">
                                                <FileText className="size-5 text-indigo-600" />
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
                                                            regions:
                                                                article.regions?.map((r) => ({ id: r, name: r })) || [],
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Events */}
                                    {results.events.length > 0 && (
                                        <div>
                                            <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 font-display text-xl font-black tracking-tight text-gray-900">
                                                <Calendar className="size-5 text-indigo-600" />
                                                Events ({results.events.length})
                                            </h2>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {results.events.map((event) => (
                                                    <div
                                                        key={event.id}
                                                        className="group overflow-hidden rounded-lg border-none bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                                    >
                                                        <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-indigo-600">
                                                            {event.title}
                                                        </h3>
                                                        {event.description && (
                                                            <p className="mb-2 text-sm text-gray-500">
                                                                {event.description}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                            {event.date && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="size-3" />
                                                                    {new Date(event.date).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                            {event.venue && <span>* {event.venue}</span>}
                                                            {event.location && <span>* {event.location}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Businesses */}
                                    {results.businesses.length > 0 && (
                                        <div>
                                            <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 font-display text-xl font-black tracking-tight text-gray-900">
                                                <Building className="size-5 text-indigo-600" />
                                                Businesses ({results.businesses.length})
                                            </h2>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {results.businesses.map((business) => (
                                                    <div
                                                        key={business.id}
                                                        className="group overflow-hidden rounded-lg border-none bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                                    >
                                                        <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-indigo-600">
                                                            {business.title}
                                                        </h3>
                                                        {business.description && (
                                                            <p className="mb-2 text-sm text-gray-500">
                                                                {business.description}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                            {business.address && <span>{business.address}</span>}
                                                            {business.rating && (
                                                                <span className="text-indigo-600">
                                                                    * Rating: {business.rating}/5
                                                                </span>
                                                            )}
                                                            {business.review_count && (
                                                                <span>* {business.review_count} reviews</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {results.tags.length > 0 && (
                                        <div>
                                            <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 font-display text-xl font-black tracking-tight text-gray-900">
                                                <Hash className="size-5 text-indigo-600" />
                                                Tags ({results.tags.length})
                                            </h2>
                                            <div className="flex flex-wrap gap-2">
                                                {results.tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="outline"
                                                        className="cursor-pointer border-gray-200 px-4 py-2 text-base text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                                                        onClick={() => router.visit(`/tag/${tag.slug}`)}
                                                    >
                                                        {tag.title}
                                                        {tag.article_count && (
                                                            <span className="ml-2 text-xs text-gray-400">
                                                                ({tag.article_count})
                                                            </span>
                                                        )}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Empty State / Trending */
                        <div className="py-12 text-center">
                            <Search className="mx-auto mb-4 size-12 text-gray-400" />
                            <h3 className="mb-2 font-display text-xl font-black tracking-tight text-gray-900">
                                Start your search
                            </h3>
                            <p className="mb-6 text-gray-500">
                                Search for articles, events, businesses, and more.
                            </p>
                            {trendingSearches.length > 0 && (
                                <div>
                                    <p className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
                                        <TrendingUp className="size-4 text-indigo-600" />
                                        Trending Searches
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {trendingSearches.map((trending, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(trending)}
                                                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                                            >
                                                {trending}
                                            </button>
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
