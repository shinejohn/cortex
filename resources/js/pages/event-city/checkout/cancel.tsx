import { Head, Link } from "@inertiajs/react";
import { AlertCircle, ArrowLeft, ShoppingCart, X } from "lucide-react";
import { route } from "ziggy-js";
import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Auth } from "@/types";

interface Order {
    id: string;
    order_number: string;
}

interface CheckoutCancelProps {
    auth: Auth;
    order: Order;
}

export default function CheckoutCancel({ auth, order }: CheckoutCancelProps) {
    return (
        <>
            <Head title="Checkout Cancelled" />

            <Header auth={auth} />

            {/* Cancel Message */}
            <div className="py-16">
                <div className="max-w-3xl mx-auto px-3 sm:px-4">
                    <div className="text-center space-y-6">
                        {/* Cancel Icon */}
                        <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                            <X className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                        </div>

                        {/* Cancel Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Checkout Cancelled</h1>
                            <p className="text-lg text-muted-foreground">Your order has not been placed</p>
                        </div>

                        {/* Info Card */}
                        <Card className="text-left">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                    What Happened?
                                </CardTitle>
                                <CardDescription>Your checkout session was cancelled</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Order Reference</p>
                                    <p className="font-semibold">{order.order_number}</p>
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>Your order has been cancelled and no payment was processed. This can happen for several reasons:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>You clicked the back button or closed the payment window</li>
                                        <li>The payment session expired</li>
                                        <li>You chose to cancel the payment</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Box */}
                        <div className="p-4 bg-accent/50 border border-primary/20 rounded-lg text-left">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-primary dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-semibold text-blue-900 dark:text-blue-100">Want to complete your purchase?</p>
                                    <p className="text-sm text-primary dark:text-blue-200">
                                        You can retry the checkout process or continue shopping to add more items to your cart.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button size="lg" onClick={() => window.history.back()} className="w-full sm:w-auto">
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Go Back
                            </Button>
                            <Link href={route("shop.discover")}>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>

                        {/* Additional Help */}
                        <div className="pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                Having trouble with checkout?{" "}
                                <a href="#" className="text-primary hover:underline">
                                    Contact support
                                </a>{" "}
                                for assistance
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
