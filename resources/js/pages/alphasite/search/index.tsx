import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "@/layouts/layout";
import { useState } from "react";

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

            <div className="min-h-screen bg-muted/50">
                {/* Search Bar */}
                <div className="bg-card border-b border sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    value={data.q}
                                    onChange={(e) => setData("q", e.target.value)}
                                    placeholder="Search businesses, industries, communities..."
                                    className="flex-1 border border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary">
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Results */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {query && <h2 className="text-2xl font-bold mb-6">Search results for "{query}"</h2>}

                    {results && (
                        <div className="space-y-8">
                            {/* Businesses */}
                            {results.businesses && results.businesses.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Businesses</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.businesses.map((business) => (
                                            <Link
                                                key={business.id}
                                                href={`/business/${business.slug}`}
                                                className="bg-card rounded-lg shadow p-4 hover:shadow-lg transition"
                                            >
                                                <h4 className="font-semibold mb-1">{business.name}</h4>
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
                                    <h3 className="text-xl font-semibold mb-4">Industries</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {results.industries.map((industry) => (
                                            <Link
                                                key={industry.id}
                                                href={`/industry/${industry.slug}`}
                                                className="bg-card rounded-lg shadow p-4 hover:shadow-lg transition text-center"
                                            >
                                                {industry.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Communities */}
                            {results.communities && results.communities.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Communities</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.communities.map((community) => (
                                            <Link
                                                key={community.id}
                                                href={`/community/${community.slug}`}
                                                className="bg-card rounded-lg shadow p-4 hover:shadow-lg transition"
                                            >
                                                <h4 className="font-semibold">{community.name}</h4>
                                                <p className="text-sm text-muted-foreground">
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
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground text-lg">No results found for "{query}"</p>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Suggestions */}
                    {suggestions && suggestions.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Search Suggestions</h3>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setData("q", suggestion);
                                            get("/search", { preserveState: true });
                                        }}
                                        className="px-4 py-2 bg-muted text-foreground rounded-full hover:bg-muted"
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
