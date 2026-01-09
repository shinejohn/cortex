import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Auth } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { Building, Calendar, DollarSign, Users, TrendingUp, Plus, Edit, BarChart3, MapPin } from "lucide-react";
import { useState } from "react";

interface Venue {
    id: string;
    name: string;
    image: string;
    address: string;
    city: string;
    state: string;
    status: string;
    total_bookings: number;
    upcoming_bookings: number;
    revenue: number;
}

interface Booking {
    id: string;
    event: {
        id: string;
        title: string;
        event_date: string;
    };
    client: {
        name: string;
    };
    status: string;
    payment_amount: number;
    payment_status: string;
}

interface Props {
    auth: Auth;
    venues: Venue[];
    upcomingBookings: Booking[];
    stats: {
        total_venues: number;
        total_bookings: number;
        total_revenue: number;
        upcoming_bookings: number;
    };
}

export default function VenueOwnerDashboard() {
    const { auth, venues, upcomingBookings, stats } = usePage<Props>().props;
    const [activeTab, setActiveTab] = useState<"overview" | "venues" | "bookings" | "analytics">("overview");

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Venue Owner Dashboard - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Header */}
            <div className="bg-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Venue Owner Dashboard</h1>
                            <p className="text-indigo-200 mt-1">Manage your venues and bookings</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Button
                                variant="outline"
                                className="bg-white text-indigo-700 hover:bg-indigo-50"
                                onClick={() => router.visit("/venues/submit")}
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add Venue
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
                        <TabsTrigger value="venues">Venues</TabsTrigger>
                        <TabsTrigger value="bookings">Bookings</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center">
                                            <Building className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-sm font-medium text-gray-500">Total Venues</h2>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.total_venues}</p>
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
                                            <h2 className="text-sm font-medium text-gray-500">Upcoming Bookings</h2>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.upcoming_bookings}</p>
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
                                            <h2 className="text-sm font-medium text-gray-500">Total Bookings</h2>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.total_bookings}</p>
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
                                    <Button className="w-full justify-start" onClick={() => router.visit("/venues/submit")}>
                                        <Plus className="h-5 w-5 mr-2" />
                                        Add New Venue
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => router.visit("/venues")}>
                                        <Building className="h-5 w-5 mr-2" />
                                        Browse All Venues
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

                    <TabsContent value="venues" className="mt-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">My Venues</h2>
                            <Button onClick={() => router.visit("/venues/submit")}>
                                <Plus className="h-5 w-5 mr-2" />
                                Add Venue
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {venues.map((venue) => (
                                <Card key={venue.id}>
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={venue.image || "https://images.unsplash.com/photo-1519167758481-83f29da9c0b2?w=400&h=300&fit=crop"}
                                            alt={venue.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                                            <Badge variant={venue.status === "active" ? "default" : "outline"}>{venue.status}</Badge>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 mb-4">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {venue.city}, {venue.state}
                                        </div>
                                        <div className="flex items-center justify-between text-sm mb-4">
                                            <div className="flex items-center text-gray-600">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {venue.upcoming_bookings} upcoming
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <DollarSign className="h-4 w-4 mr-1" />${venue.revenue.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" className="flex-1" onClick={() => router.visit(`/venues/${venue.id}`)}>
                                                View
                                            </Button>
                                            <Button variant="outline" className="flex-1" onClick={() => router.visit(`/venues/${venue.id}/edit`)}>
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="bookings" className="mt-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Upcoming Bookings</h2>
                        </div>

                        <div className="space-y-4">
                            {upcomingBookings.map((booking) => (
                                <Card key={booking.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{booking.event.title}</h3>
                                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {new Date(booking.event.event_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Users className="h-4 w-4 mr-1" />
                                                        {booking.client.name}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <DollarSign className="h-4 w-4 mr-1" />${booking.payment_amount.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex items-center space-x-2">
                                                <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>{booking.status}</Badge>
                                                <Badge variant={booking.payment_status === "paid" ? "default" : "outline"}>
                                                    {booking.payment_status}
                                                </Badge>
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
                                <CardTitle>Venue Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Analytics charts will be displayed here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer />
        </div>
    );
}
