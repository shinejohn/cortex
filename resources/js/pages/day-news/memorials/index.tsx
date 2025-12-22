import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Flower, Heart, MapPin, MessageSquare, Plus, Search } from "lucide-react";

interface Memorial {
    id: string;
    name: string;
    years: string;
    date_of_passing: string;
    obituary: string;
    image: string | null;
    location: string | null;
    service_date: string | null;
    service_location: string | null;
    is_featured: boolean;
    views_count: number;
    reactions_count: number;
    comments_count: number;
}

interface MemorialsPageProps {
    auth?: Auth;
    memorials: {
        data: Memorial[];
        links: any;
        meta: any;
    };
    featured: Memorial | null;
    filters: {
        search: string;
        date_filter: string;
    };
}

export default function MemorialsIndex() {
    const { auth, memorials, featured, filters } = usePage<MemorialsPageProps>().props;

    const searchForm = useForm({
        search: filters.search || "",
        date_filter: filters.date_filter || "all",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/memorials", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Memorials - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Memorials - Day News",
                        description: "Remembering our community members",
                        url: "/memorials",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold">Memorials</h1>
                            <p className="mt-2 text-muted-foreground">Remembering our community members</p>
                        </div>
                        {auth && (
                            <Button onClick={() => router.visit("/memorials/create")}>
                                <Plus className="mr-2 size-4" />
                                Create Memorial
                            </Button>
                        )}
                    </div>

                    {/* Featured Memorial */}
                    {featured && (
                        <div className="mb-8 rounded-lg border bg-card p-6">
                            <Badge className="mb-2">Featured</Badge>
                            <div className="flex gap-6">
                                {featured.image && (
                                    <img
                                        src={featured.image}
                                        alt={featured.name}
                                        className="h-48 w-48 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <h2 className="mb-2 text-2xl font-bold">{featured.name}</h2>
                                    <p className="mb-2 text-lg text-muted-foreground">{featured.years}</p>
                                    <p className="mb-4 line-clamp-3">{featured.obituary}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {featured.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="size-4" />
                                                {featured.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Heart className="size-4" />
                                            {featured.reactions_count}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="size-4" />
                                            {featured.comments_count}
                                        </div>
                                    </div>
                                    <Button
                                        className="mt-4"
                                        onClick={() => router.visit(`/memorials/${featured.id}`)}
                                    >
                                        View Memorial
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search memorials..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing}>
                                Search
                            </Button>
                        </div>
                    </form>

                    {/* Memorials Grid */}
                    {memorials.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Flower className="mx-auto mb-4 size-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No memorials found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {memorials.data.map((memorial) => (
                                <div
                                    key={memorial.id}
                                    className="cursor-pointer rounded-lg border bg-card transition-shadow hover:shadow-md"
                                    onClick={() => router.visit(`/memorials/${memorial.id}`)}
                                >
                                    {memorial.image && (
                                        <img
                                            src={memorial.image}
                                            alt={memorial.name}
                                            className="h-48 w-full rounded-t-lg object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h3 className="mb-1 text-xl font-semibold">{memorial.name}</h3>
                                        <p className="mb-2 text-muted-foreground">{memorial.years}</p>
                                        <p className="mb-4 line-clamp-3 text-sm">{memorial.obituary}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            {memorial.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="size-3" />
                                                    {memorial.location}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                {new Date(memorial.date_of_passing).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {memorials.links && memorials.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {memorials.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
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

