import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { MicIcon, StarIcon, CalendarIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface JoinCtaProps {
    className?: string;
}

export function JoinCta({ className }: JoinCtaProps) {
    const benefits = [
        {
            icon: StarIcon,
            title: "Build Your Reputation",
            description: "Get reviews and ratings from real audiences",
        },
        {
            icon: CalendarIcon,
            title: "Manage Bookings",
            description: "Easy scheduling and event management tools",
        },
        {
            icon: TrendingUpIcon,
            title: "Grow Your Audience",
            description: "Connect with venues and fans in your area",
        },
    ];

    return (
        <div
            className={cn(
                "py-16 bg-gradient-to-br from-primary/5 to-primary/10",
                className
            )}
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Content */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl mr-4">
                                <MicIcon className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-foreground">
                                    Ready to Perform?
                                </h2>
                                <p className="text-lg text-muted-foreground mt-1">
                                    Join our community of talented performers
                                </p>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                            Whether you're a solo artist, band, or DJ, our
                            platform connects you with venues and audiences
                            looking for great entertainment. Start building your
                            performance career today.
                        </p>

                        <div className="space-y-4 mb-8">
                            {benefits.map((benefit, index) => {
                                const IconComponent = benefit.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start"
                                    >
                                        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg mr-4">
                                            <IconComponent className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-1">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/performers/register">
                                <Button size="lg" className="w-full sm:w-auto">
                                    Join as Performer
                                </Button>
                            </Link>
                            <Link href="/performers/how-it-works">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right side - Stats/Visual */}
                    <div className="lg:pl-8">
                        <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-8 shadow-lg border">
                            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
                                Join 500+ Performers
                            </h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">
                                        1,200+
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Shows Booked
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">
                                        4.8★
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Average Rating
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">
                                        85%
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Rebooking Rate
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">
                                        50+
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Active Venues
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <div className="flex items-center justify-center text-sm text-muted-foreground">
                                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                                    "Great platform for discovering new
                                    opportunities"
                                </div>
                                <div className="text-center text-xs text-muted-foreground mt-1">
                                    - Sarah M., Indie Artist
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
