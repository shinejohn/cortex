import { Link, router } from "@inertiajs/react";
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    ChevronDown,
    Clock,
    Cloud,
    CloudRain,
    Edit,
    Flame,
    Heart,
    MapPin,
    Share2,
    Sun,
    Ticket,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";
import { CheckInButton } from "@/components/check-in/CheckInButton";
import { CheckInFeed } from "@/components/check-in/CheckInFeed";
import FollowButton from "@/components/shared/FollowButton";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Auth } from "@/types";

interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    time: string;
    image: string;
    category: string;
    badges: string[];
    subcategories: string[];
    is_free: boolean;
    price_min: number;
    price_max: number;
    weather?: {
        temperature: number;
        condition: string;
        description: string;
        icon: string;
    };
    venue: {
        id: string;
        name: string;
        address: string;
        neighborhood: string;
        latitude: number;
        longitude: number;
    };
    performer: {
        id: string;
        name: string;
        bio: string;
        image: string;
        verified: boolean;
    };
    ticket_plans: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        max_quantity: number;
        available_quantity: number;
        is_active: boolean;
    }>;
}

interface SimilarEvent {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: string;
    category: string;
    image: string;
}

interface Props {
    auth: Auth;
    event: Event;
    similarEvents: SimilarEvent[];
    isFollowing: boolean;
    canEdit: boolean;
    isCheckedIn?: boolean;
    recentCheckIns?: Array<{
        id: string;
        user: {
            id: string;
            name: string;
            avatar: string;
        };
        checked_in_at: string;
        notes?: string;
    }>;
}

export default function EventDetail({ auth, event, similarEvents, isFollowing, canEdit, isCheckedIn = false, recentCheckIns = [] }: Props) {
    const [activeTab, setActiveTab] = useState("overview");
    const [_showCheckInModal, _setShowCheckInModal] = useState(false);

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatEventTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(":");
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const handleGetTickets = () => {
        router.visit(route('events.tickets.selection', event.id) as any);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: `Check out ${event.title}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const getTicketStatus = () => {
        const hasTickets = event.ticket_plans && event.ticket_plans.length > 0;

        if (!hasTickets && event.is_free) {
            return {
                text: "Free Entry",
                bgColor: "bg-green-100",
                textColor: "text-green-800",
            };
        }

        if (!hasTickets) {
            return {
                text: "No Tickets Required",
                bgColor: "bg-muted",
                textColor: "text-gray-800",
            };
        }

        const totalAvailable = event.ticket_plans.reduce((sum, plan) => sum + plan.available_quantity, 0);

        if (totalAvailable === 0) {
            return {
                text: "Sold Out",
                bgColor: "bg-destructive/10",
                textColor: "text-destructive",
            };
        }

        const totalMax = event.ticket_plans.reduce((sum, plan) => sum + plan.max_quantity, 0);
        const percentSold = ((totalMax - totalAvailable) / totalMax) * 100;

        if (percentSold > 90) {
            return {
                text: "Almost Sold Out",
                bgColor: "bg-destructive/10",
                textColor: "text-destructive",
            };
        }

        if (percentSold > 70) {
            return {
                text: "Selling Fast",
                bgColor: "bg-orange-100",
                textColor: "text-orange-800",
            };
        }

        return {
            text: "Tickets Available",
            bgColor: "bg-accent",
            textColor: "text-primary/80",
        };
    };

    const ticketStatus = getTicketStatus();

    // Determine ticket availability for SEO
    const getAvailability = () => {
        if (!event.ticket_plans || event.ticket_plans.length === 0) {
            return "InStock" as const;
        }
        const totalAvailable = event.ticket_plans.reduce((sum, plan) => sum + plan.available_quantity, 0);
        if (totalAvailable === 0) {
            return "SoldOut" as const;
        }
        const totalMax = event.ticket_plans.reduce((sum, plan) => sum + plan.max_quantity, 0);
        const percentSold = ((totalMax - totalAvailable) / totalMax) * 100;
        if (percentSold > 90) {
            return "LimitedAvailability" as const;
        }
        return "InStock" as const;
    };

    return (
        <div className="min-h-screen bg-card">
            <SEO
                type="event"
                site="event-city"
                data={{
                    title: event.title,
                    description: event.description,
                    image: event.image,
                    url: route('events.show', event.id),
                    startDate: event.event_date,
                    time: event.time,
                    location: event.venue
                        ? {
                            name: event.venue.name,
                            address: event.venue.address,
                            latitude: event.venue.latitude,
                            longitude: event.venue.longitude,
                        }
                        : undefined,
                    performer: event.performer?.name,
                    isFree: event.is_free,
                    price: event.is_free ? 0 : event.price_min,
                    priceCurrency: "USD",
                    availability: getAvailability(),
                    category: event.category,
                }}
            />
            <Header auth={auth} />
            {/* Hero Section */}
            <div className="relative h-96 overflow-hidden">
                <img
                    src={event.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-white">
                            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-lg">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    {formatEventDate(event.event_date)}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    {formatEventTime(event.time)}
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    {event.venue?.name || "TBA"}
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
                            <Flame className="h-4 w-4 text-orange-500 mr-1" />
                            <span className="font-medium text-gray-800">Popular in {event.category}</span>
                        </div>
                        {event.venue && (
                            <div className="flex items-center text-sm text-foreground">
                                <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                                {event.venue.neighborhood}
                            </div>
                        )}
                        {event.weather && (
                            <div className="flex items-center text-sm text-foreground">
                                {event.weather.icon ? (
                                    <img
                                        src={`https://openweathermap.org/img/wn/${event.weather.icon}@2x.png`}
                                        alt={event.weather.description || event.weather.condition}
                                        className="h-6 w-6 mr-1"
                                    />
                                ) : event.weather.condition === "Clear" ? (
                                    <Sun className="h-4 w-4 text-yellow-500 mr-1" />
                                ) : event.weather.condition === "Rain" ? (
                                    <CloudRain className="h-4 w-4 text-blue-500 mr-1" />
                                ) : (
                                    <Cloud className="h-4 w-4 text-muted-foreground mr-1" />
                                )}
                                <span>
                                    {event.weather.temperature ? `${Math.round(event.weather.temperature)}°F` : "Weather info"}
                                    {event.weather.description && `, ${event.weather.description}`}
                                </span>
                            </div>
                        )}
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
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Price</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {event.is_free ? (
                                                <span className="text-lg font-semibold text-green-600">Free</span>
                                            ) : (
                                                <span className="text-base font-medium">
                                                    ${event.price_min} - ${event.price_max}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                                        <Badge variant="secondary">{event.category}</Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                                            <p className="text-base font-medium">3 hours</p>
                                        </div>
                                    </div>
                                    {event.badges && event.badges.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Badges</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {event.badges.slice(0, 3).map((badge, index) => (
                                                    <Badge key={index} variant="outline">
                                                        {badge}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {event.performer && (
                                    <Link
                                        href={route('performers.show', event.performer.id) as any}
                                        className="flex items-center justify-between border-t border pt-6 hover:bg-muted/50 -mx-6 -mb-6 px-6 pb-6 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                                                <img
                                                    src={
                                                        event.performer.image ||
                                                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                                                    }
                                                    alt={event.performer.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Performer</p>
                                                <div className="flex items-center">
                                                    <span className="text-primary hover:text-primary/80 font-medium">{event.performer.name}</span>
                                                    {event.performer.verified && <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />}
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ticket Status */}
                        {event.ticket_plans && event.ticket_plans.length > 0 && (
                            <Card className={`mb-6 ${ticketStatus.bgColor}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            <Ticket className={`h-5 w-5 ${ticketStatus.textColor} mr-2`} />
                                            <div>
                                                <h3 className={`font-medium ${ticketStatus.textColor}`}>{ticketStatus.text}</h3>
                                                <p className="text-sm text-foreground mt-1">
                                                    {event.is_free
                                                        ? "This is a free event, but registration is required."
                                                        : `Prices from $${Math.min(...event.ticket_plans.map((plan) => plan.price))}`}
                                                </p>
                                            </div>
                                        </div>
                                        {ticketStatus.text !== "Sold Out" && (
                                            <Button onClick={handleGetTickets}>{event.is_free ? "Register" : "Get Tickets"}</Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {canEdit && (
                                <Button variant="default" asChild className="flex-1">
                                    <Link href={route('events.edit', event.id) as any}>
                                        <Edit className="h-5 w-5 mr-2" />
                                        Edit Event
                                    </Link>
                                </Button>
                            )}
                            <Button onClick={handleGetTickets} className={canEdit ? "" : "flex-1"}>
                                <Ticket className="h-5 w-5 mr-2" />
                                Get Tickets
                            </Button>
                            {auth.user && !isCheckedIn && (
                                <CheckInButton eventId={event.id} eventName={event.title} venueName={event.venue?.name || "TBA"} />
                            )}
                            {auth.user && isCheckedIn && (
                                <Button variant="outline" disabled>
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Checked In
                                </Button>
                            )}
                            <FollowButton
                                followableType="event"
                                followableId={event.id}
                                initialFollowing={isFollowing}
                                isAuthenticated={!!auth?.user}
                            />
                            <Button variant="outline" onClick={handleShare}>
                                <Share2 className="h-5 w-5 mr-2" />
                                Share
                            </Button>
                        </div>

                        {/* Recent Check-ins */}
                        {recentCheckIns && recentCheckIns.length > 0 && (
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>Recent Check-ins</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CheckInFeed
                                        checkIns={recentCheckIns.map((ci) => ({
                                            id: ci.id,
                                            user: ci.user,
                                            event: {
                                                id: event.id,
                                                title: event.title,
                                                venue: {
                                                    name: event.venue?.name || "TBA",
                                                },
                                            },
                                            checked_in_at: ci.checked_in_at,
                                            notes: ci.notes,
                                        }))}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Content Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                                <TabsTrigger value="overview">About</TabsTrigger>
                                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                                <TabsTrigger value="venue">Venue</TabsTrigger>
                                <TabsTrigger value="lineup">Lineup</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About This Event</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-foreground leading-relaxed">
                                            {event.description || "No description available for this event."}
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="venue" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Venue Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {event.venue ? (
                                            <div>
                                                <h4 className="font-medium text-foreground mb-2">{event.venue.name}</h4>
                                                <p className="text-muted-foreground mb-4">{event.venue.address}</p>
                                                <div className="h-64 bg-muted rounded-lg mb-4">
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        Map placeholder
                                                    </div>
                                                </div>
                                                <Button variant="outline" asChild>
                                                    <a
                                                        href={`https://maps.google.com/?q=${event.venue.latitude},${event.venue.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Get Directions
                                                    </a>
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">Venue information not available</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="tickets" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tickets</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {event.ticket_plans && event.ticket_plans.length > 0 ? (
                                            <div className="space-y-4">
                                                {event.ticket_plans.map((plan) => (
                                                    <div key={plan.id} className="border rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-medium text-foreground">{plan.name}</h4>
                                                                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                                                            </div>
                                                            <span className="font-bold text-lg text-foreground">
                                                                {plan.price === 0 ? "Free" : `$${plan.price}`}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-3">
                                                            <span className="text-sm text-muted-foreground">
                                                                {plan.available_quantity} of {plan.max_quantity} available
                                                            </span>
                                                            <Button onClick={handleGetTickets} size="sm">
                                                                {plan.price === 0 ? "Register" : "Select"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="pt-4 border-t">
                                                    <Button onClick={handleGetTickets} className="w-full">
                                                        {event.is_free ? "Register Now" : "Get Tickets"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-muted-foreground">Tickets will be available soon</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="lineup" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Lineup</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {event.performer ? (
                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                                                        <img
                                                            src={
                                                                event.performer.image ||
                                                                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                                                            }
                                                            alt={event.performer.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <h4 className="font-medium text-foreground text-lg">{event.performer.name}</h4>
                                                            {event.performer.verified && <CheckCircle className="h-5 w-5 text-blue-500 ml-2" />}
                                                        </div>
                                                        <p className="text-foreground leading-relaxed">
                                                            {event.performer.bio || "No performer information available."}
                                                        </p>
                                                        <Link
                                                            href={`/performers/${event.performer.id}`}
                                                            className="text-primary hover:text-primary/80 text-sm mt-2 inline-flex items-center"
                                                        >
                                                            View Performer Profile
                                                            <ArrowRight className="h-4 w-4 ml-1" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">Lineup information will be announced soon.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Reviews</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-muted-foreground mb-4">No reviews yet</p>
                                            {auth.user && <Button variant="outline">Write a Review</Button>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="discussion" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Discussion</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-muted-foreground mb-4">Start a discussion about this event</p>
                                            {auth.user ? (
                                                <Button variant="outline">Start Discussion</Button>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Please log in to participate in discussions</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div>
                        {/* Ticket Information */}
                        {event.ticket_plans && event.ticket_plans.length > 0 && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Ticket className="h-5 w-5 text-indigo-500 mr-2" />
                                        Ticket Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {event.ticket_plans.map((plan) => (
                                        <div key={plan.id} className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-foreground">{plan.name}</h4>
                                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {plan.available_quantity} of {plan.max_quantity} available
                                                </p>
                                            </div>
                                            <span className="font-bold text-foreground">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                                        </div>
                                    ))}
                                    <Separator />
                                    <Button onClick={handleGetTickets} className="w-full">
                                        {event.is_free ? "Register Now" : "Get Tickets"}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Venue Map Card */}
                        {event.venue && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                                        Venue Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-48 bg-muted rounded-lg mb-4">
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">Map placeholder</div>
                                    </div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-foreground">{event.venue.name}</h4>
                                            <p className="text-sm text-muted-foreground">{event.venue.address}</p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={`https://maps.google.com/?q=${event.venue.latitude},${event.venue.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Directions
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Similar Events */}
                        {similarEvents && similarEvents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Similar Events</CardTitle>
                                        <Link
                                            href={route('events', { category: event.category }) as any}
                                            className="text-sm text-primary hover:text-primary/80 flex items-center"
                                        >
                                            View all
                                            <ArrowRight className="h-4 w-4 ml-1" />
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {similarEvents.slice(0, 2).map((similarEvent) => (
                                        <Link
                                            key={similarEvent.id}
                                            href={route('events.show', similarEvent.id) as any}
                                            className="flex items-start hover:bg-muted/50 p-2 -mx-2 rounded-md"
                                        >
                                            <div className="h-14 w-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                                <img
                                                    src={
                                                        similarEvent.image ||
                                                        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?w=56&h=56&fit=crop"
                                                    }
                                                    alt={similarEvent.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <h4 className="text-sm font-medium text-foreground line-clamp-1">{similarEvent.title}</h4>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {formatEventDate(similarEvent.date)} • {similarEvent.venue}
                                                </p>
                                                <div className="mt-1 flex items-center">
                                                    <Badge variant="outline" className="text-xs">
                                                        {similarEvent.category}
                                                    </Badge>
                                                    <span className="ml-2 text-xs text-muted-foreground">{similarEvent.price}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
