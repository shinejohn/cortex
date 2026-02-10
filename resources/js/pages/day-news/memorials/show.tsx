import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Calendar, Flower, Heart, MapPin, MessageSquare, Share2, BookOpen } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

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
            <div className="min-h-screen bg-[#F8F9FB]">
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

                <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back Navigation */}
                    <div className="mb-8 flex items-center justify-between">
                        <button
                            onClick={() => router.visit("/memorials")}
                            className="flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary group"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            BACK TO MEMORIALS
                        </button>
                        <Button variant="outline" size="sm" className="gap-2 rounded-full font-bold">
                            <Share2 className="size-3.5" />
                            SHARE
                        </Button>
                    </div>

                    {/* Memorial Card */}
                    <div className="overflow-hidden rounded-2xl border-none bg-white shadow-sm">
                        {/* Header Banner */}
                        <div className="flex items-center gap-2 bg-zinc-800 px-6 py-4 text-white">
                            <Flower className="size-5" />
                            <h2 className="font-display text-lg font-bold">In Loving Memory</h2>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex flex-col gap-8 md:flex-row">
                                {/* Left Column - Photo & Service Info */}
                                <div className="md:w-1/3">
                                    {memorial.image && (
                                        <div className="mb-6 overflow-hidden rounded-2xl shadow-sm">
                                            <img
                                                src={memorial.image}
                                                alt={memorial.name}
                                                className="h-auto w-full object-cover grayscale"
                                            />
                                        </div>
                                    )}

                                    {/* Service Information */}
                                    {(memorial.service_date || memorial.service_location || memorial.service_details) && (
                                        <div className="rounded-2xl bg-zinc-50 p-5">
                                            <h3 className="mb-4 font-display text-lg font-bold text-zinc-900">
                                                Service Information
                                            </h3>
                                            <div className="space-y-4">
                                                {memorial.service_date && (
                                                    <div className="flex items-start gap-3">
                                                        <Calendar className="mt-0.5 size-5 shrink-0 text-zinc-500" />
                                                        <div>
                                                            <div className="font-bold text-zinc-900">Date</div>
                                                            <div className="text-sm text-zinc-600">
                                                                {new Date(memorial.service_date).toLocaleDateString("en-US", {
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {memorial.service_location && (
                                                    <div className="flex items-start gap-3">
                                                        <MapPin className="mt-0.5 size-5 shrink-0 text-zinc-500" />
                                                        <div>
                                                            <div className="font-bold text-zinc-900">Location</div>
                                                            <div className="text-sm text-zinc-600">{memorial.service_location}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {memorial.service_details && (
                                                    <div className="flex items-start gap-3">
                                                        <BookOpen className="mt-0.5 size-5 shrink-0 text-zinc-500" />
                                                        <div>
                                                            <div className="font-bold text-zinc-900">Details</div>
                                                            <div className="mt-1 text-sm text-zinc-600 whitespace-pre-wrap">{memorial.service_details}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Send Flowers Grid */}
                                    <div className="mt-6">
                                        <h3 className="mb-3 font-display text-lg font-bold text-zinc-900">Send Flowers & Gifts</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button className="flex flex-col items-center justify-center rounded-xl bg-white p-3 shadow-sm transition-colors hover:bg-zinc-50">
                                                <Flower className="mb-2 size-6 text-pink-500" />
                                                <span className="text-sm text-zinc-900">Flowers</span>
                                            </button>
                                            <button className="flex flex-col items-center justify-center rounded-xl bg-white p-3 shadow-sm transition-colors hover:bg-zinc-50">
                                                <Heart className="mb-2 size-6 text-red-500" />
                                                <span className="text-sm text-zinc-900">Tribute</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Obituary */}
                                <div className="md:w-2/3">
                                    {memorial.is_featured && (
                                        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 uppercase tracking-[0.2em] text-[10px] font-black px-3 py-1">
                                            Featured Memorial
                                        </Badge>
                                    )}
                                    <h1 className="mb-2 font-display text-4xl font-black tracking-tight text-zinc-900">
                                        {memorial.name}
                                    </h1>
                                    <p className="mb-4 text-xl text-zinc-500">{memorial.years}</p>
                                    <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                                        {memorial.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="size-4" />
                                                {memorial.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="size-4" />
                                            Passed on{" "}
                                            {new Date(memorial.date_of_passing).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </div>
                                    </div>

                                    {/* Obituary */}
                                    <div className="mb-8">
                                        <h2 className="mb-4 font-display text-xl font-bold text-zinc-900">Obituary</h2>
                                        <div className="prose max-w-none whitespace-pre-wrap leading-relaxed text-zinc-700/80">
                                            {memorial.obituary}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mb-8 flex flex-wrap gap-3">
                                        <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-red-50 hover:text-red-600">
                                            <Heart className="size-4" />
                                            <span>Remember</span>
                                            <span className="text-zinc-400">{memorial.reactions_count}</span>
                                        </button>
                                        <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200">
                                            <MessageSquare className="size-4" />
                                            <span>Share a Memory</span>
                                            <span className="text-zinc-400">{memorial.comments_count}</span>
                                        </button>
                                        <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 ml-auto">
                                            <Flower className="size-4" />
                                            <span>Send Flowers</span>
                                        </button>
                                    </div>

                                    {/* Engagement Stats */}
                                    <div className="flex items-center gap-6 border-t border-zinc-100 pt-6 text-sm text-zinc-500">
                                        <div className="flex items-center gap-2">
                                            <Heart className="size-4 text-red-400" />
                                            <span>{memorial.reactions_count} reactions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="size-4 text-blue-400" />
                                            <span>{memorial.comments_count} comments</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Flower className="size-4 text-purple-400" />
                                            <span>{memorial.views_count} views</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
