import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckInFeed } from "@/components/check-in/CheckInFeed";
import { PlannedEventsWidget } from "@/components/check-in/PlannedEventsWidget";
import { Auth } from "@/types";
import { Link, router, usePage } from "@inertiajs/react";
import {
    Bell,
    Calendar,
    CheckCircle,
    Clock,
    Filter,
    Heart,
    MapPin,
    Music,
    Plus,
    Search,
    Settings,
    Star,
    Ticket,
    TrendingUp,
    User,
} from "lucide-react";
import { useState } from "react";

interface Artist {
    id: string;
    name: string;
    image: string;
    location: string;
    genre: string;
    upcoming_shows: number;
    is_verified: boolean;
    last_active: string;
    new_updates: number;
}

interface Show {
    id: string;
    artist_name: string;
    artist_image: string;
    event_name: string;
    date: string;
    venue_name: string;
    venue_location: string;
    ticket_price: number;
    distance: number;
    ticket_status: string;
    has_price_alert: boolean;
}

interface Content {
    id: string;
    title: string;
    image: string;
    artist_name: string;
    type: string;
    date: string;
    description: string;
    is_new: boolean;
}

interface Props {
    auth: Auth;
    artists: Artist[];
    upcomingShows: Show[];
    exclusiveContent: Content[];
    userActivity: {
        reviews: Array<{
            id: string;
            artist_name: string;
            event_name: string;
            rating: number;
            content: string;
            date: string;
            likes: number;
        }>;
        photos: Array<{
            id: string;
            image: string;
            artist_name: string;
            event_name: string;
            likes: number;
        }>;
        discussions: Array<{
            id: string;
            title: string;
            artist_name: string;
            replies: number;
            last_activity: string;
        }>;
        saved_items: Array<{
            id: string;
            title: string;
            image: string;
            artist_name: string;
            type: string;
            price: number;
            date?: string;
            event_name?: string;
            in_stock?: boolean;
        }>;
    };
}

export default function FanDashboard() {
    const { auth, artists, upcomingShows, exclusiveContent, userActivity } = usePage<Props>().props;
    const [activeTab, setActiveTab] = useState<"artists" | "shows" | "content" | "activity">("artists");
    const [artistSort, setArtistSort] = useState("recently-active");
    const [showView, setShowView] = useState<"list" | "calendar">("list");
    const [distanceFilter, setDistanceFilter] = useState("all");
    const [contentFilter, setContentFilter] = useState("all");

    const filteredShows = upcomingShows.filter((show) => {
        if (distanceFilter === "all") return true;
        if (distanceFilter === "local" && show.distance <= 50) return true;
        if (distanceFilter === "regional" && show.distance <= 200) return true;
        if (distanceFilter === "national" && show.distance > 200) return true;
        return false;
    });

    const sortedArtists = [...artists].sort((a, b) => {
        if (artistSort === "a-z") return a.name.localeCompare(b.name);
        if (artistSort === "most-shows") return b.upcoming_shows - a.upcoming_shows;
        return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
    });

    const filteredContent = exclusiveContent.filter((content) => {
        if (contentFilter === "all") return true;
        return content.type === contentFilter;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "My Fan Dashboard - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Dashboard Header */}
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">My Fan Dashboard</h1>
                            <p className="mt-1 text-indigo-200">Keep track of your favorite artists, upcoming shows, and exclusive content</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <Button variant="outline" className="bg-card text-primary hover:bg-accent/50">
                                <Bell className="h-5 w-5 mr-2" />
                                Notifications
                            </Button>
                            <Button variant="outline" className="bg-primary text-white hover:bg-primary">
                                <Settings className="h-5 w-5 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </div>

                    {/* Dashboard Navigation Tabs */}
                    <div className="mt-6">
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                            <TabsList className="bg-transparent text-white border-white/20">
                                <TabsTrigger value="artists" className="data-[state=active]:bg-primary">
                                    <Music className="mr-2 h-5 w-5" />
                                    My Artists
                                </TabsTrigger>
                                <TabsTrigger value="shows" className="data-[state=active]:bg-primary">
                                    <Ticket className="mr-2 h-5 w-5" />
                                    Upcoming Shows
                                </TabsTrigger>
                                <TabsTrigger value="content" className="data-[state=active]:bg-primary">
                                    <Star className="mr-2 h-5 w-5" />
                                    Exclusive Content
                                </TabsTrigger>
                                <TabsTrigger value="activity" className="data-[state=active]:bg-primary">
                                    <User className="mr-2 h-5 w-5" />
                                    My Activity
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* My Artists Section */}
                        {activeTab === "artists" && (
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">My Artists</h2>
                                    <div className="mt-3 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search artists"
                                                className="block w-full pl-10 pr-3 py-2 border border rounded-md bg-card placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <select
                                            value={artistSort}
                                            onChange={(e) => setArtistSort(e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="recently-active">Recently Active</option>
                                            <option value="a-z">A-Z</option>
                                            <option value="most-shows">Most Shows</option>
                                        </select>
                                        <Button>
                                            <Plus className="h-5 w-5 mr-2" />
                                            Follow New Artist
                                        </Button>
                                    </div>
                                </div>

                                {/* Artist Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sortedArtists.map((artist) => (
                                        <Card key={artist.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="relative h-48">
                                                <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                                                {artist.new_updates > 0 && (
                                                    <Badge className="absolute top-3 right-3 bg-red-500">
                                                        <Bell className="h-3 w-3 mr-1" />
                                                        {artist.new_updates} new
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                                                        {artist.name}
                                                        {artist.is_verified && <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />}
                                                    </h3>
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {artist.location}
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                                    <Music className="h-4 w-4 mr-1" />
                                                    {artist.genre}
                                                </div>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className="text-sm font-medium text-primary">
                                                        {artist.upcoming_shows} upcoming {artist.upcoming_shows === 1 ? "show" : "shows"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Last active {new Date(artist.last_active).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="mt-4 flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => router.visit(`/performers/${artist.id}`)}
                                                    >
                                                        View Profile
                                                    </Button>
                                                    <Button variant="outline" className="flex-1">
                                                        Unfollow
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Shows Section */}
                        {activeTab === "shows" && (
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">Upcoming Shows</h2>
                                    <div className="mt-3 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                                        <div className="flex border border rounded-md overflow-hidden">
                                            <Button variant={showView === "list" ? "default" : "ghost"} size="sm" onClick={() => setShowView("list")}>
                                                List
                                            </Button>
                                            <Button
                                                variant={showView === "calendar" ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setShowView("calendar")}
                                            >
                                                <Calendar className="h-5 w-5 mr-2" />
                                                Calendar
                                            </Button>
                                        </div>
                                        <select
                                            value={distanceFilter}
                                            onChange={(e) => setDistanceFilter(e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="all">All Locations</option>
                                            <option value="local">Local (≤ 50 miles)</option>
                                            <option value="regional">Regional (≤ 200 miles)</option>
                                            <option value="national">National (&gt; 200 miles)</option>
                                        </select>
                                        <Button variant="outline">
                                            <Filter className="h-5 w-5 mr-2" />
                                            More Filters
                                        </Button>
                                    </div>
                                </div>

                                {/* Shows List View */}
                                {showView === "list" && (
                                    <Card>
                                        <CardContent className="p-0">
                                            {filteredShows.length > 0 ? (
                                                <ul className="divide-y divide-gray-200">
                                                    {filteredShows.map((show) => (
                                                        <li key={show.id} className="px-4 py-4 sm:px-6 hover:bg-muted/50">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden">
                                                                        <img
                                                                            src={show.artist_image}
                                                                            alt={show.artist_name}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-primary">
                                                                            {formatDate(show.date)}
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">{formatTime(show.date)}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="ml-2 flex-shrink-0 flex">
                                                                    {show.has_price_alert && (
                                                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                                            Price Alert
                                                                        </Badge>
                                                                    )}
                                                                    <Badge
                                                                        variant={
                                                                            show.ticket_status === "Limited" || show.ticket_status === "Selling Fast"
                                                                                ? "destructive"
                                                                                : "default"
                                                                        }
                                                                        className="ml-2"
                                                                    >
                                                                        {show.ticket_status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 sm:flex sm:justify-between">
                                                                <div className="sm:flex">
                                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                                        <Music className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground" />
                                                                        <span className="font-medium text-foreground">{show.artist_name}</span>
                                                                    </div>
                                                                    <div className="mt-2 flex items-center text-sm text-muted-foreground sm:mt-0 sm:ml-6">
                                                                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground" />
                                                                        <p>
                                                                            {show.venue_name}, {show.venue_location}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 flex items-center text-sm text-muted-foreground sm:mt-0">
                                                                    <span>${show.ticket_price}</span>
                                                                    <Button size="sm" className="ml-4">
                                                                        Get Tickets
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex items-center text-sm text-muted-foreground">
                                                                <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground" />
                                                                <p>{show.distance.toFixed(1)} miles away</p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="px-4 py-12 text-center">
                                                    <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
                                                    <h3 className="mt-2 text-lg font-medium text-foreground">No shows found</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Try adjusting your filters or follow more artists to see their upcoming shows.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Exclusive Content Section */}
                        {activeTab === "content" && (
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">Exclusive Content</h2>
                                    <select
                                        value={contentFilter}
                                        onChange={(e) => setContentFilter(e.target.value)}
                                        className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="all">All Content</option>
                                        <option value="release">New Releases</option>
                                        <option value="post">Fan-Only Posts</option>
                                        <option value="presale">Early Access</option>
                                        <option value="virtual">Virtual Events</option>
                                    </select>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredContent.map((content) => (
                                        <Card key={content.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="relative h-48">
                                                <img src={content.image} alt={content.title} className="w-full h-full object-cover" />
                                                {content.is_new && <Badge className="absolute top-3 right-3 bg-green-500">NEW</Badge>}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                                    <div className="text-xs font-medium text-white uppercase">
                                                        {content.type === "release" && "New Release"}
                                                        {content.type === "post" && "Fan-Only Post"}
                                                        {content.type === "presale" && "Early Access"}
                                                        {content.type === "virtual" && "Virtual Event"}
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-white">{content.title}</h3>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Music className="h-4 w-4 mr-1" />
                                                    {content.artist_name}
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(content.date)}
                                                </div>
                                                <p className="mt-3 text-sm text-muted-foreground">{content.description}</p>
                                                <div className="mt-4 flex space-x-2">
                                                    <Button className="flex-1">
                                                        {content.type === "release" && "Listen Now"}
                                                        {content.type === "post" && "Read More"}
                                                        {content.type === "presale" && "Get Access"}
                                                        {content.type === "virtual" && "Join Event"}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* My Activity Section */}
                        {activeTab === "activity" && (
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-6">My Activity</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Reviews Written */}
                                    <Card>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>Reviews Written</CardTitle>
                                                <Badge>{userActivity.reviews.length}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {userActivity.reviews.length > 0 ? (
                                                <ul className="divide-y divide-gray-200">
                                                    {userActivity.reviews.map((review) => (
                                                        <li key={review.id} className="py-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <div className="text-sm font-medium text-primary">{review.artist_name}</div>
                                                                    <div className="mx-2 text-gray-300">•</div>
                                                                    <div className="text-sm text-muted-foreground">{review.event_name}</div>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <div className="flex items-center">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <div className="ml-2 text-sm text-muted-foreground">{formatDate(review.date)}</div>
                                                                </div>
                                                            </div>
                                                            <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                                                            <div className="mt-2 flex items-center justify-between">
                                                                <div className="flex items-center text-sm text-muted-foreground">
                                                                    <Heart className="h-4 w-4 mr-1 text-pink-500" />
                                                                    {review.likes} likes
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-center py-5 text-muted-foreground">You haven't written any reviews yet.</div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Photos Uploaded */}
                                    <Card>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>Photos Uploaded</CardTitle>
                                                <Badge>{userActivity.photos.length}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                {userActivity.photos.map((photo) => (
                                                    <div key={photo.id} className="relative group">
                                                        <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                                                            <img
                                                                src={photo.image}
                                                                alt={`Photo from ${photo.event_name}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-full">
                                                                <div className="text-white text-xs font-medium">{photo.artist_name}</div>
                                                                <div className="text-white text-xs opacity-80">{photo.event_name}</div>
                                                                <div className="mt-1 flex items-center text-xs text-white opacity-80">
                                                                    <Heart className="h-3 w-3 mr-1" />
                                                                    {photo.likes}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Planned Events Widget */}
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
                            <PlannedEventsWidget />
                        </div>

                        {/* Friends' Check-ins */}
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-4">Friends' Activity</h2>
                            <CheckInFeed checkIns={[]} />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
