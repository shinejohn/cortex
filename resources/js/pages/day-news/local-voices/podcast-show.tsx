import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Calendar, Headphones, Play, Users } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface Podcast {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    cover_image: string | null;
    category: string | null;
    episodes_count: number;
    subscribers_count: number;
    total_listens: number;
    created_at: string;
    creator: {
        id: string;
        display_name: string;
        avatar: string | null;
    };
    episodes: Array<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        episode_number: string | null;
        duration: number | null;
        formatted_duration: string;
        published_at: string | null;
        listens_count: number;
    }>;
}

interface PodcastShowPageProps {
    auth?: Auth;
    podcast: Podcast;
}

export default function PodcastShow() {
    const { auth, podcast } = usePage<PodcastShowPageProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title={`${podcast.title} - Local Voices`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `${podcast.title} - Local Voices`,
                        description: podcast.description || podcast.title,
                        image: podcast.cover_image || undefined,
                        url: route("daynews.local-voices.podcast.show", podcast.slug) as any,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back Navigation */}
                    <button
                        onClick={() => router.visit(route("daynews.local-voices.index") as any)}
                        className="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary group"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        BACK TO LOCAL VOICES
                    </button>

                    {/* Podcast Header Card */}
                    <div className="mb-8 flex flex-col gap-6 overflow-hidden rounded-2xl border-none bg-white p-8 shadow-sm md:flex-row">
                        {podcast.cover_image ? (
                            <div className="shrink-0 overflow-hidden rounded-2xl shadow-lg">
                                <img src={podcast.cover_image} alt={podcast.title} className="h-64 w-64 object-cover" />
                            </div>
                        ) : (
                            <div className="flex h-64 w-64 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50">
                                <Headphones className="size-24 text-zinc-300" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="mb-3 font-display text-4xl font-black tracking-tight">{podcast.title}</h1>
                            <div className="mb-4 flex items-center gap-3">
                                <img
                                    src={podcast.creator.avatar || "/default-avatar.png"}
                                    alt={podcast.creator.display_name}
                                    className="size-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                                <span className="font-medium text-zinc-700">{podcast.creator.display_name}</span>
                            </div>
                            {podcast.description && (
                                <p className="mb-5 text-muted-foreground leading-relaxed">{podcast.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4">
                                {podcast.category && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.15em]">
                                        {podcast.category}
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                    <Headphones className="size-4 text-primary" />
                                    <span className="font-medium">{podcast.episodes_count} {podcast.episodes_count === 1 ? "episode" : "episodes"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                    <Users className="size-4 text-primary" />
                                    <span className="font-medium">{podcast.subscribers_count} {podcast.subscribers_count === 1 ? "subscriber" : "subscribers"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                    <Play className="size-4 text-primary" />
                                    <span className="font-medium">{podcast.total_listens.toLocaleString()} listens</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Episodes */}
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-display text-2xl font-bold">Episodes</h2>
                            {auth && (
                                <Button
                                    onClick={() => router.visit(route("daynews.local-voices.episode.create", podcast.slug) as any)}
                                    className="rounded-xl font-bold shadow-lg shadow-primary/20"
                                >
                                    Add Episode
                                </Button>
                            )}
                        </div>
                        {podcast.episodes.length === 0 ? (
                            <div className="rounded-3xl border-2 border-dashed p-20 text-center">
                                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                                    <Headphones className="size-10 text-muted-foreground" />
                                </div>
                                <h3 className="mt-6 font-display text-xl font-bold">No episodes yet</h3>
                                <p className="mt-2 text-muted-foreground">Be the first to add an episode to this podcast.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {podcast.episodes.map((episode) => (
                                    <div
                                        key={episode.id}
                                        className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm transition-all hover:shadow-md"
                                        onClick={() => router.visit(route("daynews.local-voices.episode.show", [podcast.slug, episode.slug]) as any)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    {episode.episode_number && (
                                                        <Badge className="bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                                                            #{episode.episode_number}
                                                        </Badge>
                                                    )}
                                                    <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors">
                                                        {episode.title}
                                                    </h3>
                                                </div>
                                                {episode.description && (
                                                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{episode.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                                    {episode.published_at && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="size-3.5" />
                                                            {new Date(episode.published_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {episode.duration && (
                                                        <span className="font-medium">{episode.formatted_duration}</span>
                                                    )}
                                                    <span>{episode.listens_count.toLocaleString()} listens</span>
                                                </div>
                                            </div>
                                            <button className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white">
                                                <Play className="size-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
