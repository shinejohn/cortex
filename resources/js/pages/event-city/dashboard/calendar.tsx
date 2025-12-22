import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Auth } from "@/types";
import { router, usePage } from "@inertiajs/react";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    MapPin,
    Clock,
    Users,
} from "lucide-react";
import { useState } from "react";

interface CalendarEvent {
    id: string;
    title: string;
    event_date: string;
    start_time: string;
    end_time: string;
    venue: {
        name: string;
        address: string;
    };
    type: "event" | "booking" | "gig";
    status: string;
}

interface Props {
    auth: Auth;
    events: CalendarEvent[];
    currentDate: string;
}

export default function CalendarDashboard() {
    const { auth, events, currentDate } = usePage<Props>().props;
    const [selectedDate, setSelectedDate] = useState(new Date(currentDate));
    const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return events.filter((event) => event.event_date.startsWith(dateStr));
    };

    const navigateMonth = (direction: "prev" | "next") => {
        const newDate = new Date(selectedDate);
        if (direction === "prev") {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setSelectedDate(newDate);
    };

    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Calendar Dashboard - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Header */}
            <div className="bg-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Calendar Dashboard</h1>
                            <p className="text-indigo-200 mt-1">View and manage all your events in one place</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Button variant="outline" className="bg-white text-indigo-700 hover:bg-indigo-50" onClick={() => router.visit("/events/create")}>
                                <Plus className="h-5 w-5 mr-2" />
                                Create Event
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <CardTitle>
                                    {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                                <TabsList>
                                    <TabsTrigger value="month">Month</TabsTrigger>
                                    <TabsTrigger value="week">Week</TabsTrigger>
                                    <TabsTrigger value="day">Day</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {viewMode === "month" && (
                            <div className="mt-6">
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {weekDays.map((day) => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square"></div>
                                    ))}
                                    {days.map((day) => {
                                        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                                        const dayEvents = getEventsForDate(date);
                                        const isToday = date.toDateString() === new Date().toDateString();

                                        return (
                                            <div
                                                key={day}
                                                className={`aspect-square border border-gray-200 rounded p-1 ${
                                                    isToday ? "bg-indigo-50 border-indigo-300" : "bg-white"
                                                }`}
                                            >
                                                <div className={`text-sm font-medium mb-1 ${isToday ? "text-indigo-700" : "text-gray-900"}`}>
                                                    {day}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayEvents.slice(0, 2).map((event) => (
                                                        <div
                                                            key={event.id}
                                                            className="text-xs p-1 rounded bg-indigo-100 text-indigo-800 truncate cursor-pointer hover:bg-indigo-200"
                                                            onClick={() => router.visit(`/events/${event.id}`)}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 2 && (
                                                        <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {viewMode === "week" && (
                            <div className="mt-6">
                                <p className="text-gray-600">Week view will be displayed here</p>
                            </div>
                        )}

                        {viewMode === "day" && (
                            <div className="mt-6">
                                <p className="text-gray-600">Day view will be displayed here</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Events List */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {events.slice(0, 10).map((event) => (
                                <div key={event.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.visit(`/events/${event.id}`)}>
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                                            <CalendarIcon className="h-6 w-6 text-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {new Date(event.event_date).toLocaleDateString()} {event.start_time}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {event.venue.name}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={event.status === "confirmed" ? "default" : "outline"}>{event.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    );
}

