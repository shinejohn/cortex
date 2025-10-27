import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Auth } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Check, Package, ShoppingBag } from "lucide-react";
import { route } from "ziggy-js";

interface Order {
    id: string;
    order_number: string;
    total: number;
}

interface CheckoutSuccessProps {
    auth: Auth;
    order: Order;
}

export default function CheckoutSuccess({ auth, order }: CheckoutSuccessProps) {
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    return (
        <>
            <Head title="Order Successful" />

            <Header auth={auth} />

            {/* Success Message */}
            <div className="py-16">
                <div className="max-w-3xl mx-auto px-3 sm:px-4">
                    <div className="text-center space-y-6">
                        {/* Success Icon */}
                        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>

                        {/* Success Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Order Placed Successfully!</h1>
                            <p className="text-lg text-muted-foreground">Thank you for your purchase</p>
                        </div>

                        {/* Order Details Card */}
                        <Card className="text-left">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Details
                                </CardTitle>
                                <CardDescription>Your order has been confirmed and is being processed</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                                        <p className="text-xl font-bold">{order.order_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                                        <p className="text-xl font-bold">{formatPrice(order.total)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                        <p>You will receive an order confirmation email shortly</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                        <p>The store owner has been notified and will process your order</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                        <p>You can track your order status in your orders page</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href={route("orders.show", order.id)}>
                                <Button size="lg" className="w-full sm:w-auto">
                                    <ShoppingBag className="h-5 w-5 mr-2" />
                                    View Order Details
                                </Button>
                            </Link>
                            <Link href={route("shop.discover")}>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>

                        {/* Additional Info */}
                        <div className="pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                Need help with your order?{" "}
                                <Link href={route("orders.show", order.id)} className="text-primary hover:underline">
                                    Contact support
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
