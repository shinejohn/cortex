import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Auth } from "@/types";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { Calendar, CreditCard, Loader2, MapPin, Package, ShoppingBag, Store as StoreIcon, User } from "lucide-react";
import { route } from "ziggy-js";

interface OrderItem {
    id: string;
    product_name: string;
    product_description: string | null;
    price: number;
    quantity: number;
    total: number;
    product: {
        id: string;
        slug: string;
        images: string[] | null;
    } | null;
}

interface Order {
    id: string;
    order_number: string;
    customer_email: string;
    customer_name: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    payment_status: "pending" | "paid" | "failed" | "refunded";
    shipping_address: string | null;
    billing_address: string | null;
    notes: string | null;
    paid_at: string | null;
    created_at: string;
    items: OrderItem[];
    store: {
        id: string;
        name: string;
        slug: string;
        logo: string | null;
    };
}

interface OrderShowProps {
    auth: Auth;
    order: Order;
    is_store_owner: boolean;
}

export default function OrderShow({ auth, order, is_store_owner }: OrderShowProps) {
    const { data, setData, patch, processing } = useForm({
        status: order.status,
    });

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: Order["status"]) => {
        const variants: Record<Order["status"], "default" | "secondary" | "destructive" | "outline"> = {
            pending: "secondary",
            processing: "default",
            shipped: "default",
            delivered: "outline",
            cancelled: "destructive",
        };

        return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const getPaymentStatusBadge = (status: Order["payment_status"]) => {
        const variants: Record<Order["payment_status"], "default" | "secondary" | "destructive" | "outline"> = {
            pending: "secondary",
            paid: "default",
            failed: "destructive",
            refunded: "outline",
        };

        return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const handleStatusUpdate = () => {
        patch(route("orders.update-status", order.id));
    };

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <Header auth={auth} />

            {/* Page Header */}
            <div className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShoppingBag className="h-8 w-8 text-primary" />
                                <h1 className="text-4xl font-bold text-foreground">Order {order.order_number}</h1>
                            </div>
                            <p className="text-lg text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.payment_status)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Details */}
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Items</CardTitle>
                                    <CardDescription>{order.items.length} items</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                                {item.product?.images?.[0] ? (
                                                    <img
                                                        src={`/storage/${item.product.images[0]}`}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{item.product_name}</h4>
                                                {item.product_description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{item.product_description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-sm text-muted-foreground">
                                                        Quantity: <span className="font-medium text-foreground">{item.quantity}</span>
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        Price: <span className="font-medium text-foreground">{formatPrice(item.price)}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatPrice(item.total)}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <Separator />

                                    {/* Order Summary */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatPrice(order.subtotal)}</span>
                                        </div>
                                        {order.tax > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Tax</span>
                                                <span>{formatPrice(order.tax)}</span>
                                            </div>
                                        )}
                                        {order.shipping > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Shipping</span>
                                                <span>{formatPrice(order.shipping)}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total</span>
                                            <span>{formatPrice(order.total)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {order.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{order.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Store Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <StoreIcon className="h-5 w-5" />
                                        Store
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Link
                                        href={route("stores.show", order.store.slug)}
                                        className="flex items-center gap-3 hover:bg-muted p-2 -m-2 rounded-lg transition-colors"
                                    >
                                        {order.store.logo ? (
                                            <img src={`/storage/${order.store.logo}`} alt={order.store.name} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                <StoreIcon className="h-5 w-5" />
                                            </div>
                                        )}
                                        <span className="font-medium">{order.store.name}</span>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Customer Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-medium">{order.customer_name}</p>
                                    <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                                </CardContent>
                            </Card>

                            {/* Payment Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        {getPaymentStatusBadge(order.payment_status)}
                                    </div>
                                    {order.paid_at && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Paid on {formatDate(order.paid_at)}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Addresses */}
                            {(order.shipping_address || order.billing_address) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Addresses
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {order.shipping_address && (
                                            <div>
                                                <p className="font-medium mb-1">Shipping Address</p>
                                                <p className="text-sm text-muted-foreground whitespace-pre-line">{order.shipping_address}</p>
                                            </div>
                                        )}
                                        {order.billing_address && (
                                            <div>
                                                <p className="font-medium mb-1">Billing Address</p>
                                                <p className="text-sm text-muted-foreground whitespace-pre-line">{order.billing_address}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Status Update (Store Owner Only) */}
                            {is_store_owner && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Update Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData("status", e.target.value as Order["status"])}
                                            className="w-full border rounded-md p-2"
                                            disabled={processing}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <Button onClick={handleStatusUpdate} disabled={processing || data.status === order.status} className="w-full">
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Status
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
