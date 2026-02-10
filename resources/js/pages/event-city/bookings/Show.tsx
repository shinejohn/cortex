import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowLeftIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    DollarSignIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon,
    XCircleIcon,
} from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";

interface Event {
    id: string;
    title: string;
    event_date: string;
    venue?: { id: string; name: string; address: string };
    performer?: { id: string; name: string };
}

interface Venue {
    id: string;
    name: string;
    address: string;
    capacity: number;
}

interface Performer {
    id: string;
    name: string;
    genres: string[];
    upcomingShows: any[];
}

interface Workspace {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
}

interface FinancialBreakdown {
    subtotal: number;
    fees: number;
    taxes: number;
    discount: number;
    total: number;
}

interface Booking {
    id: string;
    booking_number: string;
    booking_type: "event" | "venue" | "performer";
    status: string;
    payment_status: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string | null;
    contact_company: string | null;
    event_date: string;
    start_time: string;
    end_time: string;
    event_type: string;
    expected_guests: number | null;
    expected_audience: number | null;
    total_amount: number;
    currency: string;
    notes: string | null;
    special_requests: string[] | null;
    created_at: string;
    event?: Event;
    venue?: Venue;
    performer?: Performer;
    workspace?: Workspace;
    createdBy?: User;
}

interface Props {
    booking: Booking;
    currentStep: string;
    progress: number;
    financialBreakdown: FinancialBreakdown;
    canProceed: boolean;
    steps: string[];
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    rejected: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

export default function BookingShow({ booking, currentStep, progress, financialBreakdown, canProceed, steps }: Props) {
    const handleConfirm = () => {
        router.post(route("bookings.confirm", booking.id) as string);
    };

    const handleCancel = () => {
        if (confirm("Are you sure you want to cancel this booking?")) {
            router.post(route("bookings.cancel", booking.id) as string, {
                cancellation_reason: "Cancelled by user",
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`Booking ${booking.booking_number}`} />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back + Actions */}
                    <div className="flex items-center justify-between mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route("bookings.index") as string}>
                                <ArrowLeftIcon className="mr-2 size-4" />
                                Back to Bookings
                            </Link>
                        </Button>
                        <div className="flex gap-2">
                            {booking.status === "pending" && (
                                <>
                                    <Button onClick={handleConfirm}>
                                        <CheckCircleIcon className="mr-2 size-4" />
                                        Confirm Booking
                                    </Button>
                                    <Button variant="destructive" onClick={handleCancel}>
                                        <XCircleIcon className="mr-2 size-4" />
                                        Cancel
                                    </Button>
                                </>
                            )}
                            <Button variant="outline" asChild>
                                <Link href={route("bookings.edit", booking.id) as string}>Edit</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="font-display text-2xl font-black tracking-tight">
                                Booking {booking.booking_number}
                            </h1>
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                    statusColors[booking.status] || ""
                                }`}
                            >
                                {booking.status}
                            </span>
                            <Badge variant="outline" className="capitalize">
                                {booking.booking_type}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Created on {new Date(booking.created_at).toLocaleDateString("en-US", { dateStyle: "long" })}
                            {booking.createdBy && ` by ${booking.createdBy.name}`}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                                    Workflow Progress
                                </span>
                                <span className="text-sm font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="mt-3 flex gap-2 flex-wrap">
                                {steps.map((step) => (
                                    <Badge
                                        key={step}
                                        variant={step === currentStep ? "default" : "outline"}
                                        className="text-xs capitalize"
                                    >
                                        {step.replace(/_/g, " ")}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact Information */}
                            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <UserIcon className="size-4 text-muted-foreground" />
                                        <span>{booking.contact_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MailIcon className="size-4 text-muted-foreground" />
                                        <span>{booking.contact_email}</span>
                                    </div>
                                    {booking.contact_phone && (
                                        <div className="flex items-center gap-3">
                                            <PhoneIcon className="size-4 text-muted-foreground" />
                                            <span>{booking.contact_phone}</span>
                                        </div>
                                    )}
                                    {booking.contact_company && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">Company:</span>
                                            <span>{booking.contact_company}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Event Details */}
                            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Event Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="size-4 text-muted-foreground" />
                                        <span>
                                            {new Date(booking.event_date).toLocaleDateString("en-US", { dateStyle: "full" })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ClockIcon className="size-4 text-muted-foreground" />
                                        <span>
                                            {booking.start_time} - {booking.end_time}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">Event Type:</span>
                                        <Badge variant="outline" className="capitalize">
                                            {booking.event_type}
                                        </Badge>
                                    </div>
                                    {booking.expected_guests && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">Expected Guests:</span>
                                            <span>{booking.expected_guests}</span>
                                        </div>
                                    )}
                                    {booking.event && (
                                        <div className="mt-4 rounded-lg bg-muted/50 p-4">
                                            <p className="text-sm font-medium">Linked Event: {booking.event.title}</p>
                                        </div>
                                    )}
                                    {booking.venue && (
                                        <div className="mt-2 rounded-lg bg-muted/50 p-4">
                                            <p className="text-sm font-medium flex items-center gap-2">
                                                <MapPinIcon className="size-4" />
                                                {booking.venue.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">{booking.venue.address}</p>
                                        </div>
                                    )}
                                    {booking.performer && (
                                        <div className="mt-2 rounded-lg bg-muted/50 p-4">
                                            <p className="text-sm font-medium">Performer: {booking.performer.name}</p>
                                            {booking.performer.genres && (
                                                <div className="flex gap-1 mt-1">
                                                    {booking.performer.genres.map((g) => (
                                                        <Badge key={g} variant="secondary" className="text-xs">
                                                            {g}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {booking.notes && (
                                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {booking.notes}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar - Financial */}
                        <div className="space-y-6">
                            <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <DollarSignIcon className="size-4" />
                                        Financial Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>${financialBreakdown.subtotal?.toFixed(2) ?? "0.00"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Fees</span>
                                        <span>${financialBreakdown.fees?.toFixed(2) ?? "0.00"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Taxes</span>
                                        <span>${financialBreakdown.taxes?.toFixed(2) ?? "0.00"}</span>
                                    </div>
                                    {financialBreakdown.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount</span>
                                            <span>-${financialBreakdown.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-medium">
                                        <span>Total</span>
                                        <span>
                                            {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: booking.currency || "USD",
                                            }).format(financialBreakdown.total ?? booking.total_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Payment Status</span>
                                        <Badge variant="outline" className="capitalize">
                                            {booking.payment_status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
