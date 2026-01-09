import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Auth } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { Calendar, DollarSign, Users, TrendingUp, Plus, Edit, Eye, BarChart3, Ticket, MapPin } from "lucide-react";
import { useState } from "react";

interface Event {
    id: string;
    title: string;
    event_date: string;
    venue: {
        name: string;
    };
    status: string;
    ticket_sales: number;
    revenue: number;
    attendance: number;
}

interface Props {
    auth: Auth;
    events: Event[];
    stats: {
        total_events: number;
        upcoming_events: number;
        total_revenue: number;
        total_attendees: number;
        ticket_sales: number;
    };
}

export default function OrganizerDashboard() {
    const { auth, events, stats } = usePage<Props>().props;
    const [activeTab, setActiveTab] = useState<"overview" | "events" | "analytics" | "settings">("overview");

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Organizer Dashboard - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Header */}
            <div className="bg-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
                            <p className="text-indigo-200 mt-1">Manage your events and track performance</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Button
                                variant="outline"
                                className="bg-white text-indigo-700 hover:bg-indigo-50"
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
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-sm font-medium text-gray-500">Total Events</h2>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.total_events}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-sm font-medium text-gray-500">Upcoming Events</h2>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.upcoming_events}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-sm font-medium text-gray-500">Total Revenue</h2>
                                            <p className="text-2xl font-semibold text-gray-900">${stats.total_revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-sm font-medium text-gray-500">Total Attendees</h2>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.total_attendees.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button className="w-full justify-start" onClick={() => router.visit("/events/create")}>
                                        <Plus className="h-5 w-5 mr-2" />
                                        Create New Event
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => router.visit("/venues")}>
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Find Venues
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => router.visit("/performers/discovery")}>
                                        <Users className="h-5 w-5 mr-2" />
                                        Find Performers
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">Recent activity will be displayed here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="events" className="mt-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
                            <Button onClick={() => router.visit("/events/create")}>
                                <Plus className="h-5 w-5 mr-2" />
                                Create Event
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {events.map((event) => (
                                <Card key={event.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                    <Badge variant={event.status === "published" ? "default" : "outline"}>{event.status}</Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {new Date(event.event_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        {event.venue.name}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Ticket className="h-4 w-4 mr-1" />
                                                        {event.ticket_sales} tickets sold
                                                    </div>
                                                    <div className="flex items-center">
                                                        <DollarSign className="h-4 w-4 mr-1" />${event.revenue.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => router.visit(`/events/${event.id}`)}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => router.visit(`/events/${event.id}/edit`)}>
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Analytics charts will be displayed here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Organizer Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">Settings will be displayed here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer />
        </div>
    );
}
