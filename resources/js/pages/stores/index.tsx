import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Auth } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { Package, Search, Store as StoreIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[] | null;
}

interface Store {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
    products_count: number;
    products: Product[];
}

interface PaginatedStores {
    data: Store[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface StoresIndexProps {
    auth: Auth;
    stores: PaginatedStores;
    filters: {
        search?: string;
    };
}

export default function StoresIndex({ auth, stores, filters }: StoresIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route("stores.index"),
            { search: searchQuery },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    return (
        <>
            <Head title="Browse Stores" />

            <Header auth={auth} />

            {/* Page Header */}
            <div className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <StoreIcon className="h-8 w-8 text-primary" />
                            <h1 className="text-4xl font-bold text-foreground">Browse Stores</h1>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Discover amazing stores from our community of approved sellers
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="py-6 border-b bg-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search stores..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-24"
                            />
                            <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">
                                Search
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Stores Grid */}
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    {stores.data.length > 0 ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-sm text-muted-foreground">
                                    Showing {stores.data.length} of {stores.total} stores
                                </p>
                                {auth.user && (
                                    <Link href={route("stores.create")}>
                                        <Button>
                                            <StoreIcon className="h-4 w-4 mr-2" />
                                            Create Store
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {stores.data.map((store) => (
                                    <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <Link href={route("stores.show", store.slug)}>
                                            {/* Store Banner/Logo */}
                                            <div className="relative h-48 bg-muted">
                                                {store.banner ? (
                                                    <img
                                                        src={`/storage/${store.banner}`}
                                                        alt={store.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <StoreIcon className="h-16 w-16 text-muted-foreground" />
                                                    </div>
                                                )}
                                                {store.logo && (
                                                    <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-full bg-background border-4 border-background overflow-hidden">
                                                        <img
                                                            src={`/storage/${store.logo}`}
                                                            alt={store.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <CardHeader className={cn("space-y-2", store.logo && "pt-10")}>
                                                <CardTitle className="line-clamp-1">{store.name}</CardTitle>
                                                <CardDescription className="line-clamp-2">{store.description || "No description available"}</CardDescription>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {store.products_count} {store.products_count === 1 ? "product" : "products"}
                                                    </span>
                                                </div>

                                                {/* Product Preview */}
                                                {store.products.length > 0 && (
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {store.products.slice(0, 4).map((product) => (
                                                            <div
                                                                key={product.id}
                                                                className="aspect-square rounded-md bg-muted overflow-hidden"
                                                            >
                                                                {product.images?.[0] ? (
                                                                    <img
                                                                        src={`/storage/${product.images[0]}`}
                                                                        alt={product.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>

                                            <CardFooter>
                                                <Button variant="outline" className="w-full">
                                                    View Store
                                                </Button>
                                            </CardFooter>
                                        </Link>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {stores.last_page > 1 && (
                                <div className="flex justify-center gap-2">
                                    {stores.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url);
                                                }
                                            }}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <StoreIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {filters.search ? "No stores found" : "No stores available yet"}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {filters.search
                                    ? "Try adjusting your search criteria"
                                    : "Check back soon for amazing stores from our sellers!"}
                            </p>
                            {auth.user && !filters.search && (
                                <Link href={route("stores.create")}>
                                    <Button>
                                        <StoreIcon className="h-4 w-4 mr-2" />
                                        Create Your Store
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
