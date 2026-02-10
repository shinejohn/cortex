import { Link, router, usePage } from "@inertiajs/react";
import { MapPin, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Auth } from "@/types";

interface Hub {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    location: string;
    category: string;
    members_count: number;
    events_count: number;
    is_featured: boolean;
    is_verified: boolean;
}

interface Props {
    auth: Auth;
    hubs: {
        data: Hub[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        category?: string;
        featured?: boolean;
        verified?: boolean;
    };
}

export default function HubsIndex() {
    const { auth, hubs, filters } = usePage<Props>().props;
    const [searchQuery, setSearchQuery] = useState(filters.search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get("/hubs", { search: searchQuery }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Discover Local Communities - GoEventCity",
                    description: "Connect with people who share your interests, join local groups, and never miss what's happening in your area.",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    <div className="max-w-3xl">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">Discover Local Communities</h1>
                        <p className="text-lg text-indigo-100 mb-8">
                            Connect with people who share your interests, join local groups, and never miss what's happening in your area.
                        </p>
                        <form onSubmit={handleSearch} className="bg-card rounded-lg p-2 flex items-center shadow-md">
                            <div className="flex-grow flex items-center">
                                <Search className="h-5 w-5 text-muted-foreground ml-2 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search communities..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full border-none focus:ring-0 text-gray-800 dark:text-gray-200"
                                />
                            </div>
                            <div className="border-l border pl-4 flex items-center">
                                <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                                <span className="text-gray-800 dark:text-gray-200">Clearwater, FL</span>
                            </div>
                            <button type="submit" className="ml-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary transition-colors">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Communities List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Popular Communities</h2>
                    {auth.user && (
                        <Link href="/hubs/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Hub
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {hubs.data.map((hub) => (
                        <Card
                            key={hub.id}
                            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.visit(`/hubs/${hub.slug}`)}
                        >
                            <div className="h-40 bg-muted relative">
                                <img
                                    src={hub.image || "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop"}
                                    alt={hub.name}
                                    className="w-full h-full object-cover"
                                />
                                {hub.is_featured && <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>}
                                {hub.is_verified && <Badge className="absolute top-2 right-2 bg-primary">Verified</Badge>}
                            </div>
                            <CardContent className="p-4">
                                <h3 className="text-lg font-bold text-foreground mb-1">{hub.name}</h3>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{hub.description}</p>
                                {hub.location && (
                                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span>{hub.location}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-border">
                                    <div className="flex items-center text-sm">
                                        <Users className="h-4 w-4 text-indigo-500 mr-1" />
                                        <span>{hub.members_count.toLocaleString()} members</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.visit(`/hubs/${hub.slug}`);
                                        }}
                                    >
                                        View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {hubs.links && hubs.links.length > 3 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            {hubs.links.map((link: any, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-md ${
                                        link.active
                                            ? "bg-primary text-white"
                                            : link.url
                                              ? "bg-card text-foreground hover:bg-muted/50"
                                              : "bg-muted text-muted-foreground cursor-not-allowed"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
