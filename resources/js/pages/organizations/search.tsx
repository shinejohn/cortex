import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    Building2,
    Calendar,
    FileText,
    Filter,
    Megaphone,
    Newspaper,
    Search,
    Tag,
    X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ContentCount {
    articles: number;
    events: number;
    coupons: number;
    announcements: number;
}

interface OrganizationResult {
    id: string;
    name: string;
    organization_type: string | null;
    organization_level: string | null;
    organization_category: string | null;
    content_count: ContentCount;
}

interface SearchPageProps {
    organizations: OrganizationResult[];
    query: string;
}

export default function OrganizationSearch() {
    const { organizations, query } = usePage<SearchPageProps>().props;
    const [showFilters, setShowFilters] = useState(false);

    const searchForm = useForm({
        q: query || "",
        type: "",
        level: "",
        category: "",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchForm.data.q.length < 2) return;
        searchForm.get(route("organizations.search") as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        searchForm.setData({
            q: searchForm.data.q,
            type: "",
            level: "",
            category: "",
        });
    };

    const hasActiveFilters = searchForm.data.type || searchForm.data.level || searchForm.data.category;

    const totalContentCount = (counts: ContentCount) =>
        counts.articles + counts.events + counts.coupons + counts.announcements;

    return (
        <div className="min-h-screen bg-zinc-50">
            <Head title="Search Organizations" />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-2 text-primary">
                        <Building2 className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            Directory
                        </span>
                    </div>
                    <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
                        Search Organizations
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Find organizations, agencies, and community groups
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8 overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                value={searchForm.data.q}
                                onChange={(e) => searchForm.setData("q", e.target.value)}
                                placeholder="Search organizations by name..."
                                className="h-12 border-none bg-zinc-50 pl-12 ring-1 ring-zinc-200 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "h-12 gap-2 rounded-xl font-bold",
                                hasActiveFilters && "border-primary text-primary"
                            )}
                        >
                            <Filter className="size-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                                    !
                                </span>
                            )}
                        </Button>
                        <Button
                            type="submit"
                            disabled={searchForm.processing || searchForm.data.q.length < 2}
                            className="h-12 px-6 rounded-xl font-bold"
                        >
                            {searchForm.processing ? "Searching..." : "Search"}
                        </Button>
                    </form>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Filters
                                </span>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-3" />
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                                        Type
                                    </label>
                                    <select
                                        value={searchForm.data.type}
                                        onChange={(e) => searchForm.setData("type", e.target.value)}
                                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                                    >
                                        <option value="">All types</option>
                                        <option value="government">Government</option>
                                        <option value="nonprofit">Nonprofit</option>
                                        <option value="business">Business</option>
                                        <option value="educational">Educational</option>
                                        <option value="religious">Religious</option>
                                        <option value="community">Community</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                                        Level
                                    </label>
                                    <select
                                        value={searchForm.data.level}
                                        onChange={(e) => searchForm.setData("level", e.target.value)}
                                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                                    >
                                        <option value="">All levels</option>
                                        <option value="local">Local</option>
                                        <option value="regional">Regional</option>
                                        <option value="state">State</option>
                                        <option value="national">National</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                                        Category
                                    </label>
                                    <select
                                        value={searchForm.data.category}
                                        onChange={(e) => searchForm.setData("category", e.target.value)}
                                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm"
                                    >
                                        <option value="">All categories</option>
                                        <option value="health">Health</option>
                                        <option value="education">Education</option>
                                        <option value="public_safety">Public Safety</option>
                                        <option value="social_services">Social Services</option>
                                        <option value="arts_culture">Arts & Culture</option>
                                        <option value="environment">Environment</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                {query && (
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {organizations.length === 0
                                ? `No results for "${query}"`
                                : `${organizations.length} result${organizations.length !== 1 ? "s" : ""} for "${query}"`}
                        </p>
                    </div>
                )}

                {organizations.length === 0 && query ? (
                    <div className="rounded-xl border-2 border-dashed p-16 text-center">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                            <Search className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 font-display text-lg font-black">
                            No organizations found
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Try a different search term or adjust your filters.
                        </p>
                    </div>
                ) : organizations.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {organizations.map((org) => (
                            <div
                                key={org.id}
                                className="group overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm transition-all hover:shadow-md cursor-pointer"
                                onClick={() =>
                                    router.visit(route("organizations.content", org.id) as any)
                                }
                            >
                                <div className="mb-4 flex items-start gap-3">
                                    <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Building2 className="size-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-display text-lg font-black tracking-tight group-hover:text-primary transition-colors truncate">
                                            {org.name}
                                        </h3>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {org.organization_type && (
                                                <Badge variant="outline" className="text-[9px] font-bold capitalize">
                                                    {org.organization_type}
                                                </Badge>
                                            )}
                                            {org.organization_level && (
                                                <Badge variant="secondary" className="text-[9px] font-bold capitalize">
                                                    {org.organization_level}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content counts */}
                                {totalContentCount(org.content_count) > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {org.content_count.articles > 0 && (
                                            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3 py-2 text-xs">
                                                <Newspaper className="size-3.5 text-blue-500" />
                                                <span className="font-semibold">{org.content_count.articles}</span>
                                                <span className="text-muted-foreground">articles</span>
                                            </div>
                                        )}
                                        {org.content_count.events > 0 && (
                                            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3 py-2 text-xs">
                                                <Calendar className="size-3.5 text-green-500" />
                                                <span className="font-semibold">{org.content_count.events}</span>
                                                <span className="text-muted-foreground">events</span>
                                            </div>
                                        )}
                                        {org.content_count.announcements > 0 && (
                                            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3 py-2 text-xs">
                                                <Megaphone className="size-3.5 text-orange-500" />
                                                <span className="font-semibold">{org.content_count.announcements}</span>
                                                <span className="text-muted-foreground">notices</span>
                                            </div>
                                        )}
                                        {org.content_count.coupons > 0 && (
                                            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3 py-2 text-xs">
                                                <Tag className="size-3.5 text-purple-500" />
                                                <span className="font-semibold">{org.content_count.coupons}</span>
                                                <span className="text-muted-foreground">coupons</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {totalContentCount(org.content_count) === 0 && (
                                    <p className="text-xs text-muted-foreground">No published content yet</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : !query ? (
                    <div className="rounded-xl border-2 border-dashed p-16 text-center">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                            <Building2 className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 font-display text-lg font-black">
                            Search for organizations
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter a name or keyword to find organizations in your community.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
