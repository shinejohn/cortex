import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
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
    const [isLoading, setIsLoading] = useState(false);

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
    const handleApplyPromoCode = () => {
        if (promoCode.toLowerCase() === "jazz10") {
            setPromoApplied(true);
            setPromoError(false);
        } else {
            setPromoApplied(false);
            setPromoError(true);
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
        const discount = promoApplied ? subtotal * 0.1 : 0;
        return subtotal + fee - discount;
    };

    // Check if any tickets are selected
    const hasSelectedTickets = selectedTickets.some((ticket) => ticket.quantity > 0);

    // Check if all selected tickets are free
    const hasOnlyFreeTickets =
        hasSelectedTickets && selectedTickets.every((ticket) => (ticket.quantity > 0 && Number(ticket.price) === 0) || ticket.quantity === 0);

    // Proceed to checkout
    const handleProceedToCheckout = () => {
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
            promo_code: promoApplied ? { code: promoCode, discount: 0.1 } : null,
        };

        router.post("/api/ticket-orders", orderData, {
            onSuccess: (response) => {
                // Redirect to confirmation page or my tickets
                router.visit("/tickets/my-tickets");
            },
            onError: (errors) => {
                console.error("Order failed:", errors);
                setIsLoading(false);
            },
        });
    };

    return (
        <>
            <Head title={`Get Tickets - ${event.title}`} />
            <Header auth={auth} />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-8">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Link href="/" className="hover:text-gray-700">
                                Home
                            </Link>
                            <span>/</span>
                            <Link href="/events" className="hover:text-gray-700">
                                Events
                            </Link>
                            <span>/</span>
                            <Link href={`/events/${event.id}`} className="hover:text-gray-700">
                                {event.title}
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900">Tickets</span>
                        </div>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main ticket selection column */}
                        <div className="lg:col-span-2">
                            {/* Event info */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex items-start">
                                    <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                                        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="ml-4">
                                        <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
                                        <div className="mt-1 flex items-center text-sm text-gray-600">
                                            <CalendarIcon className="h-4 w-4 mr-1" />
                                            <span>
                                                {new Date(event.event_date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-gray-600">
                                            <ClockIcon className="h-4 w-4 mr-1" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-gray-600">
                                            <MapPinIcon className="h-4 w-4 mr-1" />
                                            <span>{event.venue?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket selection */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <TicketIcon className="h-5 w-5 text-indigo-600 mr-2" />
                                    Select Tickets
                                </h2>
                                <div className="space-y-4">
                                    {selectedTickets.map((ticket) => (
                                        <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{ticket.name}</h3>
                                                    <p className="text-sm text-gray-600">{ticket.description}</p>
                                                    <p className="mt-1 font-medium text-gray-900">
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
                                            {ticket.available_quantity <= 0 && <p className="mt-2 text-sm text-red-600">Sold out</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Promo code */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Promo Code</h2>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Enter promo code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                    />
                                    <Button onClick={handleApplyPromoCode}>Apply</Button>
                                </div>
                                {promoApplied && <p className="mt-2 text-sm text-green-600">Promo code applied! 10% discount added.</p>}
                                {promoError && <p className="mt-2 text-sm text-red-600">Invalid promo code. Please try again.</p>}
                            </div>
                        </div>

                        {/* Order summary column */}
                        <div>
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                                {hasSelectedTickets ? (
                                    <>
                                        <div className="space-y-4 mb-6">
                                            {selectedTickets
                                                .filter((t) => t.quantity > 0)
                                                .map((ticket) => (
                                                    <div key={ticket.id} className="flex justify-between">
                                                        <div>
                                                            <p className="font-medium">{ticket.name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {ticket.quantity} x ${Number(ticket.price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <p className="font-medium">${(ticket.quantity * Number(ticket.price)).toFixed(2)}</p>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="border-t border-gray-200 pt-4 mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <p className="text-gray-600">Subtotal</p>
                                                <p>${calculateSubtotal().toFixed(2)}</p>
                                            </div>
                                            {calculateSubtotal() > 0 && (
                                                <div className="flex justify-between text-sm mb-2">
                                                    <div className="flex items-start">
                                                        <p className="text-gray-600">Marketplace Fee (10%)</p>
                                                        <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                                    </div>
                                                    <p>${calculateMarketplaceFee().toFixed(2)}</p>
                                                </div>
                                            )}
                                            {promoApplied && (
                                                <div className="flex justify-between text-sm mb-2 text-green-600">
                                                    <p>Discount (10%)</p>
                                                    <p>-${(calculateSubtotal() * 0.1).toFixed(2)}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-200 pt-4 mb-6">
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
                                                <p className="text-sm text-gray-600 text-center">Please log in to purchase tickets</p>
                                                <Link
                                                    href="/login"
                                                    className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 text-center"
                                                >
                                                    Log In
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Select tickets to continue</p>
                                    </div>
                                )}
                                <div className="mt-6 text-sm text-gray-600">
                                    <p className="mb-2">
                                        <span className="font-medium">Ticket Policy:</span> All sales are final. No refunds or exchanges.
                                    </p>
                                    <p>
                                        <span className="font-medium">Questions?</span>{" "}
                                        <Link href="/help" className="text-indigo-600 hover:text-indigo-800">
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
