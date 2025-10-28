import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Auth } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { AlertCircle, CheckCircle, Clock, CreditCard, Edit, Package, Plus, ShoppingCart, Store as StoreIcon, XCircle } from "lucide-react";
import { route } from "ziggy-js";

interface Store {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    status: "pending" | "approved" | "rejected" | "suspended";
    stripe_charges_enabled: boolean;
    stripe_payouts_enabled: boolean;
    can_accept_payments: boolean;
    products_count: number;
    orders_count: number;
    created_at: string;
}

interface MyStoresProps {
    auth: Auth;
    stores: Store[];
}

export default function MyStores({ auth, stores }: MyStoresProps) {
    const getStatusBadge = (status: Store["status"]) => {
        const variants: Record<Store["status"], { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
            pending: {
                variant: "secondary",
                icon: <Clock className="h-3 w-3 mr-1" />,
            },
            approved: {
                variant: "default",
                icon: <CheckCircle className="h-3 w-3 mr-1" />,
            },
            rejected: {
                variant: "destructive",
                icon: <XCircle className="h-3 w-3 mr-1" />,
            },
            suspended: {
                variant: "outline",
                icon: <AlertCircle className="h-3 w-3 mr-1" />,
            },
        };

        const config = variants[status];
        return (
            <Badge variant={config.variant} className="flex items-center w-fit">
                {config.icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getStripeStatus = (store: Store) => {
        if (!store.stripe_charges_enabled || !store.stripe_payouts_enabled) {
            return (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Stripe setup incomplete</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Stripe connected</span>
            </div>
        );
    };

    return (
        <>
            <Head title="My Stores" />

            <Header auth={auth} />

            {/* Page Header */}
            <div className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <StoreIcon className="h-8 w-8 text-primary" />
                                <h1 className="text-4xl font-bold text-foreground">My Stores</h1>
                            </div>
                            <p className="text-lg text-muted-foreground mt-2">Manage your stores and products</p>
                        </div>
                        <Link href={route("stores.create")}>
                            <Button size="lg">
                                <Plus className="h-5 w-5 mr-2" />
                                Create Store
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stores Grid */}
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    {stores.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stores.map((store) => (
                                <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <CardHeader className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {store.logo ? (
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                                                        <img src={`/storage/${store.logo}`} alt={store.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                        <StoreIcon className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <CardTitle className="line-clamp-1">{store.name}</CardTitle>
                                                    <CardDescription className="line-clamp-1 mt-1">
                                                        {store.description || "No description"}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Link href={route("stores.edit", store.id)}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-2">{getStatusBadge(store.status)}</div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Package className="h-4 w-4" />
                                                    <span className="text-sm">Products</span>
                                                </div>
                                                <p className="text-2xl font-bold">{store.products_count}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <ShoppingCart className="h-4 w-4" />
                                                    <span className="text-sm">Orders</span>
                                                </div>
                                                <p className="text-2xl font-bold">{store.orders_count}</p>
                                            </div>
                                        </div>

                                        {/* Stripe Status */}
                                        <div className="pt-3 border-t">{getStripeStatus(store)}</div>

                                        {/* Quick Actions */}
                                        <div className="flex gap-2 pt-2">
                                            {store.status === "approved" && (
                                                <Link href={route("products.create", store.id)} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add Product
                                                    </Button>
                                                </Link>
                                            )}
                                            {!store.can_accept_payments && store.status === "approved" && (
                                                <Button asChild variant="outline" size="sm" className="w-full flex-1">
                                                    <a href={route("stores.connect-stripe", store.id)} target="_blank" rel="noopener noreferrer">
                                                        <CreditCard className="h-4 w-4 mr-1" />
                                                        Setup Stripe
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="bg-muted/50 gap-2">
                                        <Link href={route("stores.show", store.slug)} className="flex-1">
                                            <Button variant="ghost" className="w-full">
                                                View Store
                                            </Button>
                                        </Link>
                                        {store.can_accept_payments && (
                                            <Link href={route("stores.stripe-dashboard", store.id)} className="flex-1">
                                                <Button variant="ghost" className="w-full">
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Stripe
                                                </Button>
                                            </Link>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <StoreIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No stores yet</h3>
                            <p className="text-muted-foreground mb-6">Create your first store to start selling products</p>
                            <Link href={route("stores.create")}>
                                <Button size="lg">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create Your First Store
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
