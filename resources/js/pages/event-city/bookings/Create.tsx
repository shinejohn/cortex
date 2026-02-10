import { Head, Link, useForm } from "@inertiajs/react";
import { CalendarIcon, ClockIcon, DollarSignIcon, UserIcon } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "@/layouts/form-layout";

interface Event {
    id: string;
    title: string;
    event_date: string;
    venue_id: string | null;
    performer_id: string | null;
    venue?: { id: string; name: string };
    performer?: { id: string; name: string };
}

interface Venue {
    id: string;
    name: string;
    address: string;
    capacity: number;
    price_per_hour: number | null;
    price_per_event: number | null;
    price_per_day: number | null;
}

interface Performer {
    id: string;
    name: string;
    genres: string[];
    base_price: number | null;
    minimum_booking_hours: number | null;
}

interface Props {
    events: Event[];
    venues: Venue[];
    performers: Performer[];
    bookingType: string;
    steps: string[];
    currentStep: string;
}

export default function CreateBooking({ events, venues, performers, bookingType, steps, currentStep }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        booking_type: bookingType || "event",
        event_id: "",
        venue_id: "",
        performer_id: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        contact_company: "",
        event_date: "",
        start_time: "",
        end_time: "",
        event_type: "public",
        expected_guests: "",
        expected_audience: "",
        ticket_quantity: "",
        ticket_type: "general",
        price_per_ticket: "",
        total_amount: "0",
        currency: "USD",
        notes: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("bookings.store") as string);
    };

    return (
        <FormLayout
            title="Create New Booking"
            description="Set up a new booking for an event, venue, or performer"
            backHref={route("bookings.index") as string}
            backLabel="Back to Bookings"
        >
            {/* Workflow Steps */}
            <div className="mb-6 flex gap-2 flex-wrap">
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

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Booking Type */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Booking Type</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="booking_type">Type *</Label>
                            <Select value={data.booking_type} onValueChange={(v) => setData("booking_type", v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="event">Event Booking</SelectItem>
                                    <SelectItem value="venue">Venue Booking</SelectItem>
                                    <SelectItem value="performer">Performer Booking</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.booking_type && <p className="mt-1 text-sm text-destructive">{errors.booking_type}</p>}
                        </div>

                        {data.booking_type === "event" && (
                            <div>
                                <Label htmlFor="event_id">Select Event *</Label>
                                <Select value={data.event_id} onValueChange={(v) => setData("event_id", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Choose an event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {events.map((event) => (
                                            <SelectItem key={event.id} value={event.id}>
                                                {event.title} - {new Date(event.event_date).toLocaleDateString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.event_id && <p className="mt-1 text-sm text-destructive">{errors.event_id}</p>}
                            </div>
                        )}

                        {data.booking_type === "venue" && (
                            <div>
                                <Label htmlFor="venue_id">Select Venue *</Label>
                                <Select value={data.venue_id} onValueChange={(v) => setData("venue_id", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Choose a venue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {venues.map((venue) => (
                                            <SelectItem key={venue.id} value={venue.id}>
                                                {venue.name} - {venue.address} (Cap: {venue.capacity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.venue_id && <p className="mt-1 text-sm text-destructive">{errors.venue_id}</p>}
                            </div>
                        )}

                        {data.booking_type === "performer" && (
                            <div>
                                <Label htmlFor="performer_id">Select Performer *</Label>
                                <Select value={data.performer_id} onValueChange={(v) => setData("performer_id", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Choose a performer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {performers.map((performer) => (
                                            <SelectItem key={performer.id} value={performer.id}>
                                                {performer.name} - {performer.genres?.join(", ")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.performer_id && <p className="mt-1 text-sm text-destructive">{errors.performer_id}</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="size-4" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="contact_name">Contact Name *</Label>
                                <Input
                                    id="contact_name"
                                    value={data.contact_name}
                                    onChange={(e) => setData("contact_name", e.target.value)}
                                    className="mt-1"
                                    placeholder="Full name"
                                />
                                {errors.contact_name && <p className="mt-1 text-sm text-destructive">{errors.contact_name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="contact_email">Contact Email *</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={data.contact_email}
                                    onChange={(e) => setData("contact_email", e.target.value)}
                                    className="mt-1"
                                    placeholder="email@example.com"
                                />
                                {errors.contact_email && <p className="mt-1 text-sm text-destructive">{errors.contact_email}</p>}
                            </div>
                            <div>
                                <Label htmlFor="contact_phone">Phone</Label>
                                <Input
                                    id="contact_phone"
                                    value={data.contact_phone}
                                    onChange={(e) => setData("contact_phone", e.target.value)}
                                    className="mt-1"
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                            <div>
                                <Label htmlFor="contact_company">Company</Label>
                                <Input
                                    id="contact_company"
                                    value={data.contact_company}
                                    onChange={(e) => setData("contact_company", e.target.value)}
                                    className="mt-1"
                                    placeholder="Company name"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Date & Time */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="size-4" />
                            Date & Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="event_date">Event Date *</Label>
                                <Input
                                    id="event_date"
                                    type="date"
                                    value={data.event_date}
                                    onChange={(e) => setData("event_date", e.target.value)}
                                    className="mt-1"
                                />
                                {errors.event_date && <p className="mt-1 text-sm text-destructive">{errors.event_date}</p>}
                            </div>
                            <div>
                                <Label htmlFor="start_time">Start Time *</Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData("start_time", e.target.value)}
                                    className="mt-1"
                                />
                                {errors.start_time && <p className="mt-1 text-sm text-destructive">{errors.start_time}</p>}
                            </div>
                            <div>
                                <Label htmlFor="end_time">End Time *</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData("end_time", e.target.value)}
                                    className="mt-1"
                                />
                                {errors.end_time && <p className="mt-1 text-sm text-destructive">{errors.end_time}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="event_type">Event Type *</Label>
                                <Select value={data.event_type} onValueChange={(v) => setData("event_type", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="expected_guests">Expected Guests</Label>
                                <Input
                                    id="expected_guests"
                                    type="number"
                                    min="1"
                                    value={data.expected_guests}
                                    onChange={(e) => setData("expected_guests", e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSignIcon className="size-4" />
                            Pricing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="total_amount">Total Amount *</Label>
                                <Input
                                    id="total_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.total_amount}
                                    onChange={(e) => setData("total_amount", e.target.value)}
                                    className="mt-1"
                                />
                                {errors.total_amount && <p className="mt-1 text-sm text-destructive">{errors.total_amount}</p>}
                            </div>
                            <div>
                                <Label htmlFor="currency">Currency *</Label>
                                <Select value={data.currency} onValueChange={(v) => setData("currency", v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            rows={4}
                            placeholder="Any special requests or notes for this booking..."
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href={route("bookings.index") as string}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? "Creating..." : "Create Booking"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}
