import { Head, router, usePage } from "@inertiajs/react";
import { Calendar, Headphones, Play, Users, ArrowLeft, TrendingUp } from "lucide-react";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
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
    viewMode?: string;
}

export default function PodcastShow() {
    const { auth, podcast } = usePage<PodcastShowPageProps>().props;

    return (
        <GoLocalVoicesLayout auth={auth}>
            <Head title={`${podcast.title} - Go Local Voices`} />
            <SEO
                type="website"
                site="go-local-voices"
                data={{
                    title: `${podcast.title} - Go Local Voices`,
                    description: podcast.description || podcast.title,
                    image: podcast.cover_image || undefined,
                    url: `/podcasts/${podcast.slug}`,
                }}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit("/")}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-2 rounded-xl"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Go Local Voices
                    </Button>
                </div>

                {/* Podcast Header */}
                <div className="mb-8 flex flex-col gap-6 rounded-2xl bg-card border-none p-8 shadow-sm md:flex-row">
                    {podcast.cover_image ? (
                        <img src={podcast.cover_image} alt={podcast.title} className="h-64 w-64 flex-shrink-0 rounded-2xl object-cover shadow-lg" />
                    ) : (
                        <div className="flex h-64 w-64 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100">
                            <Headphones className="h-24 w-24 text-purple-400" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="mb-3 font-display text-4xl font-black tracking-tight text-foreground">{podcast.title}</h1>
                        <div className="mb-4 flex items-center gap-3">
                            <img
                                src={podcast.creator?.avatar || "/default-avatar.png"}
                                alt={podcast.creator?.display_name}
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
                            />
                            <span className="text-muted-foreground font-medium">{podcast.creator?.display_name}</span>
                        </div>
                        {podcast.description && <p className="mb-5 text-foreground leading-relaxed max-w-2xl">{podcast.description}</p>}
                        <div className="flex flex-wrap items-center gap-4">
                            {podcast.category && (
                                <Badge className="border-purple-200 text-purple-600 bg-purple-50 rounded-full">{podcast.category}</Badge>
                            )}
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Headphones className="h-4 w-4" />
                                {podcast.episodes_count ?? 0} {(podcast.episodes_count ?? 0) === 1 ? "episode" : "episodes"}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {podcast.subscribers_count ?? 0} {(podcast.subscribers_count ?? 0) === 1 ? "subscriber" : "subscribers"}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                {podcast.total_listens?.toLocaleString() ?? 0} listens
                            </div>
                        </div>
                    </div>
                </div>

                {/* Episodes */}
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="font-display text-2xl font-black tracking-tight text-foreground">Episodes</h2>
                        {auth && (
                            <Button
                                onClick={() => router.visit(`/podcasts/${podcast.slug}/episodes/create`)}
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                Add Episode
                            </Button>
                        )}
                    </div>
                    {podcast.episodes.length === 0 ? (
                        <div className="py-16 text-center rounded-2xl bg-card border-none shadow-sm">
                            <Headphones className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                            <p className="text-muted-foreground font-medium">No episodes yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {podcast.episodes.map((episode) => (
                                <div
                                    key={episode.id}
                                    className="group cursor-pointer rounded-2xl bg-card border-none shadow-sm p-6 transition-all hover:shadow-md"
                                    onClick={() => router.visit(`/podcasts/${podcast.slug}/episodes/${episode.slug}`)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                {episode.episode_number && (
                                                    <Badge variant="outline" className="border-purple-200 text-purple-600 rounded-full">
                                                        #{episode.episode_number}
                                                    </Badge>
                                                )}
                                                <h3 className="text-lg font-semibold text-foreground group-hover:text-purple-600 transition-colors">
                                                    {episode.title}
                                                </h3>
                                            </div>
                                            {episode.description && (
                                                <p className="mb-3 line-clamp-2 text-muted-foreground">{episode.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                {episode.published_at && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(episode.published_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {episode.duration && <span>{episode.formatted_duration}</span>}
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {episode.listens_count?.toLocaleString() ?? 0} listens
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full h-10 w-10 p-0"
                                        >
                                            <Play className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </GoLocalVoicesLayout>
    );
}
