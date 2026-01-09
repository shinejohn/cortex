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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@inertiajs/react";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { route } from "ziggy-js";

interface CartItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        slug: string;
        images: string[];
    };
    store: {
        slug: string;
    };
}

interface CartDropdownProps {
    initialItemCount?: number;
}

export function CartDropdown({ initialItemCount = 0 }: CartDropdownProps) {
    const [itemCount, setItemCount] = useState(initialItemCount);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch cart data when dropdown opens
    useEffect(() => {
        if (isOpen && cartItems.length === 0) {
            fetchCart();
        }
    }, [isOpen, cartItems.length, fetchCart]);

    // Poll for cart count updates
    useEffect(() => {
        fetchCartCount();
        const interval = setInterval(fetchCartCount, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, [fetchCartCount]);

    const fetchCartCount = async () => {
        try {
            const response = await fetch(route("cart.count"));
            const data = await response.json();
            setItemCount(data.count || 0);
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
        }
    };

    const fetchCart = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/cart/items");
            if (response.ok) {
                const data = await response.json();
                setCartItems(data.items || []);
            }
        } catch (error) {
            console.error("Failed to fetch cart items:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="size-5" />
                    {itemCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 size-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {itemCount > 9 ? "9+" : itemCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Shopping Cart</span>
                    {itemCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                        </Badge>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShoppingCart className="size-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">Your cart is empty</p>
                        <Link href={route("shop.discover")}>
                            <Button size="sm" variant="outline">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="max-h-[300px]">
                            {cartItems.slice(0, 5).map((item) => {
                                const imageUrl = item.product.images?.[0] ? `/storage/${item.product.images[0]}` : "/placeholder-product.jpg";

                                return (
                                    <DropdownMenuItem key={item.id} asChild className="cursor-pointer">
                                        <Link
                                            href={route("products.show", {
                                                store: item.store.slug,
                                                product: item.product.slug,
                                            })}
                                            className="flex items-start gap-3 p-3"
                                        >
                                            <img src={imageUrl} alt={item.product.name} className="size-12 rounded-md object-cover flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            })}
                        </ScrollArea>

                        {cartItems.length > 5 && (
                            <div className="px-3 py-2 text-xs text-center text-muted-foreground border-t">
                                +{cartItems.length - 5} more {cartItems.length - 5 === 1 ? "item" : "items"}
                            </div>
                        )}

                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Link href={route("cart.index")}>
                                <Button className="w-full" size="sm">
                                    View Cart
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
