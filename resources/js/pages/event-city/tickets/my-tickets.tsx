import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { Head, Link, usePage } from "@inertiajs/react";
import { CalendarIcon, ClockIcon, DownloadIcon, MapPinIcon, TicketIcon } from "lucide-react";

interface TicketOrder {
    id: string;
    status: string;
    total: number;
    completed_at: string;
    event: {
        id: string;
        title: string;
        event_date: string;
        time: string;
        image: string;
        venue: {
            name: string;
        };
    };
    items: Array<{
        id: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        ticket_plan: {
            id: string;
            name: string;
            description: string;
        };
    }>;
}

interface MyTicketsPageProps {
    auth: {
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
    orders: TicketOrder[];
}

export default function MyTickets() {
    const { auth, orders = [] } = usePage<MyTicketsPageProps>().props;

    const completedOrders = orders.filter((order) => order.status === "completed");
    const pendingOrders = orders.filter((order) => order.status === "pending");

    const handleDownloadTicket = (orderId: string) => {
        // This would generate a PDF or send to an email
        console.log("Download ticket for order:", orderId);
    };

    const renderOrderCard = (order: TicketOrder) => (
        <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex">
                <div className="w-24 h-24 flex-shrink-0">
                    <img src={order.event.image} alt={order.event.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{order.event.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(order.event.event_date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {order.event.time}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {order.event.venue?.name}
                            </div>
                            <div className="text-sm text-gray-600">
                                {order.items.map((item, index) => (
                                    <div key={item.id}>
                                        {item.quantity}x {item.ticket_plan.name}
                                        {index < order.items.length - 1 && ", "}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 mb-2">${Number(order.total).toFixed(2)}</div>
                            <div className="space-y-2">
                                {order.status === "completed" && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => handleDownloadTicket(order.id)} className="w-full">
                                            <DownloadIcon className="h-4 w-4 mr-1" />
                                            Download
                                        </Button>
                                        <Link href={`/events/${order.event.id}`} className="block">
                                            <Button variant="ghost" size="sm" className="w-full">
                                                View Event
                                            </Button>
                                        </Link>
                                    </>
                                )}
                                {order.status === "pending" && <div className="text-sm text-yellow-600 font-medium">Payment Pending</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Head title="My Tickets" />

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
                            <Link href="/tickets" className="hover:text-gray-700">
                                Tickets
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900">My Tickets</span>
                        </div>
                    </nav>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
                        <p className="text-gray-600 mt-2">View and manage all your ticket purchases</p>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-medium text-gray-900 mb-2">No tickets yet</h2>
                            <p className="text-gray-600 mb-6">Browse events and purchase tickets to see them here.</p>
                            <Link href="/events">
                                <Button>Browse Events</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Completed Orders */}
                            {completedOrders.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Tickets ({completedOrders.length})</h2>
                                    <div className="space-y-4">{completedOrders.map(renderOrderCard)}</div>
                                </div>
                            )}

                            {/* Pending Orders */}
                            {pendingOrders.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Orders ({pendingOrders.length})</h2>
                                    <div className="space-y-4">{pendingOrders.map(renderOrderCard)}</div>
                                </div>
                            )}

                            {/* Browse More Events */}
                            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Looking for more events?</h3>
                                <p className="text-gray-600 mb-4">Discover new events happening in your area.</p>
                                <Link href="/events">
                                    <Button>Browse Events</Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
