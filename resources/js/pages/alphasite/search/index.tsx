import { Head, Link, useForm } from "@inertiajs/react";
import { Search, Building2, Layers, Globe, SearchX } from "lucide-react";
import { useState } from "react";
import Layout from "@/layouts/layout";

interface Props {
    query?: string;
    results?: {
        businesses?: Array<{
            id: string;
            name: string;
            slug: string;
            address?: string;
            city?: string;
            state?: string;
        }>;
        industries?: Array<{
            id: string;
            name: string;
            slug: string;
        }>;
        communities?: Array<{
            id: string;
            name: string;
            slug: string;
            city: string;
            state: string;
        }>;
    };
    suggestions?: string[];
}

export default function SearchIndex({ query, results, suggestions }: Props) {
    const { data, setData, get } = useForm({
        q: query || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get("/search", {
            preserveState: true,
        });
    };

    return (
        <Layout>
            <Head>
                <title>Search - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Search Bar */}
                <div className="bg-card border-b sticky top-0 z-10 shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                            <div className="relative flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={data.q}
                                        onChange={(e) => setData("q", e.target.value)}
                                        placeholder="Search businesses, industries, communities..."
                                        className="w-full border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Results */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {query && (
                        <h2 className="font-display text-2xl font-black tracking-tight mb-8">
                            Search results for "<span className="text-primary">{query}</span>"
                        </h2>
                    )}

                    {results && (
                        <div className="space-y-10">
                            {/* Businesses */}
                            {results.businesses && results.businesses.length > 0 && (
                                <div>
                                    <h3 className="font-display text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        Businesses
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.businesses.map((business) => (
                                            <Link
                                                key={business.id}
                                                href={`/business/${business.slug}`}
                                                className="group bg-card rounded-2xl border-none shadow-sm p-5 hover:shadow-md transition-all"
                                            >
                                                <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{business.name}</h4>
                                                {business.address && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {business.city}, {business.state}
                                                    </p>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Industries */}
                            {results.industries && results.industries.length > 0 && (
                                <div>
                                    <h3 className="font-display text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-primary" />
                                        Industries
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {results.industries.map((industry) => (
                                            <Link
                                                key={industry.id}
                                                href={`/industry/${industry.slug}`}
                                                className="group bg-card rounded-2xl border-none shadow-sm p-5 hover:shadow-md transition-all text-center"
                                            >
                                                <span className="font-medium group-hover:text-primary transition-colors">{industry.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Communities */}
                            {results.communities && results.communities.length > 0 && (
                                <div>
                                    <h3 className="font-display text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-primary" />
                                        Communities
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.communities.map((community) => (
                                            <Link
                                                key={community.id}
                                                href={`/community/${community.slug}`}
                                                className="group bg-card rounded-2xl border-none shadow-sm p-5 hover:shadow-md transition-all"
                                            >
                                                <h4 className="font-semibold group-hover:text-primary transition-colors">{community.name}</h4>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {community.city}, {community.state}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No Results */}
                            {(!results.businesses || results.businesses.length === 0) &&
                                (!results.industries || results.industries.length === 0) &&
                                (!results.communities || results.communities.length === 0) && (
                                    <div className="text-center py-16">
                                        <SearchX className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
                                        <p className="text-muted-foreground text-lg font-medium">No results found for "{query}"</p>
                                        <p className="text-muted-foreground text-sm mt-1">Try adjusting your search terms</p>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Suggestions */}
                    {suggestions && suggestions.length > 0 && (
                        <div className="mt-10">
                            <h3 className="font-display text-lg font-bold tracking-tight mb-4">Search Suggestions</h3>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setData("q", suggestion);
                                            get("/search", { preserveState: true });
                                        }}
                                        className="px-4 py-2 bg-card text-foreground rounded-full border hover:border-primary/30 hover:shadow-sm text-sm font-medium transition-all"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
