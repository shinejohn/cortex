import { Link, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Check,
    CheckCircle,
    Clock,
    DollarSign,
    ExternalLink,
    Heart,
    MapPin,
    MessageCircle,
    Music,
    Share2,
    Star,
    Ticket,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";
import FollowButton from "@/components/shared/FollowButton";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SharedData } from "@/types";

interface VenueShowProps extends SharedData {
    venue: {
        id: number;
        name: string;
        description: string;
        venue_type: string;
        capacity: number;
        average_rating: number;
        total_reviews: number;
        images: string[];
        verified: boolean;
        address: string;
        neighborhood: string;
        latitude: number;
        longitude: number;
        amenities: string[];
        event_types: string[];
        price_per_hour: number;
        price_per_event: number;
        price_per_day: number;
        unavailable_dates: string[];
        response_time_hours: number;
        last_booked_days_ago: number;
        listed_date: string;
        approvedReviews: Array<{
            id: number;
            content: string;
            rating: number;
            user: {
                name: string;
                avatar?: string;
            };
            created_at: string;
        }>;
        events: Array<{
            id: number;
            name: string;
            description: string;
            event_date: string;
            start_time: string;
            end_time: string;
            image?: string;
            ticket_price: number;
        }>;
    };
    ratingStats: {
        average: number;
        total: number;
        distribution: number[];
        by_context: {
            service: number;
            quality: number;
            value: number;
            overall: number;
        };
    };
    isFollowing: boolean;
}

export default function VenueShow() {
    const { venue, ratingStats, auth, isFollowing } = usePage<VenueShowProps>().props;

    const [activeTab, setActiveTab] = useState("overview");
    const [showContactForm, setShowContactForm] = useState(false);

    // Handle back navigation
    const handleBack = () => {
        window.history.back();
    };

    // Handle share functionality
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: venue.name,
                    text: venue.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    // Handle contact
    const handleContact = () => {
        setShowContactForm(true);
    };

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-card">
            <SEO
                type="venue"
                site="event-city"
                data={{
                    title: venue.name,
                    name: venue.name,
                    description: venue.description,
                    image: venue.images?.[0] || null,
                    url: `/venues/${venue.id}`,
                    address: venue.address,
                    neighborhood: venue.neighborhood,
                    latitude: venue.latitude,
                    longitude: venue.longitude,
                    capacity: venue.capacity,
                    venueType: venue.venue_type,
                    rating: venue.average_rating,
                    reviewCount: venue.total_reviews,
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="relative h-96 overflow-hidden">
                <img src={venue.images[0] || "/images/venue-placeholder.jpg"} alt={venue.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-white">
                            <Button variant="ghost" onClick={handleBack} className="mb-4 text-white hover:text-gray-200 hover:bg-card/10 p-2">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Venues
                            </Button>
                            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                                {venue.name}
                                {venue.verified && (
                                    <Badge className="bg-accent text-primary">
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                                <FollowButton
                                    followableType="venue"
                                    followableId={String(venue.id)}
                                    initialFollowing={isFollowing}
                                    isAuthenticated={!!auth?.user}
                                    className="text-white border-white/50 hover:bg-white/20"
                                />
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-lg">
                                <div className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    {venue.address}
                                </div>
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 mr-2" />
                                    Capacity: {venue.capacity}
                                </div>
                                <div className="flex items-center">
                                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                                    {venue.average_rating ? Number(venue.average_rating).toFixed(1) : "0.0"} ({venue.total_reviews || 0} reviews)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Context Bar */}
            <div className="bg-accent/50 py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center text-sm">
                            <Music className="h-4 w-4 text-indigo-500 mr-1" />
                            <span className="font-medium text-gray-800">Popular {venue.venue_type}</span>
                        </div>
                        <div className="flex items-center text-sm text-foreground">
                            <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                            {venue.neighborhood}
                        </div>
                        <div className="flex items-center text-sm text-foreground">
                            <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                            From ${venue.price_per_hour}/hour
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        {/* Primary Information */}
                        <Card className="mb-8">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Pricing</h3>
                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Per Hour</span>
                                                <span className="font-medium">${venue.price_per_hour.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Per Event</span>
                                                <span className="font-medium">${venue.price_per_event.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Per Day</span>
                                                <span className="font-medium">${venue.price_per_day.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Venue Type</h3>
                                        <Badge variant="secondary">{venue.venue_type}</Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Capacity</h3>
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 text-muted-foreground mr-1" />
                                            <p className="text-base font-medium">{venue.capacity} people</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Response Time</h3>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                                            <p className="text-base font-medium">Within {venue.response_time_hours} hours</p>
                                        </div>
                                    </div>
                                </div>

                                {venue.event_types && venue.event_types.length > 0 && (
                                    <div className="border-t border pt-6">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Perfect for</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {venue.event_types.slice(0, 6).map((type, index) => (
                                                <Badge key={index} variant="outline">
                                                    {type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            <Button onClick={handleContact} className="flex-1">
                                <MessageCircle className="h-5 w-5 mr-2" />
                                Contact Venue
                            </Button>
                            <FollowButton
                                followableType="venue"
                                followableId={venue.id.toString()}
                                variant="default"
                                initialFollowing={isFollowing}
                            />
                            <Button variant="outline" onClick={handleShare}>
                                <Share2 className="h-5 w-5 mr-2" />
                                Share
                            </Button>
                        </div>

                        {/* Content Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                                <TabsTrigger value="photos">Photos</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About This Venue</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-foreground leading-relaxed mb-6">
                                            {venue.description || "No description available for this venue."}
                                        </p>

                                        {venue.events && venue.events.length > 0 && (
                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-medium text-foreground">Upcoming Events</h4>
                                                    <Button variant="ghost" size="sm" className="text-primary">
                                                        View all <ArrowRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-4">
                                                    {venue.events.slice(0, 3).map((event) => (
                                                        <Link
                                                            key={event.id}
                                                            href={`/events/${event.id}`}
                                                            className="flex items-start hover:bg-muted/50 p-3 -mx-3 rounded-md"
                                                        >
                                                            <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                                                <img
                                                                    src={event.image || "/images/event-placeholder.jpg"}
                                                                    alt={event.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="ml-3 flex-1">
                                                                <h5 className="text-sm font-medium text-foreground line-clamp-1">{event.name}</h5>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatEventDate(event.event_date)} • {event.start_time}
                                                                </p>
                                                                <div className="mt-1 flex items-center justify-between">
                                                                    <span className="text-xs text-muted-foreground">${event.ticket_price}</span>
                                                                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                                                                        View Event
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="amenities" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Amenities & Features</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {venue.amenities && venue.amenities.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {venue.amenities.map((amenity, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                        <span className="text-foreground">{amenity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No amenities information available</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="photos" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Photo Gallery</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {venue.images && venue.images.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {venue.images.map((image, index) => (
                                                    <div key={index} className="aspect-video overflow-hidden rounded-lg">
                                                        <img
                                                            src={image}
                                                            alt={`${venue.name} - Image ${index + 1}`}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No photos available</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle>Reviews & Ratings</CardTitle>
                                            <Button variant="outline">Write a Review</Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center mb-6">
                                            <div className="text-center mr-8">
                                                <div className="text-3xl font-bold text-foreground">
                                                    {venue.average_rating ? Number(venue.average_rating).toFixed(1) : "0.0"}
                                                </div>
                                                <div className="flex items-center justify-center mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < Math.floor(Number(venue.average_rating) || 0)
                                                                    ? "text-yellow-400 fill-current"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{venue.total_reviews || 0} reviews</div>
                                            </div>
                                            {ratingStats?.by_context && (
                                                <div className="flex-1">
                                                    <div className="space-y-2">
                                                        {Object.entries(ratingStats.by_context).map(([key, rating]) => (
                                                            <div key={key} className="flex items-center">
                                                                <span className="w-16 text-xs text-muted-foreground capitalize">{key}</span>
                                                                <div className="flex-1 h-2 bg-muted rounded-full mx-2">
                                                                    <div
                                                                        className="h-2 bg-primary rounded-full"
                                                                        style={{ width: `${rating ? (Number(rating) / 5) * 100 : 0}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs font-medium text-foreground">
                                                                    {rating ? Number(rating).toFixed(1) : "0.0"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {venue.approvedReviews && venue.approvedReviews.length > 0 ? (
                                                venue.approvedReviews.slice(0, 3).map((review) => (
                                                    <div key={review.id} className="border-b border pb-4 last:border-b-0">
                                                        <div className="flex items-start">
                                                            <div className="h-8 w-8 rounded-full bg-muted overflow-hidden mr-3">
                                                                <img
                                                                    src={
                                                                        review.user.avatar ||
                                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name)}`
                                                                    }
                                                                    alt={review.user.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h5 className="font-medium text-foreground">{review.user.name}</h5>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {new Date(review.created_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center mt-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`h-3 w-3 ${
                                                                                i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                                                            }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <p className="text-sm text-foreground mt-2">{review.content}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted-foreground">No reviews yet</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div>
                        {/* Venue Information */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                                    Venue Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-foreground">{venue.name}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{venue.address}</p>
                                        <p className="text-xs text-muted-foreground">{venue.neighborhood}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Capacity</span>
                                        <span className="font-medium">{venue.capacity} people</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Response time</span>
                                        <span className="font-medium">~{venue.response_time_hours}h</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Starting price</span>
                                        <span className="font-medium">${venue.price_per_hour}/hr</span>
                                    </div>
                                </div>
                                <Separator />
                                <Button onClick={handleContact} className="w-full">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Contact Venue
                                </Button>
                                <FollowButton
                                    followableType="venue"
                                    followableId={venue.id.toString()}
                                    variant="text"
                                    className="w-full"
                                    initialFollowing={isFollowing}
                                />
                            </CardContent>
                        </Card>

                        {/* Map Card */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                                    Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <MapPin className="h-8 w-8 mx-auto mb-2" />
                                        <p className="text-sm">Map would be embedded here</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <a
                                        href={`https://maps.google.com/?q=${venue.latitude},${venue.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Get Directions
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Upcoming Events */}
                        {venue.events && venue.events.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Ticket className="h-5 w-5 text-indigo-500 mr-2" />
                                        Upcoming Events
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {venue.events.slice(0, 3).map((event) => (
                                        <Link
                                            key={event.id}
                                            href={`/events/${event.id}`}
                                            className="flex items-start hover:bg-muted/50 p-2 -mx-2 rounded-md"
                                        >
                                            <div className="flex-shrink-0 w-10 text-center">
                                                <div className="text-sm font-bold text-foreground">{new Date(event.event_date).getDate()}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(event.event_date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                    })}
                                                </div>
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h5 className="text-sm font-medium text-foreground line-clamp-1">{event.name}</h5>
                                                <div className="text-xs text-muted-foreground flex items-center mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {event.start_time}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">${event.ticket_price}</div>
                                            </div>
                                        </Link>
                                    ))}
                                    <Separator />
                                    <Button variant="ghost" size="sm" className="w-full text-primary">
                                        View all events
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Contact {venue.name}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setShowContactForm(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        className="w-full px-3 py-2 border border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full px-3 py-2 border border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                                    <textarea
                                        rows={4}
                                        placeholder="What would you like to know about this venue?"
                                        className="w-full px-3 py-2 border border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <Button variant="outline" onClick={() => setShowContactForm(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowContactForm(false);
                                        alert("Your message has been sent! The venue will respond shortly.");
                                    }}
                                >
                                    Send Message
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Footer />
        </div>
    );
}
