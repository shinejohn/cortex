import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Calendar, Clock, Flower, Heart, MapPin, MessageSquare, Plus, PlusCircle, Search } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

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
            <div className="min-h-screen bg-[#F8F9FB]">
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

                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-primary">
                                <Flower className="size-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tributes</span>
                            </div>
                            <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">In Memoriam</h1>
                            <p className="mt-2 text-lg text-muted-foreground">Remembering our community members</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <form onSubmit={handleSearch} className="relative hidden md:block">
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search memorials..."
                                    className="h-10 w-64 rounded-full border-none bg-white pl-10 pr-4 shadow-sm ring-1 ring-zinc-200"
                                />
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            </form>
                        </div>
                    </div>

                    {/* Create Memorial CTA */}
                    {auth && (
                        <div className="mb-8 flex items-center justify-between overflow-hidden rounded-2xl border-none bg-zinc-100 p-6 shadow-sm">
                            <div>
                                <h2 className="font-display text-xl font-black tracking-tight">Create a Memorial Tribute</h2>
                                <p className="mt-1 text-muted-foreground">Honor and remember your loved ones with a lasting online memorial.</p>
                            </div>
                            <Button onClick={() => router.visit("/memorials/create")} className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20">
                                <PlusCircle className="size-5" />
                                Create Memorial
                            </Button>
                        </div>
                    )}

                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="mb-6 md:hidden">
                        <div className="relative flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search memorials..."
                                    className="h-12 border-none bg-white pl-12 shadow-sm ring-1 ring-zinc-200"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing} className="h-12 font-bold">
                                Search
                            </Button>
                        </div>
                    </form>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Featured Memorial */}
                            {featured && (
                                <div
                                    className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all hover:shadow-md"
                                    onClick={() => router.visit(`/memorials/${featured.id}`)}
                                >
                                    <div className="flex items-center gap-2 border-b border-l-4 border-l-zinc-400 bg-zinc-50 px-5 py-3">
                                        <Flower className="size-5 text-zinc-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Featured Memorial Tribute</span>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex flex-col gap-6 md:flex-row">
                                            {featured.image && (
                                                <div className="w-full md:w-1/3">
                                                    <img src={featured.image} alt={featured.name} className="h-auto w-full rounded-xl object-cover grayscale" />
                                                </div>
                                            )}
                                            <div className={featured.image ? "w-full md:w-2/3" : "w-full"}>
                                                <h2 className="mb-2 font-display text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{featured.name}</h2>
                                                <p className="mb-3 text-lg text-muted-foreground">{featured.years}</p>
                                                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                                                    {featured.location && (
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="size-4" />
                                                            <span>{featured.location}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="size-4" />
                                                        <span>{new Date(featured.date_of_passing).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <p className="mb-4 line-clamp-3 leading-relaxed text-zinc-700">{featured.obituary}</p>
                                                {(featured.service_date || featured.service_location) && (
                                                    <div className="mb-4 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-100">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="size-4 text-muted-foreground" />
                                                            <span className="font-bold">Service:</span>
                                                            <span className="text-muted-foreground">
                                                                {featured.service_date && new Date(featured.service_date).toLocaleDateString()}
                                                                {featured.service_location && ` at ${featured.service_location}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Heart className="size-5" />
                                                        <span className="font-bold">{featured.reactions_count}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <MessageSquare className="size-5" />
                                                        <span className="font-bold">{featured.comments_count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Memorials Grid */}
                            {memorials.data.length === 0 ? (
                                <div className="rounded-3xl border-2 border-dashed p-20 text-center">
                                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                                        <Flower className="size-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="mt-6 font-display text-xl font-black">No memorials found</h3>
                                    <p className="mt-2 text-muted-foreground">Try adjusting your search criteria.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {memorials.data.map((memorial) => (
                                        <div
                                            key={memorial.id}
                                            className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all hover:shadow-md"
                                            onClick={() => router.visit(`/memorials/${memorial.id}`)}
                                        >
                                            <div className="p-5">
                                                <div className="flex gap-5">
                                                    {memorial.image && (
                                                        <img src={memorial.image} alt={memorial.name} className="size-20 flex-shrink-0 rounded-full object-cover grayscale" />
                                                    )}
                                                    <div className="flex-1">
                                                        <h3 className="mb-1 font-display text-xl font-black tracking-tight group-hover:text-primary transition-colors">{memorial.name}</h3>
                                                        <p className="mb-2 text-muted-foreground">{memorial.years}</p>
                                                        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-zinc-600">{memorial.obituary}</p>
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
                                                            <div className="flex items-center gap-1">
                                                                <Heart className="size-3" />
                                                                {memorial.reactions_count}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {memorials.links && memorials.links.length > 3 && (
                                <div className="mt-12 flex justify-center gap-2">
                                    {memorials.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            className={link.active ? "font-bold shadow-lg shadow-primary/20" : ""}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Recent Memorials */}
                            <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm">
                                <h3 className="mb-4 font-display font-black tracking-tight">Recent Memorials</h3>
                                <div className="space-y-3">
                                    {memorials.data.slice(0, 5).map((memorial) => (
                                        <div
                                            key={memorial.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-50"
                                            onClick={() => router.visit(`/memorials/${memorial.id}`)}
                                        >
                                            {memorial.image && (
                                                <img src={memorial.image} alt={memorial.name} className="size-10 rounded-full object-cover grayscale" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-bold">{memorial.name}</p>
                                                <p className="text-xs text-muted-foreground">{memorial.years}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
