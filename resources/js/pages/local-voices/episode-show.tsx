import { Head, router, usePage } from "@inertiajs/react";
import { Calendar, Download, Headphones, Play, Share2, ArrowLeft, TrendingUp, Heart, MessageCircle, Pause } from "lucide-react";
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
            <Head title={`${episode.title} - ${episode.podcast?.title}`} />
            <SEO
                type="article"
                site="go-local-voices"
                data={{
                    title: `${episode.title} - ${episode.podcast?.title}`,
                    description: episode.description || episode.title,
                    image: episode.podcast?.cover_image || undefined,
                    url: `/podcasts/${episode.podcast?.slug}/episodes/${episode.slug}`,
                }}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(`/podcasts/${episode.podcast?.slug}`)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-2 rounded-xl"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to {episode.podcast?.title}
                    </Button>
                </div>

                {/* Episode Header */}
                <div className="mb-8 rounded-2xl bg-card border-none shadow-sm p-8">
                    <div className="mb-6 flex gap-6">
                        {episode.podcast?.cover_image ? (
                            <img
                                src={episode.podcast.cover_image}
                                alt={episode.podcast?.title}
                                className="h-32 w-32 shrink-0 rounded-2xl object-cover shadow-lg"
                            />
                        ) : (
                            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100">
                                <Headphones className="h-16 w-16 text-purple-400" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                                {episode.episode_number && (
                                    <Badge variant="outline" className="border-purple-200 text-purple-600 rounded-full">
                                        #{episode.episode_number}
                                    </Badge>
                                )}
                                <span className="text-sm text-muted-foreground">{episode.podcast?.title}</span>
                            </div>
                            <h1 className="mb-3 font-display text-3xl font-black tracking-tight text-foreground">{episode.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <img
                                        src={episode.podcast?.creator?.avatar || "/default-avatar.png"}
                                        alt={episode.podcast?.creator?.display_name}
                                        className="h-5 w-5 rounded-full object-cover ring-2 ring-background"
                                    />
                                    {episode.podcast?.creator?.display_name}
                                </div>
                                {episode.published_at && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(episode.published_at).toLocaleDateString()}
                                    </div>
                                )}
                                <span>{episode.formatted_duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Audio Player */}
                    <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 border border-purple-100">
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
                                className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                            >
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                            </Button>
                            <div className="flex-1">
                                <div
                                    className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-white/80 cursor-pointer"
                                    onClick={(e) => {
                                        if (audioRef.current && duration > 0) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const percentage = x / rect.width;
                                            audioRef.current.currentTime = percentage * duration;
                                        }
                                    }}
                                >
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
                                        style={{
                                            width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-full border-purple-200 hover:bg-purple-50">
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-full border-purple-200 hover:bg-purple-50">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {episode.listens_count?.toLocaleString() ?? 0} listens
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Download className="h-3.5 w-3.5" />
                                {episode.downloads_count?.toLocaleString() ?? 0} downloads
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Heart className="h-3.5 w-3.5" />
                                {episode.likes_count ?? 0} likes
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MessageCircle className="h-3.5 w-3.5" />
                                {episode.comments_count ?? 0} comments
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {episode.description && (
                    <div className="mb-8 rounded-2xl bg-card border-none shadow-sm p-6 lg:p-8">
                        <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-foreground">Description</h2>
                        <div className="prose max-w-none whitespace-pre-wrap text-foreground leading-relaxed">{episode.description}</div>
                    </div>
                )}

                {/* Show Notes */}
                {episode.show_notes && (
                    <div className="mb-8 rounded-2xl bg-card border-none shadow-sm p-6 lg:p-8">
                        <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-foreground">Show Notes</h2>
                        <div className="prose max-w-none whitespace-pre-wrap text-foreground leading-relaxed">{episode.show_notes}</div>
                    </div>
                )}

                {/* Related Episodes */}
                {related.length > 0 && (
                    <div>
                        <h2 className="mb-5 font-display text-2xl font-black tracking-tight text-foreground">More Episodes</h2>
                        <div className="space-y-3">
                            {related.map((relatedEpisode) => (
                                <div
                                    key={relatedEpisode.id}
                                    className="group cursor-pointer rounded-2xl bg-card border-none shadow-sm p-5 transition-all hover:shadow-md"
                                    onClick={() => router.visit(`/podcasts/${episode.podcast?.slug}/episodes/${relatedEpisode.slug}`)}
                                >
                                    <h3 className="font-semibold text-foreground group-hover:text-purple-600 transition-colors">
                                        {relatedEpisode.title}
                                    </h3>
                                    <div className="mt-1.5 flex items-center gap-4 text-sm text-muted-foreground">
                                        {relatedEpisode.published_at && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(relatedEpisode.published_at).toLocaleDateString()}
                                            </span>
                                        )}
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
