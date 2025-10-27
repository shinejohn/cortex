import { Footer } from "@/components/common/footer";
import { GridCard } from "@/components/common/grid-card";
import Header from "@/components/common/header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Auth } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { AlertCircle, ArrowUpDown, CreditCard, Edit, Package, Plus, Search, ShoppingCart, Store as StoreIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    is_in_stock: boolean;
    discount_percentage: number | null;
}

interface Store {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
    is_owner: boolean;
    stripe_connect_id: string | null;
    can_accept_payments: boolean | null;
}

interface PaginatedProducts {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface StoreShowProps {
    auth: Auth;
    store: Store;
    products: PaginatedProducts;
    filters: {
        search?: string;
        sort?: string;
    };
}

export default function StoreShow({ auth, store, products, filters }: StoreShowProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route("stores.show", store.slug),
            { search: searchQuery, sort: filters.sort },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleSort = (sortValue: string) => {
        router.get(
            route("stores.show", store.slug),
            { search: searchQuery, sort: sortValue },
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

    const renderProductContent = (product: Product) => (
        <>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description || "No description available"}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                        <>
                            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
                            {product.discount_percentage && (
                                <Badge variant="destructive" className="text-xs">
                                    {product.discount_percentage}% OFF
                                </Badge>
                            )}
                        </>
                    )}
                </div>
                {!product.is_in_stock && <Badge variant="secondary">Out of Stock</Badge>}
            </div>
        </>
    );

    const renderProductActions = (product: Product) => (
        <>
            {store.is_owner ? (
                <Link href={route("products.edit", { store: store.id, product: product.id })}>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary p-1 h-8 w-8" title="Edit Product">
                        <Edit className="h-4 w-4" />
                    </Button>
                </Link>
            ) : (
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary p-1 h-8 w-8" title="Add to Cart">
                    <ShoppingCart className="h-4 w-4" />
                </Button>
            )}
        </>
    );

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "price_asc", label: "Price: Low to High" },
        { value: "price_desc", label: "Price: High to Low" },
    ];

    const currentSortLabel = sortOptions.find((opt) => opt.value === filters.sort)?.label || "Sort By";

    return (
        <>
            <Head title={store.name} />

            <Header auth={auth} />

            {/* Stripe Connect Banner */}
            {store.is_owner && !store.can_accept_payments && (
                <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
                        <Alert variant="default" className="bg-transparent border-0">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <AlertTitle className="text-amber-900 dark:text-amber-100">Complete Stripe Connect Setup</AlertTitle>
                            <AlertDescription className="text-amber-800 dark:text-amber-200">
                                <p className="mb-3">You need to complete your Stripe Connect onboarding to start accepting payments.</p>
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    <a href={route("stores.connect-stripe", store.id)} target="_blank" rel="noopener noreferrer">
                                        {store.stripe_connect_id ? "Continue Setup" : "Start Stripe Setup"}
                                    </a>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            )}

            {/* Store Banner */}
            <div className="relative h-64 bg-muted">
                {store.banner ? (
                    <img src={`/storage/${store.banner}`} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <StoreIcon className="h-24 w-24 text-muted-foreground" />
                    </div>
                )}

                {/* Logo Overlay */}
                {store.logo && (
                    <div className="absolute -bottom-16 left-8 w-32 h-32 rounded-full bg-background border-4 border-background overflow-hidden shadow-lg">
                        <img src={`/storage/${store.logo}`} alt={store.name} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Store Header */}
            <div className="py-8 border-b bg-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className={cn("flex items-start justify-between", store.logo && "mt-12")}>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-foreground mb-2">{store.name}</h1>
                            <p className="text-muted-foreground max-w-3xl">{store.description || "Welcome to our store!"}</p>
                        </div>

                        {/* Owner Actions */}
                        {store.is_owner && (
                            <div className="flex items-center gap-2">
                                <Link href={route("products.create", store.id)}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Product
                                    </Button>
                                </Link>
                                <Link href={route("stores.edit", store.id)}>
                                    <Button variant="outline">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Store
                                    </Button>
                                </Link>
                                <Link href={route("stores.stripe-dashboard", store.id)}>
                                    <Button variant="outline">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Stripe Dashboard
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="py-6 border-b bg-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-24"
                                />
                                <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">
                                    Search
                                </Button>
                            </div>
                        </form>

                        {/* Sort Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="min-w-[160px]">
                                    <ArrowUpDown className="h-4 w-4 mr-2" />
                                    {currentSortLabel}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Sort Products</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {sortOptions.map((option) => (
                                    <DropdownMenuItem key={option.value} onClick={() => handleSort(option.value)}>
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    {products.data.length > 0 ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-sm text-muted-foreground">
                                    {products.total} {products.total === 1 ? "product" : "products"}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                {products.data.map((product) => (
                                    <GridCard
                                        key={product.id}
                                        id={product.id}
                                        href={route("products.show", { store: store.id, product: product.id })}
                                        image={product.images?.[0] ? `/storage/${product.images[0]}` : "/placeholder-product.jpg"}
                                        imageAlt={product.name}
                                        title={product.name}
                                        actions={renderProductActions(product)}
                                    >
                                        {renderProductContent(product)}
                                    </GridCard>
                                ))}
                            </div>

                            {/* Pagination */}
                            {products.last_page > 1 && (
                                <div className="flex justify-center gap-2">
                                    {products.links.map((link, index) => (
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
                            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {filters.search ? "No products found" : "No products yet"}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {filters.search
                                    ? "Try adjusting your search criteria"
                                    : store.is_owner
                                      ? "Start by adding your first product"
                                      : "Check back soon for new products!"}
                            </p>
                            {store.is_owner && !filters.search && (
                                <Link href={route("products.create", store.id)}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Your First Product
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
