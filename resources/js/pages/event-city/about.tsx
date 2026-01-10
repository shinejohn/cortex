import { Link, usePage } from "@inertiajs/react";
import { Award, Calendar, Heart, MapPin, TrendingUp, Users } from "lucide-react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Auth } from "@/types";

interface Props {
    auth: Auth;
}

export default function AboutPage() {
    const { auth } = usePage<Props>().props;

    return (
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "About GoEventCity - Connecting Communities Through Events",
                    description:
                        "Learn about GoEventCity's mission to connect communities, support local businesses, and celebrate the vibrant culture of our cities.",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl">About GoEventCity</h1>
                        <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
                            Connecting communities, supporting local businesses, and celebrating the vibrant culture of our cities.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        GoEventCity is dedicated to making it easier for people to discover, share, and attend local events. We believe that vibrant
                        communities are built on connection, and events are the perfect way to bring people together.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Community First</h3>
                            <p className="text-muted-foreground">
                                We prioritize the needs of our local communities and work to strengthen connections between neighbors.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Event Discovery</h3>
                            <p className="text-muted-foreground">
                                Making it easy to find events that match your interests, whether you're looking for music, food, sports, or culture.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 text-center">
                            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Support Local</h3>
                            <p className="text-muted-foreground">
                                We're committed to supporting local businesses, venues, performers, and event organizers who make our communities
                                special.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* What We Do */}
                <div className="bg-card rounded-lg shadow-sm p-8 mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-6 text-center">What We Do</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">For Event Goers</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Discover events tailored to your interests
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Connect with friends and see what they're attending
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Purchase tickets and manage your event calendar
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Share your experiences and check in at events
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">For Event Organizers</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Create and promote your events easily
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Sell tickets and manage attendees
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Track analytics and engagement
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Build your community and grow your audience
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-accent/50 rounded-lg p-8 mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-8 text-center">By The Numbers</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                            <div className="text-muted-foreground">Events Listed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                            <div className="text-muted-foreground">Active Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">500+</div>
                            <div className="text-muted-foreground">Venues</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">1K+</div>
                            <div className="text-muted-foreground">Performers</div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Join Us</h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Whether you're looking to discover amazing events or share your own, we'd love to have you as part of the GoEventCity
                        community.
                    </p>
                    <div className="flex justify-center space-x-4">
                        {auth.user ? (
                            <Button size="lg" onClick={() => (window.location.href = "/events/create")}>
                                Create Your First Event
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" onClick={() => (window.location.href = "/register")}>
                                    Sign Up Free
                                </Button>
                                <Button size="lg" variant="outline" onClick={() => (window.location.href = "/events")}>
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
