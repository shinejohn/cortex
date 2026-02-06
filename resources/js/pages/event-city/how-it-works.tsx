import { Link, router, usePage } from "@inertiajs/react";
import { Bell, Calendar, Heart, MapPin, Search, Share2, Ticket, Users } from "lucide-react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Auth } from "@/types";

interface Props {
    auth: Auth;
}

export default function HowItWorksPage() {
    const { auth } = usePage<Props>().props;

    return (
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "How It Works - GoEventCity",
                    description: "Learn how to discover events, purchase tickets, and connect with your local community on GoEventCity.",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl">How It Works</h1>
                        <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
                            Discover amazing events, connect with your community, and make the most of your local scene.
                        </p>
                    </div>
                </div>
            </div>

            {/* For Event Goers */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground mb-4">For Event Goers</h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Finding and attending events has never been easier. Follow these simple steps to get started.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-primary mb-4">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">1. Discover Events</h3>
                            <p className="text-muted-foreground">
                                Browse events by category, date, location, or search for specific performers or venues.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-primary mb-4">
                                <Ticket className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">2. Get Tickets</h3>
                            <p className="text-muted-foreground">
                                Purchase tickets directly through our secure platform. Many events offer multiple ticket types.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-primary mb-4">
                                <Calendar className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">3. Plan Your Schedule</h3>
                            <p className="text-muted-foreground">
                                Add events to your calendar, set reminders, and see what your friends are attending.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-primary mb-4">
                                <Heart className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">4. Enjoy & Share</h3>
                            <p className="text-muted-foreground">
                                Check in at events, share your experiences, and help others discover great events.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* For Event Organizers */}
                <div className="bg-card rounded-lg shadow-sm p-8 mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">For Event Organizers</h2>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Create and promote your events with our easy-to-use platform. Reach your audience and grow your community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-lg mr-4">
                                    1
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Create Your Event</h3>
                            </div>
                            <p className="text-muted-foreground ml-14">
                                Add event details, upload images, set ticket prices, and configure all the information attendees need.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-lg mr-4">
                                    2
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Promote & Share</h3>
                            </div>
                            <p className="text-muted-foreground ml-14">
                                Share your event on social media, send to your email list, and let our platform help you reach new audiences.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-lg mr-4">
                                    3
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">Manage & Analyze</h3>
                            </div>
                            <p className="text-muted-foreground ml-14">
                                Track ticket sales, manage attendees, view analytics, and get insights to improve your events.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <MapPin className="h-8 w-8 text-primary mb-3" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">Location-Based Discovery</h3>
                                <p className="text-muted-foreground">Find events near you with our smart location features and distance filters.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Bell className="h-8 w-8 text-primary mb-3" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">Smart Notifications</h3>
                                <p className="text-muted-foreground">
                                    Get notified about events you're interested in, price drops, and new events from your favorite performers.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Users className="h-8 w-8 text-primary mb-3" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">Social Features</h3>
                                <p className="text-muted-foreground">
                                    Follow performers, see what friends are attending, and share your event experiences.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Share2 className="h-8 w-8 text-primary mb-3" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">Easy Sharing</h3>
                                <p className="text-muted-foreground">Share events with friends via social media, email, or direct links.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Ticket className="h-8 w-8 text-primary mb-3" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">Secure Ticketing</h3>
                                <p className="text-muted-foreground">
                                    Safe and secure ticket purchases with multiple payment options and instant confirmation.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <Calendar className="h-8 w-8 text-primary mb-3" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">Calendar Integration</h3>
                                <p className="text-muted-foreground">
                                    Sync events with your calendar and never miss an event you're planning to attend.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-primary rounded-lg p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl text-indigo-100 mb-6">Join thousands of people discovering and sharing amazing local events.</p>
                    <div className="flex justify-center space-x-4">
                        {auth.user ? (
                            <Button size="lg" variant="secondary" onClick={() => router.visit("/events/create")}>
                                Create Your First Event
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" variant="secondary" onClick={() => router.visit("/register")}>
                                    Sign Up Free
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-transparent border-white text-white hover:bg-card/10"
                                    onClick={() => router.visit("/events")}
                                >
                                    Browse Events
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
