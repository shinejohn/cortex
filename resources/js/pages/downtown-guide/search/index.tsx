import { Head, Link, router } from "@inertiajs/react";
import { CalendarIcon, ChevronLeft, MapPin, NewspaperIcon, Search, StoreIcon, TagIcon, Ticket } from "lucide-react";
import { useState } from "react";
import { BusinessList } from "@/components/shared/business/BusinessList";
import { EventList } from "@/components/shared/events/EventList";
import { NewsList } from "@/components/shared/news/NewsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function DowntownGuideSearchIndex({ query, results, suggestions = [], filters, type }: DowntownGuideSearchIndexProps) {
    const [searchQuery, setSearchQuery] = useState(query);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get(route("downtown-guide.search.index"), { q: searchQuery, type, ...filters }, { preserveState: true });
    };

    const totalResults =
        (results.businesses?.length || 0) + (results.events?.length || 0) + (results.articles?.length || 0) + (results.coupons?.length || 0);

    return (
        <>
            <Head title={`Search${query ? `: ${query}` : ""} - DowntownsGuide`} />

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6">
                        <Link href={route("downtown-guide.home")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="size-4" />
                            Back to Home
                        </Link>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-display text-3xl font-black tracking-tight">Search</h1>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-8">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search for places, restaurants, coupons..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-12 pl-10 text-lg"
                                    autoFocus
                                />
                            </div>
                            <Button type="submit" size="lg" className="h-12 px-8">
                                Search
                            </Button>
                        </div>
                    </form>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="mb-6">
                            <p className="mb-2 text-sm text-muted-foreground">Suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSearchQuery(suggestion);
                                            router.get(route("downtown-guide.search.index"), { q: suggestion, type, ...filters });
                                        }}
                                        className="rounded-full bg-muted px-3 py-1 text-sm text-foreground transition-colors hover:bg-muted/80"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {query ? (
                        <>
                            {/* Results count */}
                            <p className="mb-4 text-muted-foreground">
                                {totalResults} {totalResults === 1 ? "result" : "results"} for "{query}"
                            </p>

                            {totalResults > 0 ? (
                                <div className="space-y-8">
                                    {/* Businesses */}
                                    {results.businesses && results.businesses.length > 0 && (
                                        <section>
                                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                                                <MapPin className="size-5" />
                                                Places ({results.businesses.length})
                                            </h2>
                                            <BusinessList businesses={results.businesses} theme="downtownsguide" gridCols={3} />
                                        </section>
                                    )}

                                    {/* Events */}
                                    {results.events && results.events.length > 0 && (
                                        <section>
                                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                                                <CalendarIcon className="size-5" />
                                                Events ({results.events.length})
                                            </h2>
                                            <EventList events={results.events} theme="downtownsguide" gridCols={3} />
                                        </section>
                                    )}

                                    {/* Articles */}
                                    {results.articles && results.articles.length > 0 && (
                                        <section>
                                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                                                <NewspaperIcon className="size-5" />
                                                Articles ({results.articles.length})
                                            </h2>
                                            <NewsList articles={results.articles} theme="downtownsguide" gridCols={3} />
                                        </section>
                                    )}

                                    {/* Coupons */}
                                    {results.coupons && results.coupons.length > 0 && (
                                        <section>
                                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                                                <Ticket className="size-5" />
                                                Coupons ({results.coupons.length})
                                            </h2>
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {results.coupons.map((coupon) => (
                                                    <Link
                                                        key={coupon.id}
                                                        href={route("downtown-guide.coupons.show", coupon.slug)}
                                                        className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted"
                                                    >
                                                        <h3 className="font-semibold">{coupon.title}</h3>
                                                    </Link>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            ) : (
                                <div className="flex min-h-[40vh] items-center justify-center">
                                    <div className="text-center">
                                        <Search className="mx-auto mb-4 size-16 text-muted-foreground" />
                                        <h3 className="mb-2 text-xl font-bold">No results found</h3>
                                        <p className="mx-auto max-w-md text-muted-foreground">Try different keywords or browse our categories</p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <div className="text-center">
                                <Search className="mx-auto mb-4 size-16 text-muted-foreground" />
                                <h3 className="mb-2 text-xl font-bold">Start your search</h3>
                                <p className="mx-auto max-w-md text-muted-foreground">
                                    Enter a search term to find places, restaurants, and coupons in your area.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
