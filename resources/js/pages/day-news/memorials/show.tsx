import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Flower, Heart, MapPin, MessageSquare } from "lucide-react";

interface Memorial {
    id: string;
    name: string;
    years: string;
    date_of_passing: string;
    obituary: string;
    image: string | null;
    location: string | null;
    service_date: string | null;
    service_location: string | null;
    service_details: string | null;
    is_featured: boolean;
    views_count: number;
    reactions_count: number;
    comments_count: number;
    regions: Array<{
        id: number;
        name: string;
    }>;
    user: {
        id: string;
        name: string;
    };
}

interface MemorialShowPageProps {
    auth?: Auth;
    memorial: Memorial;
}

export default function MemorialShow() {
    const { auth, memorial } = usePage<MemorialShowPageProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`${memorial.name} - Memorial`} />
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: `${memorial.name} - Memorial`,
                        description: memorial.obituary.substring(0, 200),
                        image: memorial.image || undefined,
                        url: `/memorials/${memorial.id}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button variant="ghost" onClick={() => router.visit("/memorials")}>
                            ← Back to Memorials
                        </Button>
                    </div>

                    <div className="rounded-lg border bg-card p-8">
                        {/* Header */}
                        <div className="mb-6 border-b pb-6">
                            {memorial.is_featured && (
                                <Badge className="mb-4">Featured Memorial</Badge>
                            )}
                            {memorial.image && (
                                <div className="mb-6">
                                    <img
                                        src={memorial.image}
                                        alt={memorial.name}
                                        className="mx-auto h-64 w-64 rounded-full object-cover"
                                    />
                                </div>
                            )}
                            <h1 className="mb-2 text-4xl font-bold">{memorial.name}</h1>
                            <p className="mb-4 text-2xl text-muted-foreground">{memorial.years}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {memorial.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="size-4" />
                                        {memorial.location}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="size-4" />
                                    Passed away on {new Date(memorial.date_of_passing).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Obituary */}
                        <div className="mb-6">
                            <h2 className="mb-4 text-2xl font-semibold">Obituary</h2>
                            <div className="prose max-w-none whitespace-pre-wrap">{memorial.obituary}</div>
                        </div>

                        {/* Service Information */}
                        {(memorial.service_date || memorial.service_location || memorial.service_details) && (
                            <div className="mb-6 rounded-lg bg-muted p-6">
                                <h3 className="mb-4 text-xl font-semibold">Service Information</h3>
                                {memorial.service_date && (
                                    <div className="mb-2 flex items-center gap-2">
                                        <Calendar className="size-4" />
                                        <span>
                                            {new Date(memorial.service_date).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                )}
                                {memorial.service_location && (
                                    <div className="mb-2 flex items-center gap-2">
                                        <MapPin className="size-4" />
                                        <span>{memorial.service_location}</span>
                                    </div>
                                )}
                                {memorial.service_details && (
                                    <div className="mt-4 whitespace-pre-wrap">{memorial.service_details}</div>
                                )}
                            </div>
                        )}

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-6 border-t pt-6">
                            <div className="flex items-center gap-2">
                                <Heart className="size-5" />
                                <span>{memorial.reactions_count} reactions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="size-5" />
                                <span>{memorial.comments_count} comments</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Flower className="size-5" />
                                <span>{memorial.views_count} views</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}

