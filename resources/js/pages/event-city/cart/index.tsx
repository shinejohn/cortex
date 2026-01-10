import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Auth } from "@/types";

interface CartItem {
    id: string;
    quantity: number;
    price: number;
    total: number;
    product: {
        id: string;
        name: string;
        slug: string;
        images: string[];
        is_in_stock: boolean;
    };
    store: {
        id: string;
        name: string;
        slug: string;
    };
}

interface Cart {
    id: string;
    items: CartItem[];
    items_count: number;
    total: number;
}

interface Props {
    auth: Auth;
    cart: Cart;
}

export default function CartIndex({ auth, cart }: Props) {
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

    const updateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setUpdatingItems((prev) => new Set(prev).add(itemId));

        router.patch(
            route("cart.update", itemId),
            { quantity: newQuantity },
            {
                preserveScroll: true,
                onFinish: () => {
                    setUpdatingItems((prev) => {
                        const next = new Set(prev);
                        next.delete(itemId);
                        return next;
                    });
                },
            },
        );
    };

    const removeItem = (itemId: string) => {
        router.delete(route("cart.remove", itemId), {
            preserveScroll: true,
        });
    };

    const proceedToCheckout = async () => {
        try {
            const { data } = await axios.post(route("checkout"));

            // Redirect to Stripe checkout
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Checkout error:", error);
            const message = error.response?.data?.error || "An error occurred. Please try again.";
            alert(message);
        }
    };

    if (cart.items.length === 0) {
        return (
            <>
                <Head title="Shopping Cart" />
                <Header auth={auth} />
                <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
                    <div className="text-center max-w-md">
                        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet</p>
                        <Link href={route("shop.discover")}>
                            <Button size="lg">Start Shopping</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Head title="Shopping Cart" />
            <Header auth={auth} />

            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route("shop.discover")}
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Continue shopping
                        </Link>
                        <h1 className="text-3xl lg:text-4xl font-bold">Shopping cart</h1>
                    </div>

                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                        {/* Cart Items */}
                        <div className="lg:col-span-7">
                            <div className="space-y-6">
                                {cart.items.map((item) => {
                                    const imageUrl = item.product.images?.[0] ? `/storage/${item.product.images[0]}` : "/placeholder-product.jpg";
                                    const isUpdating = updatingItems.has(item.id);

                                    return (
                                        <div key={item.id} className="relative">
                                            <div className="flex gap-4 sm:gap-6">
                                                {/* Product Image */}
                                                <Link
                                                    href={route("products.show", {
                                                        store: item.store.slug,
                                                        product: item.product.slug,
                                                    })}
                                                    className="flex-shrink-0"
                                                >
                                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-muted border">
                                                        <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                                    </div>
                                                </Link>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between">
                                                        <div className="flex-1 pr-4">
                                                            <Link
                                                                href={route("products.show", {
                                                                    store: item.store.slug,
                                                                    product: item.product.slug,
                                                                })}
                                                                className="font-medium text-foreground hover:underline block"
                                                            >
                                                                {item.product.name}
                                                            </Link>
                                                            <Link
                                                                href={route("stores.show", item.store.slug)}
                                                                className="text-sm text-muted-foreground hover:text-foreground mt-1 block"
                                                            >
                                                                {item.store.name}
                                                            </Link>

                                                            {!item.product.is_in_stock && (
                                                                <p className="text-sm text-destructive mt-2">Out of stock</p>
                                                            )}
                                                        </div>

                                                        {/* Price - Desktop */}
                                                        <div className="hidden sm:block text-right">
                                                            <p className="font-semibold">${item.total.toFixed(2)}</p>
                                                            {item.quantity > 1 && (
                                                                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Quantity and Remove */}
                                                    <div className="flex items-center justify-between mt-4">
                                                        {/* Quantity Selector */}
                                                        <div className="flex items-center border rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                disabled={isUpdating || item.quantity <= 1}
                                                                className="px-3 py-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                disabled={isUpdating}
                                                                className="px-3 py-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Remove</span>
                                                        </button>
                                                    </div>

                                                    {/* Price - Mobile */}
                                                    <div className="sm:hidden mt-3">
                                                        <p className="font-semibold">${item.total.toFixed(2)}</p>
                                                        {item.quantity > 1 && (
                                                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Separator */}
                                            <Separator className="mt-6" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="mt-8 lg:mt-0 lg:col-span-5">
                            <div className="bg-muted/30 rounded-lg border p-6 lg:sticky lg:top-4">
                                <h2 className="text-lg font-semibold mb-6">Order summary</h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Subtotal ({cart.items_count} {cart.items_count === 1 ? "item" : "items"})
                                        </span>
                                        <span className="font-medium">${cart.total.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-muted-foreground">Calculated at checkout</span>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between">
                                        <span className="font-semibold">Total</span>
                                        <span className="font-semibold text-lg">${cart.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-6"
                                    size="lg"
                                    onClick={proceedToCheckout}
                                    disabled={cart.items.some((item) => !item.product.is_in_stock)}
                                >
                                    Checkout
                                </Button>

                                {cart.items.some((item) => !item.product.is_in_stock) && (
                                    <p className="text-sm text-destructive mt-4 text-center">Remove out of stock items to continue</p>
                                )}

                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-xs text-muted-foreground text-center">Secure checkout powered by Stripe</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
