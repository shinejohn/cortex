import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, ShoppingCartIcon, TicketIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";

interface TicketPlan {
    id: string;
    name: string;
    price: number;
}

interface Venue {
    id: string;
    name: string;
    address: string;
}

interface Event {
    id: string;
    title: string;
    event_date: string;
    venue: Venue | null;
}

interface TicketOrderItem {
    id: string;
    quantity: number;
    ticketPlan: TicketPlan;
}

interface Seller {
    id: string;
    name: string;
}

interface Listing {
    id: string;
    price: number;
    quantity: number;
    description: string | null;
    status: string;
    expires_at: string | null;
    created_at: string;
    ticketOrderItem: TicketOrderItem;
    event: Event;
    seller: Seller;
}

interface Props {
    listing: Listing;
}

export default function ListingShow({ listing }: Props) {
    const { auth } = usePage().props as any;
    const [purchaseQuantity, setPurchaseQuantity] = useState(1);
    const isOwnListing = auth?.user?.id === listing.seller?.id;

    const handlePurchase = () => {
        router.post(route("tickets.marketplace.purchase", listing.id) as string, {
            quantity: purchaseQuantity,
        });
    };

    return (
        <AppLayout>
            <Head title={`Ticket: ${listing.event?.title}`} />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
                    <Button variant="ghost" size="sm" asChild className="mb-6">
                        <Link href={route("tickets.marketplace.index") as string}>
                            <ArrowLeftIcon className="mr-2 size-4" />
                            Back to Marketplace
                        </Link>
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Event Info */}
                            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                <CardContent className="p-6">
                                    <Badge variant={listing.status === "active" ? "default" : "secondary"} className="mb-3 capitalize">
                                        {listing.status}
                                    </Badge>
                                    <h1 className="font-display text-2xl font-black tracking-tight">
                                        {listing.event?.title}
                                    </h1>
                                    <div className="mt-4 space-y-2">
                                        {listing.event?.event_date && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarIcon className="size-4" />
                                                {new Date(listing.event.event_date).toLocaleDateString("en-US", { dateStyle: "full" })}
                                            </div>
                                        )}
                                        {listing.event?.venue && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPinIcon className="size-4" />
                                                {listing.event.venue.name}
                                                {listing.event.venue.address && ` - ${listing.event.venue.address}`}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ticket Details */}
                            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TicketIcon className="size-4" />
                                        Ticket Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Ticket Type</span>
                                        <span className="font-medium">{listing.ticketOrderItem?.ticketPlan?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Quantity Available</span>
                                        <span className="font-medium">{listing.quantity}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Price per Ticket</span>
                                        <span className="text-lg font-bold">${Number(listing.price).toFixed(2)}</span>
                                    </div>
                                    {listing.description && (
                                        <>
                                            <Separator />
                                            <p className="text-sm text-muted-foreground">{listing.description}</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Seller Info */}
                            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserIcon className="size-4" />
                                        Seller
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{listing.seller?.name}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Listed {new Date(listing.created_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Purchase Sidebar */}
                        <div>
                            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm sticky top-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingCartIcon className="size-4" />
                                        Purchase
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min="1"
                                            max={listing.quantity}
                                            value={purchaseQuantity}
                                            onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-medium">
                                        <span>Total</span>
                                        <span className="text-lg">
                                            ${(Number(listing.price) * purchaseQuantity).toFixed(2)}
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        disabled={isOwnListing || listing.status !== "active"}
                                        onClick={handlePurchase}
                                    >
                                        {isOwnListing ? "This is your listing" : "Purchase Now"}
                                    </Button>
                                    {listing.expires_at && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            Listing expires {new Date(listing.expires_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
