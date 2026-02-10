import { router, usePage } from "@inertiajs/react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Users } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Auth } from "@/types";

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
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Calendar Dashboard - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Header */}
            <div className="relative bg-primary text-white overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="font-display text-3xl font-black tracking-tight">Calendar Dashboard</h1>
                            <p className="text-indigo-200 mt-1">View and manage all your events in one place</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Button
                                variant="outline"
                                className="bg-card text-primary hover:bg-accent/50"
                                onClick={() => router.visit("/events/create")}
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Event
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <CardTitle>{selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</CardTitle>
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
                                        <div key={day} className="text-center text-sm font-medium text-foreground py-2">
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
                                                className={`aspect-square border rounded p-1 ${
                                                    isToday ? "bg-accent/50 border-primary/30" : "bg-card"
                                                }`}
                                            >
                                                <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>
                                                    {day}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayEvents.slice(0, 2).map((event) => (
                                                        <div
                                                            key={event.id}
                                                            className="text-xs p-1 rounded bg-accent text-primary/80 truncate cursor-pointer hover:bg-accent/80"
                                                            onClick={() => router.visit(`/events/${event.id}`)}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 2 && (
                                                        <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
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
                                <p className="text-muted-foreground">Week view will be displayed here</p>
                            </div>
                        )}

                        {viewMode === "day" && (
                            <div className="mt-6">
                                <p className="text-muted-foreground">Day view will be displayed here</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Events List */}
                <Card className="mt-8 overflow-hidden border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {events.slice(0, 10).map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => router.visit(`/events/${event.id}`)}
                                >
                                    <div className="shrink-0">
                                        <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                                            <CalendarIcon className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
