import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Auth } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Check, Edit, ShoppingCart, Store as StoreIcon, Lock, Truck, Shield } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import axios from "axios";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    quantity: number | null;
    is_in_stock: boolean;
    discount_percentage: number | null;
    sku: string | null;
}

interface Store {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
}

interface ProductShowProps {
    auth: Auth;
    product: Product;
    store: Store;
    is_owner: boolean;
}

export default function ProductShow({ auth, product, store, is_owner }: ProductShowProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const increaseQuantity = () => {
        if (product.quantity === null || quantity < product.quantity) {
            setQuantity(quantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const addToCart = async () => {
        if (!auth.user) {
            router.visit(route("login"));
            return;
        }

        setIsAddingToCart(true);

        try {
            const response = await axios.post(route("cart.add"), {
                product_id: product.id,
                quantity: quantity,
            });

            toast.success(response.data.message || "Product added to cart");
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Failed to add to cart";
            toast.error(errorMessage);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const buyNow = async () => {
        if (!auth.user) {
            router.visit(route("login"));
            return;
        }

        setIsAddingToCart(true);

        try {
            await axios.post(route("cart.add"), {
                product_id: product.id,
                quantity: quantity,
            });

            router.visit(route("cart.index"));
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Failed to add to cart";
            toast.error(errorMessage);
            setIsAddingToCart(false);
        }
    };

    const images = product.images?.map((img) => `/storage/${img}`) || ["/placeholder-product.jpg"];

    return (
        <>
            <Head title={product.name} />
            <Header auth={auth} />

            <div className="bg-background min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <Link
                            href={route("stores.show", store.slug)}
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to {store.name}
                        </Link>
                    </div>

                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                        {/* Images */}
                        <div className="space-y-4 lg:sticky lg:top-4">
                            {/* Main Image */}
                            <div className="aspect-square rounded-xl overflow-hidden bg-muted border">
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-5 gap-3">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImage === index
                                                    ? "border-primary ring-2 ring-primary/20"
                                                    : "border-border hover:border-primary/50"
                                            }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="mt-8 lg:mt-0">
                            {/* Store Link */}
                            <Link
                                href={route("stores.show", store.slug)}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                            >
                                {store.logo ? (
                                    <img
                                        src={store.logo}
                                        alt={store.name}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <StoreIcon className="h-4 w-4" />
                                )}
                                {store.name}
                            </Link>

                            {/* Product Name */}
                            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>

                            {product.sku && (
                                <p className="text-sm text-muted-foreground mb-4">SKU: {product.sku}</p>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold">{formatPrice(product.price)}</span>
                                    {product.compare_at_price && product.compare_at_price > product.price && (
                                        <>
                                            <span className="text-xl text-muted-foreground line-through">
                                                {formatPrice(product.compare_at_price)}
                                            </span>
                                            {product.discount_percentage && (
                                                <Badge variant="destructive">
                                                    {product.discount_percentage}% off
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.is_in_stock ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <Check className="h-5 w-5" />
                                        <span className="font-medium">In stock</span>
                                        {product.quantity !== null && product.quantity <= 10 && (
                                            <span className="text-sm text-muted-foreground">
                                                ({product.quantity} available)
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-destructive">
                                        <span className="font-medium">Out of stock</span>
                                    </div>
                                )}
                            </div>

                            {is_owner ? (
                                <div className="space-y-3">
                                    <Link
                                        href={route("products.edit", { store: store.id, product: product.id })}
                                        className="block"
                                    >
                                        <Button className="w-full" size="lg">
                                            <Edit className="h-5 w-5 mr-2" />
                                            Edit Product
                                        </Button>
                                    </Link>
                                    <Link href={route("stores.show", store.slug)} className="block">
                                        <Button variant="outline" className="w-full" size="lg">
                                            Back to Store
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* Quantity Selector */}
                                    <div className="mb-6">
                                        <label className="text-sm font-medium mb-3 block">Quantity</label>
                                        <div className="flex items-center border rounded-lg w-fit">
                                            <button
                                                onClick={decreaseQuantity}
                                                disabled={quantity <= 1 || !product.is_in_stock}
                                                className="px-4 py-3 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                −
                                            </button>
                                            <span className="px-6 py-3 text-sm font-medium min-w-[4rem] text-center border-x">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={increaseQuantity}
                                                disabled={
                                                    !product.is_in_stock ||
                                                    (product.quantity !== null && quantity >= product.quantity)
                                                }
                                                className="px-4 py-3 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 mb-8">
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            disabled={!product.is_in_stock || isAddingToCart}
                                            onClick={addToCart}
                                        >
                                            <ShoppingCart className="h-5 w-5 mr-2" />
                                            {isAddingToCart
                                                ? "Adding..."
                                                : product.is_in_stock
                                                ? "Add to cart"
                                                : "Out of stock"}
                                        </Button>

                                        {product.is_in_stock && (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                size="lg"
                                                disabled={isAddingToCart}
                                                onClick={buyNow}
                                            >
                                                Buy it now
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Features */}
                            <div className="bg-muted/30 rounded-lg p-4 mb-8 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Free shipping</p>
                                        <p className="text-xs text-muted-foreground">On orders over $50</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Secure checkout</p>
                                        <p className="text-xs text-muted-foreground">Powered by Stripe</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">30-day returns</p>
                                        <p className="text-xs text-muted-foreground">Easy returns & exchanges</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <>
                                    <Separator className="my-6" />
                                    <div>
                                        <h2 className="text-lg font-semibold mb-3">Description</h2>
                                        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
