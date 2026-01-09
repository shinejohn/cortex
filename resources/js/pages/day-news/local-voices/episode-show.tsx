import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Download, Headphones, Play, Share2 } from "lucide-react";
import { useRef, useState } from "react";

interface Episode {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    show_notes: string | null;
    audio_url: string;
    formatted_duration: string;
    episode_number: string | null;
    published_at: string | null;
    listens_count: number;
    downloads_count: number;
    likes_count: number;
    comments_count: number;
    podcast: {
        id: string;
        title: string;
        slug: string;
        cover_image: string | null;
        creator: {
            id: string;
            display_name: string;
            avatar: string | null;
        };
    };
}

interface RelatedEpisode {
    id: string;
    title: string;
    slug: string;
    formatted_duration: string;
    published_at: string | null;
}

interface EpisodeShowPageProps {
    auth?: Auth;
    episode: Episode;
    related: RelatedEpisode[];
}

export default function EpisodeShow() {
    const { auth, episode, related } = usePage<EpisodeShowPageProps>().props;
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`${episode.title} - ${episode.podcast.title}`} />
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: `${episode.title} - ${episode.podcast.title}`,
                        description: episode.description || episode.title,
                        image: episode.podcast.cover_image || undefined,
                        url: `/local-voices/podcasts/${episode.podcast.slug}/episodes/${episode.slug}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button variant="ghost" onClick={() => router.visit(`/local-voices/podcasts/${episode.podcast.slug}`)}>
                            ← Back to {episode.podcast.title}
                        </Button>
                    </div>

                    {/* Episode Header */}
                    <div className="mb-8 rounded-lg border bg-card p-8">
                        <div className="mb-6 flex gap-6">
                            {episode.podcast.cover_image ? (
                                <img
                                    src={episode.podcast.cover_image}
                                    alt={episode.podcast.title}
                                    className="h-32 w-32 flex-shrink-0 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <Headphones className="size-16 text-muted-foreground" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                    {episode.episode_number && <Badge variant="outline">#{episode.episode_number}</Badge>}
                                    <span className="text-sm text-muted-foreground">{episode.podcast.title}</span>
                                </div>
                                <h1 className="mb-2 text-3xl font-bold">{episode.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <img
                                            src={episode.podcast.creator.avatar || "/default-avatar.png"}
                                            alt={episode.podcast.creator.display_name}
                                            className="size-5 rounded-full object-cover"
                                        />
                                        {episode.podcast.creator.display_name}
                                    </div>
                                    {episode.published_at && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="size-4" />
                                            {new Date(episode.published_at).toLocaleDateString()}
                                        </div>
                                    )}
                                    <span>{episode.formatted_duration}</span>
                                </div>
                            </div>
                        </div>

                        {/* Audio Player */}
                        <div className="rounded-lg bg-muted p-6">
                            <audio
                                ref={audioRef}
                                src={episode.audio_url}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleTimeUpdate}
                                onEnded={() => setIsPlaying(false)}
                            />
                            <div className="mb-4 flex items-center gap-4">
                                <Button size="lg" onClick={handlePlayPause} className="size-16 rounded-full">
                                    {isPlaying ? "⏸" : <Play className="size-6" />}
                                </Button>
                                <div className="flex-1">
                                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-background">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{
                                                width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="size-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Share2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <span>{episode.listens_count.toLocaleString()} listens</span>
                                <span>{episode.downloads_count.toLocaleString()} downloads</span>
                                <span>{episode.likes_count} likes</span>
                                <span>{episode.comments_count} comments</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {episode.description && (
                        <div className="mb-8 rounded-lg border bg-card p-6">
                            <h2 className="mb-4 text-xl font-bold">Description</h2>
                            <div className="prose max-w-none whitespace-pre-wrap">{episode.description}</div>
                        </div>
                    )}

                    {/* Show Notes */}
                    {episode.show_notes && (
                        <div className="mb-8 rounded-lg border bg-card p-6">
                            <h2 className="mb-4 text-xl font-bold">Show Notes</h2>
                            <div className="prose max-w-none whitespace-pre-wrap">{episode.show_notes}</div>
                        </div>
                    )}

                    {/* Related Episodes */}
                    {related.length > 0 && (
                        <div>
                            <h2 className="mb-4 text-2xl font-bold">More Episodes</h2>
                            <div className="space-y-3">
                                {related.map((relatedEpisode) => (
                                    <div
                                        key={relatedEpisode.id}
                                        className="cursor-pointer rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                                        onClick={() => router.visit(`/local-voices/podcasts/${episode.podcast.slug}/episodes/${relatedEpisode.slug}`)}
                                    >
                                        <h3 className="font-semibold">{relatedEpisode.title}</h3>
                                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                            {relatedEpisode.published_at && <span>{new Date(relatedEpisode.published_at).toLocaleDateString()}</span>}
                                            <span>{relatedEpisode.formatted_duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}
