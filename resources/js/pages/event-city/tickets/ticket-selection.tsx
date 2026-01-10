import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/common/LoadingButton";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { SuccessMessage } from "@/components/common/SuccessMessage";
import { Auth } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { CalendarIcon, ClockIcon, InfoIcon, MapPinIcon, MinusIcon, PlusIcon, TagIcon, TicketIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface TicketPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    max_quantity: number;
    available_quantity: number;
    is_active: boolean;
}

interface Event {
    id: string;
    title: string;
    event_date: string;
    time: string;
    venue: {
        name: string;
        neighborhood: string;
    };
    image: string;
}

interface TicketSelectionPageProps {
    auth: Auth;
    event: Event;
    ticketPlans: TicketPlan[];
}

interface SelectedTicket extends TicketPlan {
    quantity: number;
}

export default function TicketSelection() {
    const { auth, event, ticketPlans } = usePage<TicketSelectionPageProps>().props;
    const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
    const [promoCode, setPromoCode] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState(false);
    const [promoErrorMessage, setPromoErrorMessage] = useState("");
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);

    // Initialize selected tickets
    useEffect(() => {
        if (ticketPlans.length > 0 && selectedTickets.length === 0) {
            setSelectedTickets(
                ticketPlans.map((plan) => ({
                    ...plan,
                    quantity: 0,
                })),
            );
        }
    }, [ticketPlans]);

    // Update ticket quantity
    const updateTicketQuantity = (id: string, change: number) => {
        setSelectedTickets((prev) =>
            prev.map((ticket) => {
                if (ticket.id === id) {
                    const newQuantity = Math.max(0, Math.min(ticket.max_quantity, ticket.quantity + change));
                    return { ...ticket, quantity: newQuantity };
                }
                return ticket;
            }),
        );
    };

    // Apply promo code
    const handleApplyPromoCode = async () => {
        if (!promoCode.trim()) {
            setPromoError(true);
            setPromoErrorMessage("Please enter a promo code");
            return;
        }

        setIsValidatingPromo(true);
        setPromoError(false);
        setPromoErrorMessage("");

        try {
            const subtotal = calculateSubtotal();
            const response = await fetch("/api/promo-codes/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify({
                    code: promoCode.trim().toUpperCase(),
                    amount: subtotal,
                    event_id: event.id,
                }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setPromoApplied(true);
                setPromoError(false);
                setPromoDiscount(data.discount || 0);
            } else {
                setPromoApplied(false);
                setPromoError(true);
                setPromoDiscount(0);
                setPromoErrorMessage(data.message || "Invalid promo code. Please try again.");
            }
        } catch (error) {
            setPromoApplied(false);
            setPromoError(true);
            setPromoDiscount(0);
            setPromoErrorMessage("Failed to validate promo code. Please try again.");
        } finally {
            setIsValidatingPromo(false);
        }
    };

    // Calculate subtotal
    const calculateSubtotal = () => {
        return selectedTickets.reduce((sum, ticket) => sum + Number(ticket.price) * ticket.quantity, 0);
    };

    // Calculate marketplace fee (10%)
    const calculateMarketplaceFee = () => {
        return calculateSubtotal() * 0.1;
    };

    // Calculate total
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const fee = calculateMarketplaceFee();
        const discount = promoApplied ? promoDiscount : 0;
        return Math.max(0, subtotal + fee - discount);
    };

    // Check if any tickets are selected
    const hasSelectedTickets = selectedTickets.some((ticket) => ticket.quantity > 0);

    // Check if all selected tickets are free
    const hasOnlyFreeTickets =
        hasSelectedTickets && selectedTickets.every((ticket) => (ticket.quantity > 0 && Number(ticket.price) === 0) || ticket.quantity === 0);

    // Proceed to checkout
    const handleProceedToCheckout = async () => {
        if (!hasSelectedTickets || !auth.user) return;

        setIsLoading(true);

        const orderData = {
            event_id: event.id,
            items: selectedTickets
                .filter((ticket) => ticket.quantity > 0)
                .map((ticket) => ({
                    ticket_plan_id: ticket.id,
                    quantity: ticket.quantity,
                })),
            promo_code: promoApplied ? { code: promoCode } : null,
        };

        try {
            const response = await fetch("/api/ticket-orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create order");
            }

            // If free tickets, redirect to my tickets
            if (hasOnlyFreeTickets || !data.checkout_session) {
                router.visit("/tickets/my-tickets", {
                    onSuccess: () => {
                        setIsLoading(false);
                    },
                });
                return;
            }

            // Redirect to Stripe checkout
            if (data.checkout_session?.url) {
                window.location.href = data.checkout_session.url;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (error) {
            console.error("Order failed:", error);
            setIsLoading(false);
            // TODO: Show error message to user
        }
    };

    return (
        <>
            <Head title={`Get Tickets - ${event.title}`} />
            <Header auth={auth} />

            <div className="min-h-screen bg-muted/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-8">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-foreground">
                                Home
                            </Link>
                            <span>/</span>
                            <Link href="/events" className="hover:text-foreground">
                                Events
                            </Link>
                            <span>/</span>
                            <Link href={`/events/${event.id}`} className="hover:text-foreground">
                                {event.title}
                            </Link>
                            <span>/</span>
                            <span className="text-foreground">Tickets</span>
                        </div>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main ticket selection column */}
                        <div className="lg:col-span-2">
                            {/* Event info */}
                            <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex items-start">
                                    <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                                        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="ml-4">
                                        <h1 className="text-xl font-bold text-foreground">{event.title}</h1>
                                        <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                            <CalendarIcon className="h-4 w-4 mr-1" />
                                            <span>
                                                {new Date(event.event_date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                            <ClockIcon className="h-4 w-4 mr-1" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                            <MapPinIcon className="h-4 w-4 mr-1" />
                                            <span>{event.venue?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket selection */}
                            <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center">
                                    <TicketIcon className="h-5 w-5 text-primary mr-2" />
                                    Select Tickets
                                </h2>
                                <div className="space-y-4">
                                    {selectedTickets.map((ticket) => (
                                        <div key={ticket.id} className="border border rounded-lg p-4">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="font-medium text-foreground">{ticket.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                                                    <p className="mt-1 font-medium text-foreground">
                                                        {Number(ticket.price) === 0 ? (
                                                            <span className="text-green-600">Free</span>
                                                        ) : (
                                                            `$${Number(ticket.price).toFixed(2)}`
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateTicketQuantity(ticket.id, -1)}
                                                        disabled={ticket.quantity === 0}
                                                        className="h-8 w-8"
                                                    >
                                                        <MinusIcon className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-6 text-center">{ticket.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateTicketQuantity(ticket.id, 1)}
                                                        disabled={ticket.quantity >= ticket.max_quantity || ticket.available_quantity <= 0}
                                                        className="h-8 w-8"
                                                    >
                                                        <PlusIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {ticket.quantity >= ticket.max_quantity && (
                                                <p className="mt-2 text-sm text-orange-600">Maximum {ticket.max_quantity} tickets per order</p>
                                            )}
                                            {ticket.available_quantity <= 0 && <p className="mt-2 text-sm text-destructive">Sold out</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Promo code */}
                            <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-bold text-foreground mb-4">Promo Code</h2>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        className={`flex-grow rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                            promoError ? "border-red-300" : promoApplied ? "border-green-300" : ""
                                        }`}
                                        placeholder="Enter promo code"
                                        value={promoCode}
                                        onChange={(e) => {
                                            setPromoCode(e.target.value);
                                            // Reset promo state when user types
                                            if (promoApplied || promoError) {
                                                setPromoApplied(false);
                                                setPromoError(false);
                                                setPromoDiscount(0);
                                                setPromoErrorMessage("");
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                                handleApplyPromoCode();
                                            }
                                        }}
                                        disabled={isValidatingPromo}
                                    />
                                    <Button onClick={handleApplyPromoCode} disabled={isValidatingPromo || !promoCode.trim()}>
                                        {isValidatingPromo ? "..." : "Apply"}
                                    </Button>
                                </div>
                                {promoApplied && (
                                    <p className="mt-2 text-sm text-green-600">Promo code applied! ${promoDiscount.toFixed(2)} discount added.</p>
                                )}
                                {promoError && (
                                    <p className="mt-2 text-sm text-destructive">{promoErrorMessage || "Invalid promo code. Please try again."}</p>
                                )}
                            </div>
                        </div>

                        {/* Order summary column */}
                        <div>
                            <div className="bg-card rounded-lg shadow-sm p-6 sticky top-6">
                                <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
                                {hasSelectedTickets ? (
                                    <>
                                        <div className="space-y-4 mb-6">
                                            {selectedTickets
                                                .filter((t) => t.quantity > 0)
                                                .map((ticket) => (
                                                    <div key={ticket.id} className="flex justify-between">
                                                        <div>
                                                            <p className="font-medium">{ticket.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {ticket.quantity} x ${Number(ticket.price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <p className="font-medium">${(ticket.quantity * Number(ticket.price)).toFixed(2)}</p>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="border-t border pt-4 mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <p className="text-muted-foreground">Subtotal</p>
                                                <p>${calculateSubtotal().toFixed(2)}</p>
                                            </div>
                                            {calculateSubtotal() > 0 && (
                                                <div className="flex justify-between text-sm mb-2">
                                                    <div className="flex items-start">
                                                        <p className="text-muted-foreground">Marketplace Fee (10%)</p>
                                                        <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground" />
                                                    </div>
                                                    <p>${calculateMarketplaceFee().toFixed(2)}</p>
                                                </div>
                                            )}
                                            {promoApplied && promoDiscount > 0 && (
                                                <div className="flex justify-between text-sm mb-2 text-green-600">
                                                    <p>Discount</p>
                                                    <p>-${promoDiscount.toFixed(2)}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border pt-4 mb-6">
                                            <div className="flex justify-between font-bold">
                                                <p>Total</p>
                                                <p>${calculateTotal().toFixed(2)}</p>
                                            </div>
                                            {hasOnlyFreeTickets && (
                                                <p className="text-sm text-green-600 mt-2">No payment required for free tickets</p>
                                            )}
                                        </div>
                                        {auth.user ? (
                                            <Button onClick={handleProceedToCheckout} className="w-full" disabled={isLoading}>
                                                {isLoading ? "Processing..." : hasOnlyFreeTickets ? "Register Now" : "Proceed to Checkout"}
                                            </Button>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-sm text-muted-foreground text-center">Please log in to purchase tickets</p>
                                                <Link
                                                    href="/login"
                                                    className="block w-full bg-primary text-primary-foreground py-3 px-4 rounded-md font-medium hover:bg-primary/90 text-center"
                                                >
                                                    Log In
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-muted-foreground">Select tickets to continue</p>
                                    </div>
                                )}
                                <div className="mt-6 text-sm text-muted-foreground">
                                    <p className="mb-2">
                                        <span className="font-medium">Ticket Policy:</span> All sales are final. No refunds or exchanges.
                                    </p>
                                    <p>
                                        <span className="font-medium">Questions?</span>{" "}
                                        <Link href="/help" className="text-primary hover:text-primary/80">
                                            Contact support
                                        </Link>
                                    </p>
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
