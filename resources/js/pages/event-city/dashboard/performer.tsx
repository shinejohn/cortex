import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Auth } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { Music, Calendar, DollarSign, Users, TrendingUp, Star, Plus, Edit, BarChart3, MapPin } from "lucide-react";
import { useState } from "react";

interface Gig {
    id: string;
    event: {
        id: string;
        title: string;
        event_date: string;
        venue: {
            name: string;
        };
    };
    status: string;
    payment_amount: number;
    payment_status: string;
}

interface Props {
    auth: Auth;
    performer: {
        id: string;
        name: string;
        image: string;
        rating: number;
        total_reviews: number;
        followers_count: number;
    };
    upcomingGigs: Gig[];
    pastGigs: Gig[];
    stats: {
        total_gigs: number;
        total_revenue: number;
        average_rating: number;
        upcoming_shows: number;
    };
}

export default function PerformerDashboard() {
    const { auth, performer, upcomingGigs, pastGigs, stats } = usePage<Props>().props;
    const [activeTab, setActiveTab] = useState<"overview" | "gigs" | "analytics" | "profile">("overview");

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: `Performer Dashboard - ${performer.name}`,
                }}
            />
            <Header auth={auth} />

            {/* Header */}
            <div className="bg-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center">
                            <div className="h-16 w-16 rounded-full overflow-hidden mr-4">
                                <img
                                    src={performer.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop"}
                                    alt={performer.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{performer.name}</h1>
                                <p className="text-purple-200 mt-1">Performer Dashboard</p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <Button
                                variant="outline"
                                className="bg-white text-purple-700 hover:bg-purple-50"
                                onClick={() => router.visit(`/performers/${performer.id}/edit`)}
                            >
                                <Edit className="h-5 w-5 mr-2" />
                                Edit Profile
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
                        <TabsTrigger value="gigs">Gigs</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-sm font-medium text-gray-500">Upcoming Shows</h2>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.upcoming_shows}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-green-600" />
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
                                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                                            <Star className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-sm font-medium text-gray-500">Average Rating</h2>
                                            <p className="text-2xl font-semibold text-gray-900">{stats.average_rating.toFixed(1)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-sm font-medium text-gray-500">Followers</h2>
                                            <p className="text-2xl font-semibold text-gray-900">{performer.followers_count.toLocaleString()}</p>
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
                                    <Button variant="outline" className="w-full justify-start" onClick={() => router.visit("/performers/discovery")}>
                                        <Music className="h-5 w-5 mr-2" />
                                        Browse Gigs
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.visit(`/performers/${performer.id}/edit`)}
                                    >
                                        <Edit className="h-5 w-5 mr-2" />
                                        Edit Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.visit("/performers/market-report")}
                                    >
                                        <BarChart3 className="h-5 w-5 mr-2" />
                                        View Market Report
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

                    <TabsContent value="gigs" className="mt-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Gigs</h2>
                            <Button onClick={() => router.visit("/performers/discovery")}>
                                <Plus className="h-5 w-5 mr-2" />
                                Find New Gigs
                            </Button>
                        </div>

                        <Tabs defaultValue="upcoming">
                            <TabsList>
                                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                                <TabsTrigger value="past">Past</TabsTrigger>
                            </TabsList>

                            <TabsContent value="upcoming" className="mt-6">
                                <div className="space-y-4">
                                    {upcomingGigs.map((gig) => (
                                        <Card key={gig.id}>
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">{gig.event.title}</h3>
                                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <Calendar className="h-4 w-4 mr-1" />
                                                                {new Date(gig.event.event_date).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <MapPin className="h-4 w-4 mr-1" />
                                                                {gig.event.venue.name}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <DollarSign className="h-4 w-4 mr-1" />${gig.payment_amount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex items-center space-x-2">
                                                        <Badge variant={gig.status === "confirmed" ? "default" : "outline"}>{gig.status}</Badge>
                                                        <Badge variant={gig.payment_status === "paid" ? "default" : "outline"}>
                                                            {gig.payment_status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="past" className="mt-6">
                                <div className="space-y-4">
                                    {pastGigs.map((gig) => (
                                        <Card key={gig.id}>
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">{gig.event.title}</h3>
                                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <Calendar className="h-4 w-4 mr-1" />
                                                                {new Date(gig.event.event_date).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <MapPin className="h-4 w-4 mr-1" />
                                                                {gig.event.venue.name}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <DollarSign className="h-4 w-4 mr-1" />${gig.payment_amount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">{gig.status}</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Analytics charts will be displayed here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="profile" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">Profile information will be displayed here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer />
        </div>
    );
}
