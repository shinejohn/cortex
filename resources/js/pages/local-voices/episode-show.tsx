import { Head, router, usePage } from "@inertiajs/react";
import { Calendar, Download, Headphones, Play, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
import type { Auth } from "@/types";

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
    viewMode?: string;
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
        <GoLocalVoicesLayout auth={auth}>
            <Head title={`${episode.title} - ${episode.podcast.title}`} />
            <SEO
                type="article"
                site="go-local-voices"
                data={{
                    title: `${episode.title} - ${episode.podcast.title}`,
                    description: episode.description || episode.title,
                    image: episode.podcast.cover_image || undefined,
                    url: `/podcasts/${episode.podcast.slug}/episodes/${episode.slug}`,
                }}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(`/podcasts/${episode.podcast.slug}`)}
                        className="text-primary hover:text-primary"
                    >
                        ← Back to {episode.podcast.title}
                    </Button>
                </div>

                {/* Episode Header */}
                <div className="mb-8 rounded-lg border border bg-card p-8 shadow-sm">
                    <div className="mb-6 flex gap-6">
                        {episode.podcast.cover_image ? (
                            <img
                                src={episode.podcast.cover_image}
                                alt={episode.podcast.title}
                                className="h-32 w-32 flex-shrink-0 rounded-lg object-cover shadow-md"
                            />
                        ) : (
                            <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                                <Headphones className="h-16 w-16 text-purple-400" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                                {episode.episode_number && (
                                    <Badge variant="outline" className="border text-primary">
                                        #{episode.episode_number}
                                    </Badge>
                                )}
                                <span className="text-sm text-muted-foreground">{episode.podcast.title}</span>
                            </div>
                            <h1 className="mb-2 text-3xl font-bold text-foreground">{episode.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <img
                                        src={episode.podcast.creator.avatar || "/default-avatar.png"}
                                        alt={episode.podcast.creator.display_name}
                                        className="h-5 w-5 rounded-full object-cover border border"
                                    />
                                    {episode.podcast.creator.display_name}
                                </div>
                                {episode.published_at && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(episode.published_at).toLocaleDateString()}
                                    </div>
                                )}
                                <span>{episode.formatted_duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Audio Player */}
                    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-6 border border-purple-100">
                        <audio
                            ref={audioRef}
                            src={episode.audio_url}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleTimeUpdate}
                            onEnded={() => setIsPlaying(false)}
                        />
                        <div className="mb-4 flex items-center gap-4">
                            <Button
                                size="lg"
                                onClick={handlePlayPause}
                                className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {isPlaying ? "⏸" : <Play className="h-6 w-6" />}
                            </Button>
                            <div className="flex-1">
                                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-card">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
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
                                <Button variant="outline" size="sm" className="border">
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="border">
                                    <Share2 className="h-4 w-4" />
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
                    <div className="mb-8 rounded-lg border border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-foreground">Description</h2>
                        <div className="prose max-w-none whitespace-pre-wrap text-foreground">{episode.description}</div>
                    </div>
                )}

                {/* Show Notes */}
                {episode.show_notes && (
                    <div className="mb-8 rounded-lg border border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-foreground">Show Notes</h2>
                        <div className="prose max-w-none whitespace-pre-wrap text-foreground">{episode.show_notes}</div>
                    </div>
                )}

                {/* Related Episodes */}
                {related.length > 0 && (
                    <div>
                        <h2 className="mb-4 text-2xl font-bold text-foreground">More Episodes</h2>
                        <div className="space-y-3">
                            {related.map((relatedEpisode) => (
                                <div
                                    key={relatedEpisode.id}
                                    className="cursor-pointer rounded-lg border border bg-card p-4 transition-all hover:shadow-md hover:border-purple-300"
                                    onClick={() => router.visit(`/podcasts/${episode.podcast.slug}/episodes/${relatedEpisode.slug}`)}
                                >
                                    <h3 className="font-semibold text-foreground">{relatedEpisode.title}</h3>
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
        </GoLocalVoicesLayout>
    );
}
