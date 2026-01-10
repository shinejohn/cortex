import { RoleManagement } from "@/components/calendars/role-management";
import { FollowButton } from "@/components/common/follow-button";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SharedData } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    CalendarDays,
    CheckCircle,
    Clock,
    DollarSign,
    MapPin,
    MessageCircle,
    Share2,
    Star,
    Ticket,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";

interface CalendarShowProps extends SharedData {
    calendar: {
        id: number;
        title: string;
        description: string;
        category: string;
        image: string;
        about: string;
        location: string;
        update_frequency: string;
        subscription_price: number;
        is_private: boolean;
        is_verified: boolean;
        followers_count: number;
        events_count: number;
        created_at: string;
        user: {
            id: string;
            name: string;
            avatar?: string;
        };
        events: Array<{
            id: string;
            title: string;
            description: string;
            event_date: string;
            time: string;
            image?: string;
            price_min: number;
            price_max: number;
            is_free: boolean;
            venue?: {
                id: string;
                name: string;
                address: string;
            };
        }>;
        editors: Array<{
            id: string;
            name: string;
            avatar?: string;
            pivot: {
                role: string;
            };
        }>;
    };
    followers: Array<{
        id: string;
        name: string;
        email: string;
    }>;
    isFollowing: boolean;
    canEdit: boolean;
}

export default function CalendarShow() {
    const { calendar, followers, auth, isFollowing, canEdit } = usePage<CalendarShowProps>().props;

    const [activeTab, setActiveTab] = useState("events");
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
                    title: calendar.title,
                    text: calendar.description,
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
            <Head title={calendar.title} />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="relative h-96 overflow-hidden">
                <img src={calendar.image || "/images/calendar-placeholder.jpg"} alt={calendar.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-white">
                            <Button variant="ghost" onClick={handleBack} className="mb-4 text-white hover:text-gray-200 hover:bg-card/10 p-2">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Calendars
                            </Button>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h1 className="text-4xl font-bold mb-4 flex items-center">
                                        {calendar.title}
                                        {calendar.is_verified && (
                                            <Badge className="ml-2 bg-accent text-primary">
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-lg">
                                        <div className="flex items-center">
                                            <MapPin className="h-5 w-5 mr-2" />
                                            {calendar.location || "Location not specified"}
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="h-5 w-5 mr-2" />
                                            {calendar.followers_count} followers
                                        </div>
                                        <div className="flex items-center">
                                            <Ticket className="h-5 w-5 mr-2" />
                                            {calendar.events_count} events
                                        </div>
                                    </div>
                                </div>
                                {canEdit && (
                                    <Link href={`/calendars/${calendar.id}/edit`}>
                                        <Button variant="secondary" className="bg-card text-foreground hover:bg-accent">
                                            <MessageCircle className="h-5 w-5 mr-2" />
                                            Edit Calendar
                                        </Button>
                                    </Link>
                                )}
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
                            <Calendar className="h-4 w-4 text-indigo-500 mr-1" />
                            <span className="font-medium text-gray-800">{calendar.category}</span>
                        </div>
                        <div className="flex items-center text-sm text-foreground">
                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                            Updates {calendar.update_frequency}
                        </div>
                        <div className="flex items-center text-sm text-foreground">
                            <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                            {Number(calendar.subscription_price) > 0 ? `$${Number(calendar.subscription_price).toFixed(2)}/month` : "Free"}
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
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                                        <Badge variant="secondary">{calendar.category}</Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Update Frequency</h3>
                                        <p className="text-base font-medium capitalize">{calendar.update_frequency}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Subscription</h3>
                                        <div className="flex items-center">
                                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                                            <p className="text-base font-medium">
                                                {Number(calendar.subscription_price) > 0
                                                    ? `$${Number(calendar.subscription_price).toFixed(2)}/month`
                                                    : "Free"}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Curator</h3>
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 rounded-full bg-muted overflow-hidden mr-2">
                                                <img
                                                    src={
                                                        calendar.user.avatar ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(calendar.user.name)}`
                                                    }
                                                    alt={calendar.user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <p className="text-base font-medium">{calendar.user.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            <FollowButton
                                followableType="calendar"
                                followableId={calendar.id.toString()}
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
                            <TabsList className={`grid w-full ${canEdit ? "grid-cols-4" : "grid-cols-3"}`}>
                                <TabsTrigger value="events">Events</TabsTrigger>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="members">Members</TabsTrigger>
                                {canEdit && <TabsTrigger value="roles">Roles</TabsTrigger>}
                            </TabsList>

                            <TabsContent value="events" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Calendar Events</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {calendar.events && calendar.events.length > 0 ? (
                                            <div className="space-y-4">
                                                {calendar.events.map((event) => (
                                                    <Link
                                                        key={event.id}
                                                        href={`/events/${event.id}`}
                                                        className="flex items-start hover:bg-muted/50 p-3 -mx-3 rounded-md"
                                                    >
                                                        <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                                            <img
                                                                src={event.image || "/images/event-placeholder.jpg"}
                                                                alt={event.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <h5 className="text-base font-medium text-foreground line-clamp-1">{event.title}</h5>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {formatEventDate(event.event_date)} • {event.time}
                                                            </p>
                                                            {event.venue && (
                                                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                                    <MapPin className="h-3 w-3 mr-1" />
                                                                    {event.venue.name}
                                                                </div>
                                                            )}
                                                            <div className="mt-2 flex items-center justify-between">
                                                                <span className="text-sm text-foreground font-medium">
                                                                    {event.is_free
                                                                        ? "Free"
                                                                        : event.price_min === event.price_max
                                                                          ? `$${Number(event.price_min).toFixed(2)}`
                                                                          : `$${Number(event.price_min).toFixed(2)} - $${Number(event.price_max).toFixed(2)}`}
                                                                </span>
                                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                                                    View Event
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No events in this calendar yet</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="about" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About This Calendar</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                                                <p className="text-foreground leading-relaxed">{calendar.description || "No description available."}</p>
                                            </div>

                                            {calendar.about && (
                                                <div className="border-t border pt-4">
                                                    <h4 className="text-sm font-medium text-foreground mb-2">More Details</h4>
                                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{calendar.about}</p>
                                                </div>
                                            )}

                                            <div className="border-t border pt-4">
                                                <h4 className="text-sm font-medium text-foreground mb-2">Calendar Stats</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Total Events</p>
                                                        <p className="text-lg font-semibold text-foreground">{calendar.events_count}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Followers</p>
                                                        <p className="text-lg font-semibold text-foreground">{calendar.followers_count}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Category</p>
                                                        <p className="text-sm font-medium text-foreground">{calendar.category}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Created</p>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {new Date(calendar.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="members" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle>Members ({followers.length})</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Editors Section */}
                                        {calendar.editors && calendar.editors.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-medium text-foreground mb-3">Editors & Admins</h4>
                                                <div className="space-y-3">
                                                    {calendar.editors.map((editor) => (
                                                        <div key={editor.id} className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden mr-3">
                                                                    <img
                                                                        src={
                                                                            editor.avatar ||
                                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(editor.name)}`
                                                                        }
                                                                        alt={editor.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-foreground">{editor.name}</p>
                                                                    <p className="text-xs text-muted-foreground capitalize">{editor.pivot.role}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Separator className="my-4" />
                                            </div>
                                        )}

                                        {/* Followers Section */}
                                        {followers && followers.length > 0 ? (
                                            <div>
                                                <h4 className="text-sm font-medium text-foreground mb-3">Followers</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {followers.map((follower) => (
                                                        <div key={follower.id} className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-muted overflow-hidden mr-2">
                                                                <img
                                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(follower.name)}`}
                                                                    alt={follower.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">{follower.name}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No followers yet</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {canEdit && (
                                <TabsContent value="roles" className="mt-6">
                                    <RoleManagement calendarId={calendar.id} editors={calendar.editors || []} ownerId={parseInt(calendar.user.id)} />
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div>
                        {/* Calendar Information */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                                    Calendar Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-foreground">{calendar.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{calendar.category}</p>
                                        {calendar.location && <p className="text-xs text-muted-foreground">{calendar.location}</p>}
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Followers</span>
                                        <span className="font-medium">{calendar.followers_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Events</span>
                                        <span className="font-medium">{calendar.events_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Updates</span>
                                        <span className="font-medium capitalize">{calendar.update_frequency}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Price</span>
                                        <span className="font-medium">
                                            {Number(calendar.subscription_price) > 0
                                                ? `$${Number(calendar.subscription_price).toFixed(2)}/mo`
                                                : "Free"}
                                        </span>
                                    </div>
                                </div>
                                <Separator />
                                <FollowButton
                                    followableType="calendar"
                                    followableId={calendar.id.toString()}
                                    variant="text"
                                    className="w-full"
                                    initialFollowing={isFollowing}
                                />
                            </CardContent>
                        </Card>

                        {/* Curator Card */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="h-5 w-5 text-muted-foreground mr-2" />
                                    Curator
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-muted overflow-hidden mr-3">
                                        <img
                                            src={calendar.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(calendar.user.name)}`}
                                            alt={calendar.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{calendar.user.name}</p>
                                        <p className="text-sm text-muted-foreground">Calendar Owner</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Events Preview */}
                        {calendar.events && calendar.events.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Ticket className="h-5 w-5 text-indigo-500 mr-2" />
                                        Upcoming Events
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {calendar.events.slice(0, 3).map((event) => (
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
                                                <h5 className="text-sm font-medium text-foreground line-clamp-1">{event.title}</h5>
                                                <div className="text-xs text-muted-foreground flex items-center mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {event.time}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {event.is_free
                                                        ? "Free"
                                                        : event.price_min === event.price_max
                                                          ? `$${Number(event.price_min).toFixed(2)}`
                                                          : `$${Number(event.price_min).toFixed(2)} - $${Number(event.price_max).toFixed(2)}`}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    <Separator />
                                    <Button variant="ghost" size="sm" className="w-full text-primary" onClick={() => setActiveTab("events")}>
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
                            <CardTitle>Contact {calendar.user.name}</CardTitle>
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
                                        placeholder="What would you like to know about this calendar?"
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
                                        alert("Your message has been sent! The curator will respond shortly.");
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
