import { Footer } from "@/components/common/footer";
import { GridCard } from "@/components/common/grid-card";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Auth } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Package, ShoppingBag, ShoppingCart, Store as StoreIcon, TrendingUp } from "lucide-react";
import { route } from "ziggy-js";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    is_active: boolean;
    track_inventory: boolean;
    quantity: number | null;
    store: {
        id: string;
        name: string;
        slug: string;
        logo: string | null;
    };
}

interface DiscoverPageProps {
    auth: Auth;
    featuredProducts: Product[];
    recommendedProducts: Product[];
}

export default function Discover({ auth, featuredProducts = [], recommendedProducts = [] }: DiscoverPageProps) {
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const getDiscountPercentage = (price: number, compareAtPrice: number | null): number | null => {
        if (!compareAtPrice || compareAtPrice <= price) {
            return null;
        }
        return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
    };

    const renderProductContent = (product: Product) => (
        <>
            <div className="flex items-center justify-between mb-2">
                <Link
                    href={route("stores.show", product.store.slug)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <StoreIcon className="h-3 w-3" />
                    {product.store.name}
                </Link>
                {product.track_inventory && product.quantity !== null && product.quantity <= 10 && product.quantity > 0 && (
                    <Badge variant="outline" className="text-xs">
                        Only {product.quantity} left
                    </Badge>
                )}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                        <>
                            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
                            <Badge variant="destructive" className="text-xs">
                                {getDiscountPercentage(product.price, product.compare_at_price)}% OFF
                            </Badge>
                        </>
                    )}
                </div>
                {product.track_inventory && product.quantity === 0 && <Badge variant="secondary">Out of Stock</Badge>}
            </div>
        </>
    );

    const renderProductActions = (product: Product) => (
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary p-1 h-8 w-8" title="Add to Cart">
            <ShoppingCart className="h-4 w-4" />
        </Button>
    );

    return (
        <>
            <Head title="Shop" />

            <Header auth={auth} />

            {/* Hero Section */}
            <div className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <ShoppingBag className="h-8 w-8 text-primary" />
                            <h1 className="text-4xl font-bold text-foreground">Shop</h1>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Discover amazing products from our community of approved sellers
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="py-8 border-b bg-muted/20">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Package className="h-4 w-4 text-primary" />
                                    Featured Products
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{featuredProducts.length}</p>
                                <CardDescription>Handpicked for you</CardDescription>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Recommended
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{recommendedProducts.length}</p>
                                <CardDescription>Based on popularity</CardDescription>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <StoreIcon className="h-4 w-4 text-primary" />
                                    Browse Stores
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link href={route("stores.index")}>
                                    <Button variant="outline" className="w-full">
                                        View All Stores
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
                <div className="py-8 bg-background">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
                                <p className="text-sm text-muted-foreground mt-1">Handpicked products from trusted sellers</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <GridCard
                                    key={product.id}
                                    id={product.id}
                                    href={route("products.show", { store: product.store.slug, product: product.id })}
                                    image={product.images?.[0] ? `/storage/${product.images[0]}` : "/placeholder-product.jpg"}
                                    imageAlt={product.name}
                                    title={product.name}
                                    actions={renderProductActions(product)}
                                >
                                    {renderProductContent(product)}
                                </GridCard>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recommended Products Section */}
            {recommendedProducts.length > 0 && (
                <div className="py-8 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Recommended For You</h2>
                                <p className="text-sm text-muted-foreground mt-1">Products you might like</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {recommendedProducts.map((product) => (
                                <GridCard
                                    key={product.id}
                                    id={product.id}
                                    href={route("products.show", { store: product.store.slug, product: product.id })}
                                    image={product.images?.[0] ? `/storage/${product.images[0]}` : "/placeholder-product.jpg"}
                                    imageAlt={product.name}
                                    title={product.name}
                                    actions={renderProductActions(product)}
                                >
                                    {renderProductContent(product)}
                                </GridCard>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {featuredProducts.length === 0 && recommendedProducts.length === 0 && (
                <div className="py-16">
                    <div className="max-w-2xl mx-auto px-3 sm:px-4 text-center">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Products Available Yet</h3>
                        <p className="text-muted-foreground mb-6">Check back soon for amazing products from our sellers!</p>
                        {auth.user && (
                            <Link href={route("stores.create")}>
                                <Button>
                                    <StoreIcon className="h-4 w-4 mr-2" />
                                    Create Your Store
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
