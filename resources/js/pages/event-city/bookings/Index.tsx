import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FilterIcon,
    PlusIcon,
    SearchIcon,
} from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";

interface Event {
    id: string;
    title: string;
}

interface Venue {
    id: string;
    name: string;
}

interface Performer {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
}

interface Booking {
    id: string;
    booking_number: string;
    booking_type: "event" | "venue" | "performer";
    status: string;
    payment_status: string;
    contact_name: string;
    contact_email: string;
    event_date: string;
    total_amount: number;
    currency: string;
    created_at: string;
    event?: Event;
    venue?: Venue;
    performer?: Performer;
    createdBy?: User;
}

interface PaginatedBookings {
    data: Booking[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    status?: string;
    booking_type?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
}

interface Sort {
    sort: string;
    direction: string;
}

interface Props {
    bookings: PaginatedBookings;
    filters: Filters;
    sort: Sort;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    rejected: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

export default function BookingsIndex({ bookings, filters, sort }: Props) {
    const [search, setSearch] = useState(filters.search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route("bookings.index") as string,
            { ...filters, search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route("bookings.index") as string,
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSort = (column: string) => {
        const direction = sort.sort === column && sort.direction === "asc" ? "desc" : "asc";
        router.get(
            route("bookings.index") as string,
            { ...filters, sort: column, direction },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AppLayout>
            <Head title="Bookings" />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-display text-2xl font-black tracking-tight text-foreground">
                                Bookings
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage your event, venue, and performer bookings
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={route("bookings.create") as string}>
                                <PlusIcon className="mr-2 size-4" />
                                New Booking
                            </Link>
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by booking number, contact name, or email..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </form>
                                <Select
                                    value={filters.status || ""}
                                    onValueChange={(v) => handleFilterChange("status", v)}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.booking_type || ""}
                                    onValueChange={(v) => handleFilterChange("booking_type", v)}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="event">Event</SelectItem>
                                        <SelectItem value="venue">Venue</SelectItem>
                                        <SelectItem value="performer">Performer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th
                                            className="cursor-pointer px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground"
                                            onClick={() => handleSort("booking_number")}
                                        >
                                            Booking #
                                        </th>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                                            Contact
                                        </th>
                                        <th
                                            className="cursor-pointer px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground"
                                            onClick={() => handleSort("event_date")}
                                        >
                                            Event Date
                                        </th>
                                        <th
                                            className="cursor-pointer px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground"
                                            onClick={() => handleSort("status")}
                                        >
                                            Status
                                        </th>
                                        <th
                                            className="cursor-pointer px-4 py-3 text-right text-[10px] uppercase tracking-widest font-black text-muted-foreground"
                                            onClick={() => handleSort("total_amount")}
                                        >
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                                No bookings found. Create your first booking to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        bookings.data.map((booking) => (
                                            <tr
                                                key={booking.id}
                                                className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => router.visit(route("bookings.show", booking.id) as string)}
                                            >
                                                <td className="px-4 py-3 font-mono text-sm font-medium">
                                                    {booking.booking_number}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className="capitalize">
                                                        {booking.booking_type}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium">{booking.contact_name}</div>
                                                    <div className="text-xs text-muted-foreground">{booking.contact_email}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {new Date(booking.event_date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                                            statusColors[booking.status] || "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-medium">
                                                    {new Intl.NumberFormat("en-US", {
                                                        style: "currency",
                                                        currency: booking.currency || "USD",
                                                    }).format(booking.total_amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {bookings.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(bookings.current_page - 1) * bookings.per_page + 1} to{" "}
                                    {Math.min(bookings.current_page * bookings.per_page, bookings.total)} of{" "}
                                    {bookings.total} bookings
                                </p>
                                <div className="flex gap-1">
                                    {bookings.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
