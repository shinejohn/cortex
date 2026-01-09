import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { DollarSign, MapPin, Plus, Search } from "lucide-react";

interface ClassifiedImage {
    id: number;
    image_path: string;
    image_url: string;
    order: number;
}

interface Classified {
    id: string;
    category: string;
    subcategory: string | null;
    title: string;
    description: string;
    price: number | null;
    price_type: string;
    condition: string | null;
    location: string;
    is_featured: boolean;
    posted_at: string;
    views_count: number;
    images: ClassifiedImage[];
    user: {
        id: string;
        name: string;
    };
    regions: Array<{
        id: string;
        name: string;
    }>;
}

interface ClassifiedsPageProps {
    auth?: Auth;
    classifieds: {
        data: Classified[];
        links: any;
        meta: any;
    };
    filters: {
        category: string;
        subcategory: string;
        search: string;
    };
}

export default function ClassifiedsIndex() {
    const { auth, classifieds, filters } = usePage<ClassifiedsPageProps>().props;

    const searchForm = useForm({
        search: filters.search || "",
        category: filters.category || "all",
        subcategory: filters.subcategory || "all",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/classifieds", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const categories = [
        { value: "all", label: "All" },
        { value: "for_sale", label: "For Sale" },
        { value: "housing", label: "Housing" },
        { value: "jobs", label: "Jobs" },
        { value: "services", label: "Services" },
        { value: "community", label: "Community" },
        { value: "personals", label: "Personals" },
    ];

    const formatPrice = (price: number | null, priceType: string) => {
        if (!price && priceType === "contact_for_pricing") return "Contact for pricing";
        if (!price) return "Free";
        return `$${price.toLocaleString()}`;
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Classifieds - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Classifieds - Day News",
                        description: "Buy, sell, and find local services",
                        url: "/classifieds",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold">Classifieds</h1>
                            <p className="mt-2 text-muted-foreground">Buy, sell, and find local services</p>
                        </div>
                        {auth && (
                            <Button onClick={() => router.visit("/classifieds/create")}>
                                <Plus className="mr-2 size-4" />
                                Post Listing
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="mb-4 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search classifieds..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing}>
                                Search
                            </Button>
                        </form>

                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <Button
                                    key={cat.value}
                                    variant={searchForm.data.category === cat.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        searchForm.setData("category", cat.value);
                                        searchForm.get("/classifieds", {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    {cat.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Classifieds Grid */}
                    {classifieds.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">No classifieds found.</p>
                            {auth && (
                                <Button className="mt-4" onClick={() => router.visit("/classifieds/create")}>
                                    Post First Listing
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {classifieds.data.map((classified) => (
                                <div
                                    key={classified.id}
                                    className="cursor-pointer rounded-lg border bg-card transition-shadow hover:shadow-md"
                                    onClick={() => router.visit(`/classifieds/${classified.id}`)}
                                >
                                    {classified.images.length > 0 && (
                                        <img
                                            src={classified.images[0].image_url}
                                            alt={classified.title}
                                            className="h-48 w-full rounded-t-lg object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        {classified.is_featured && (
                                            <Badge className="mb-2" variant="destructive">
                                                Featured
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="mb-2 capitalize">
                                            {classified.category.replace("_", " ")}
                                        </Badge>
                                        <h3 className="mb-2 text-xl font-semibold">{classified.title}</h3>
                                        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{classified.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-lg font-bold text-primary">
                                                <DollarSign className="size-4" />
                                                {formatPrice(classified.price, classified.price_type)}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="size-3" />
                                                {classified.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {classifieds.links && classifieds.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {classifieds.links.map((link: any, index: number) => (
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
