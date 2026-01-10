import { router, usePage } from "@inertiajs/react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Cloud, CloudRain, MapPin, Sun } from "lucide-react";
import { useState } from "react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Auth } from "@/types";

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
    category: string;
    is_free: boolean;
    price_min: number;
    distance?: {
        miles: number;
        minutes: number;
    };
    weather?: string;
}

interface Props {
    auth: Auth;
    events: Event[];
    selectedDate?: string;
    viewMode: "month" | "today" | "7days" | "list";
}

export default function CalendarPage() {
    const { auth, events, selectedDate, viewMode: initialViewMode } = usePage<Props>().props;
    const [viewMode, setViewMode] = useState<"month" | "today" | "7days" | "list">(initialViewMode || "list");
    const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
        router.get("/calendar", { date: newDate.toISOString().split("T")[0], view: viewMode }, { preserveState: true });
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
        router.get("/calendar", { date: newDate.toISOString().split("T")[0], view: viewMode }, { preserveState: true });
    };

    const getWeatherIcon = (condition?: string) => {
        if (!condition) return null;
        switch (condition.toLowerCase()) {
            case "sunny":
                return <Sun className="h-5 w-5 text-yellow-500" />;
            case "cloudy":
                return <Cloud className="h-5 w-5 text-muted-foreground" />;
            case "rainy":
                return <CloudRain className="h-5 w-5 text-blue-400" />;
            default:
                return <Sun className="h-5 w-5 text-yellow-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Event Calendar - GoEventCity",
                    description: "Browse events by date, view upcoming events, and plan your schedule.",
                }}
            />
            <Header auth={auth} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Event Calendar</h1>
                        <p className="mt-1 text-muted-foreground">{events.length} events found</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        {viewMode === "month" && (
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-lg font-medium">
                                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                </span>
                                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* View Toggle */}
                <Tabs
                    value={viewMode}
                    onValueChange={(value) => {
                        setViewMode(value as any);
                        router.get("/calendar", { view: value }, { preserveState: true });
                    }}
                >
                    <TabsList>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="7days">7 Days</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="mt-6">
                        <div className="space-y-4">
                            {events.map((event) => (
                                <Card
                                    key={event.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => router.visit(`/events/${event.id}`)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden">
                                                <img
                                                    src={
                                                        event.image ||
                                                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"
                                                    }
                                                    alt={event.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {formatDate(event.event_date)}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        {event.time}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        {event.venue.name}
                                                    </div>
                                                    {event.distance && (
                                                        <div className="text-muted-foreground">{event.distance.miles.toFixed(1)} miles away</div>
                                                    )}
                                                    {event.weather && <div className="flex items-center">{getWeatherIcon(event.weather)}</div>}
                                                </div>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-sm font-medium text-primary">
                                                        {event.is_free ? "Free" : `$${event.price_min}+`}
                                                    </span>
                                                    <Button size="sm" variant="outline">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="month" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center text-muted-foreground">Calendar grid view will be implemented here</div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="today" className="mt-6">
                        <div className="space-y-4">
                            {events
                                .filter((event) => {
                                    const eventDate = new Date(event.event_date);
                                    const today = new Date();
                                    return (
                                        eventDate.getDate() === today.getDate() &&
                                        eventDate.getMonth() === today.getMonth() &&
                                        eventDate.getFullYear() === today.getFullYear()
                                    );
                                })
                                .map((event) => (
                                    <Card
                                        key={event.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => router.visit(`/events/${event.id}`)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden">
                                                    <img
                                                        src={
                                                            event.image ||
                                                            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"
                                                        }
                                                        alt={event.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            {event.time}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin className="h-4 w-4 mr-1" />
                                                            {event.venue.name}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="text-sm font-medium text-primary">
                                                            {event.is_free ? "Free" : `$${event.price_min}+`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="7days" className="mt-6">
                        <div className="space-y-4">
                            {events
                                .filter((event) => {
                                    const eventDate = new Date(event.event_date);
                                    const today = new Date();
                                    const sevenDaysLater = new Date(today);
                                    sevenDaysLater.setDate(today.getDate() + 7);
                                    return eventDate >= today && eventDate <= sevenDaysLater;
                                })
                                .map((event) => (
                                    <Card
                                        key={event.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => router.visit(`/events/${event.id}`)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden">
                                                    <img
                                                        src={
                                                            event.image ||
                                                            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"
                                                        }
                                                        alt={event.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            {formatDate(event.event_date)}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            {event.time}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin className="h-4 w-4 mr-1" />
                                                            {event.venue.name}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="text-sm font-medium text-primary">
                                                            {event.is_free ? "Free" : `$${event.price_min}+`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer />
        </div>
    );
}
