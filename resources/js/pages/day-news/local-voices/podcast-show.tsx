import { Head, router, usePage } from "@inertiajs/react";
import { Calendar, Headphones, Play, Users } from "lucide-react";
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
            <div className="min-h-screen bg-background">
                <Head title={`${podcast.title} - Local Voices`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `${podcast.title} - Local Voices`,
                        description: podcast.description || podcast.title,
                        image: podcast.cover_image || undefined,
                        url: `/local-voices/podcasts/${podcast.slug}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button variant="ghost" onClick={() => router.visit("/local-voices")}>
                            ← Back to Local Voices
                        </Button>
                    </div>

                    {/* Podcast Header */}
                    <div className="mb-8 flex flex-col gap-6 rounded-lg border bg-card p-8 md:flex-row">
                        {podcast.cover_image ? (
                            <img src={podcast.cover_image} alt={podcast.title} className="h-64 w-64 flex-shrink-0 rounded-lg object-cover" />
                        ) : (
                            <div className="flex h-64 w-64 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Headphones className="size-24 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="mb-2 text-4xl font-bold">{podcast.title}</h1>
                            <div className="mb-4 flex items-center gap-2">
                                <img
                                    src={podcast.creator.avatar || "/default-avatar.png"}
                                    alt={podcast.creator.display_name}
                                    className="size-8 rounded-full object-cover"
                                />
                                <span className="text-muted-foreground">{podcast.creator.display_name}</span>
                            </div>
                            {podcast.description && <p className="mb-4 text-muted-foreground">{podcast.description}</p>}
                            <div className="flex flex-wrap items-center gap-4">
                                {podcast.category && <Badge variant="outline">{podcast.category}</Badge>}
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Headphones className="size-4" />
                                    {podcast.episodes_count} {podcast.episodes_count === 1 ? "episode" : "episodes"}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Users className="size-4" />
                                    {podcast.subscribers_count} {podcast.subscribers_count === 1 ? "subscriber" : "subscribers"}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Play className="size-4" />
                                    {podcast.total_listens.toLocaleString()} listens
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Episodes */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Episodes</h2>
                            {auth && (
                                <Button onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}/episodes/create`)}>Add Episode</Button>
                            )}
                        </div>
                        {podcast.episodes.length === 0 ? (
                            <div className="py-12 text-center">
                                <Headphones className="mx-auto mb-4 size-12 text-muted-foreground" />
                                <p className="text-muted-foreground">No episodes yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {podcast.episodes.map((episode) => (
                                    <div
                                        key={episode.id}
                                        className="cursor-pointer rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
                                        onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}/episodes/${episode.slug}`)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    {episode.episode_number && <Badge variant="outline">#{episode.episode_number}</Badge>}
                                                    <h3 className="text-lg font-semibold">{episode.title}</h3>
                                                </div>
                                                {episode.description && (
                                                    <p className="mb-2 line-clamp-2 text-muted-foreground">{episode.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    {episode.published_at && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="size-4" />
                                                            {new Date(episode.published_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {episode.duration && <span>{episode.formatted_duration}</span>}
                                                    <span>{episode.listens_count.toLocaleString()} listens</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Play className="size-4" />
                                            </Button>
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
