import { router, usePage } from "@inertiajs/react";
import { ArrowRight, ShoppingBag, ShoppingCart, Star } from "lucide-react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Auth } from "@/types";

interface Product {
    id: string;
    name: string;
    image: string;
    price: number;
    rating: number;
    reviews_count: number;
    category: string;
    featured: boolean;
}

interface Props {
    auth: Auth;
    products: Product[];
    categories: string[];
}

export default function Gear() {
    const { auth, products, categories } = usePage<Props>().props;
    const featuredProducts = products.filter((p) => p.featured);
    const regularProducts = products.filter((p) => !p.featured);

    return (
        <div className="min-h-screen bg-card">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Gear Store - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-6" />
                    <h1 className="text-5xl font-display font-black tracking-tight mb-4">GoEventCity Gear</h1>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto">Show your support with official GoEventCity merchandise</p>
                </div>
            </div>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-3xl font-display font-black tracking-tight text-foreground mb-8">Featured Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredProducts.map((product) => (
                            <Card key={product.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-64 overflow-hidden bg-muted">
                                    <img
                                        src={product.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop"}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline">{product.category}</Badge>
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                            <span className="text-sm font-medium">{product.rating}</span>
                                            <span className="text-sm text-muted-foreground ml-1">({product.reviews_count})</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">{product.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-foreground">${product.price}</span>
                                        <Button onClick={() => router.visit(`/gear/${product.id}`)}>
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* All Products */}
            <div className="bg-muted/50 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-display font-black tracking-tight text-foreground">All Products</h2>
                        <div className="flex gap-2">
                            {categories.map((category) => (
                                <Button key={category} variant="outline" size="sm">
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {regularProducts.map((product) => (
                            <Card key={product.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-48 overflow-hidden bg-muted">
                                    <img
                                        src={product.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop"}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                            <span className="text-xs">{product.rating}</span>
                                        </div>
                                        <span className="text-lg font-bold text-foreground">${product.price}</span>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.visit(`/gear/${product.id}`)}>
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-sm">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-3xl font-display font-black tracking-tight mb-4">Custom Gear Available</h2>
                        <p className="text-xl text-purple-100 mb-8">Need custom merchandise for your event or organization? We can help!</p>
                        <Button size="lg" variant="outline" className="bg-card text-primary hover:bg-accent/50">
                            Contact Sales
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    );
}
