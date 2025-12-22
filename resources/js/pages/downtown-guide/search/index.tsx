import { Head, Link } from "@inertiajs/react";
import { SearchIcon, StoreIcon, CalendarIcon, NewspaperIcon, TagIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { router } from "@inertiajs/react";
import { BusinessList } from "@/components/shared/business/BusinessList";
import { EventList } from "@/components/shared/events/EventList";
import { NewsList } from "@/components/shared/news/NewsList";

interface DowntownGuideSearchIndexProps {
    query: string;
    results: {
        businesses?: Array<{
            id: string;
            name: string;
            description?: string;
            image?: string;
            rating?: number;
            reviews_count?: number;
            slug?: string;
        }>;
        events?: Array<{
            id: string;
            title: string;
            event_date?: string;
            slug?: string;
        }>;
        articles?: Array<{
            id: string;
            title: string;
            excerpt?: string;
            published_at?: string;
            slug?: string;
        }>;
        coupons?: Array<{
            id: string;
            title: string;
            discount_type: string;
            slug?: string;
        }>;
    };
    suggestions?: Array<string>;
    filters: {
        category?: string;
        region_id?: number;
    };
    type: string;
}

export default function DowntownGuideSearchIndex({
    query,
    results,
    suggestions = [],
    filters,
    type,
}: DowntownGuideSearchIndexProps) {
    const [searchQuery, setSearchQuery] = useState(query);

    const handleSearch = () => {
        router.get(
            route("downtown-guide.search.index"),
            { q: searchQuery, type, ...filters },
            { preserveState: true }
        );
    };

    const totalResults =
        (results.businesses?.length || 0) +
        (results.events?.length || 0) +
        (results.articles?.length || 0) +
        (results.coupons?.length || 0);

    return (
        <>
            <Head title={`Search${query ? `: ${query}` : ""} - DowntownsGuide`} />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h1 className="text-2xl font-bold text-white">Search</h1>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Search Bar */}
                    <div className="mb-6 rounded-xl border-2 border-purple-200 bg-white p-6 shadow-lg">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search businesses, events, articles, coupons..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-10 text-lg"
                                />
                            </div>
                            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                                Search
                            </Button>
                        </div>

                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-sm text-gray-600">Suggestions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setSearchQuery(suggestion);
                                                router.get(
                                                    route("downtown-guide.search.index"),
                                                    { q: suggestion, type, ...filters }
                                                );
                                            }}
                                            className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 hover:bg-purple-200"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    {query ? (
                        <>
                            {totalResults > 0 ? (
                                <div className="space-y-8">
                                    {/* Results Summary */}
                                    <div className="text-sm text-gray-600">
                                        Found {totalResults} result{totalResults === 1 ? "" : "s"} for "{query}"
                                    </div>

                                    {/* Businesses */}
                                    {results.businesses && results.businesses.length > 0 && (
                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <StoreIcon className="h-5 w-5 text-purple-600" />
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    Businesses ({results.businesses.length})
                                                </h2>
                                            </div>
                                            <BusinessList
                                                businesses={results.businesses}
                                                theme="downtownsguide"
                                                gridCols={3}
                                            />
                                        </section>
                                    )}

                                    {/* Events */}
                                    {results.events && results.events.length > 0 && (
                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <CalendarIcon className="h-5 w-5 text-purple-600" />
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    Events ({results.events.length})
                                                </h2>
                                            </div>
                                            <EventList
                                                events={results.events}
                                                theme="downtownsguide"
                                                gridCols={3}
                                            />
                                        </section>
                                    )}

                                    {/* Articles */}
                                    {results.articles && results.articles.length > 0 && (
                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <NewspaperIcon className="h-5 w-5 text-purple-600" />
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    Articles ({results.articles.length})
                                                </h2>
                                            </div>
                                            <NewsList
                                                articles={results.articles}
                                                theme="downtownsguide"
                                                gridCols={3}
                                            />
                                        </section>
                                    )}

                                    {/* Coupons */}
                                    {results.coupons && results.coupons.length > 0 && (
                                        <section>
                                            <div className="mb-4 flex items-center gap-2">
                                                <TagIcon className="h-5 w-5 text-purple-600" />
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    Coupons ({results.coupons.length})
                                                </h2>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {results.coupons.map((coupon) => (
                                                    <Link
                                                        key={coupon.id}
                                                        href={route("downtown-guide.coupons.show", coupon.slug)}
                                                        className="rounded-xl border-2 border-purple-200 bg-white p-4 shadow-lg hover:border-purple-400"
                                                    >
                                                        <h3 className="font-bold text-gray-900">{coupon.title}</h3>
                                                    </Link>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-xl border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-12 text-center">
                                    <SearchIcon className="mx-auto h-12 w-12 text-purple-400" />
                                    <p className="mt-4 text-lg font-bold text-gray-900">No results found</p>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Try different keywords or browse our categories
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-12 text-center">
                            <SearchIcon className="mx-auto h-12 w-12 text-purple-400" />
                            <p className="mt-4 text-lg font-bold text-gray-900">Start your search</p>
                            <p className="mt-2 text-sm text-gray-600">
                                Enter keywords to search businesses, events, articles, and coupons
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

