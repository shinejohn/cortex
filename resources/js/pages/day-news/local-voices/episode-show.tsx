import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Calendar, Clock, Download, Headphones, Heart, MessageSquare, Pause, Play, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
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
            <div className="min-h-screen bg-[#F8F9FB]">
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

                <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back navigation */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.visit(`/local-voices/podcasts/${episode.podcast.slug}`)}
                            className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            Back to {episode.podcast.title}
                        </button>
                    </div>

                    {/* Episode Header Card */}
                    <div className="mb-8 overflow-hidden rounded-2xl border-none bg-white shadow-sm">
                        <div className="p-6 sm:p-8">
                            <div className="mb-6 flex flex-col gap-6 sm:flex-row">
                                {/* Podcast cover */}
                                {episode.podcast.cover_image ? (
                                    <img
                                        src={episode.podcast.cover_image}
                                        alt={episode.podcast.title}
                                        className="size-36 shrink-0 rounded-2xl object-cover shadow-md"
                                    />
                                ) : (
                                    <div className="flex size-36 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50">
                                        <Headphones className="size-16 text-indigo-300" />
                                    </div>
                                )}

                                <div className="flex-1">
                                    {/* Episode badge + podcast name */}
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        {episode.episode_number && (
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                                #{episode.episode_number}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                            {episode.podcast.title}
                                        </span>
                                    </div>

                                    <h1 className="mb-3 font-display text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                                        {episode.title}
                                    </h1>

                                    {/* Creator info + meta */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={episode.podcast.creator.avatar || "/default-avatar.png"}
                                                alt={episode.podcast.creator.display_name}
                                                className="size-6 rounded-full object-cover ring-2 ring-white"
                                            />
                                            <span className="font-medium text-zinc-700">{episode.podcast.creator.display_name}</span>
                                        </div>
                                        {episode.published_at && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="size-3.5" />
                                                {new Date(episode.published_at).toLocaleDateString()}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="size-3.5" />
                                            {episode.formatted_duration}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Audio Player */}
                            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
                                <audio
                                    ref={audioRef}
                                    src={episode.audio_url}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleTimeUpdate}
                                    onEnded={() => setIsPlaying(false)}
                                />
                                <div className="mb-4 flex items-center gap-4">
                                    <button
                                        onClick={handlePlayPause}
                                        className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105"
                                    >
                                        {isPlaying ? <Pause className="size-6" /> : <Play className="ml-1 size-6" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/80">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all"
                                                style={{
                                                    width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs font-medium text-zinc-500">
                                            <span>{formatTime(currentTime)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="rounded-xl border-none bg-white/80 shadow-sm">
                                            <Download className="size-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-xl border-none bg-white/80 shadow-sm">
                                            <Share2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-600">
                                    <span className="flex items-center gap-1.5">
                                        <Headphones className="size-4 text-primary" />
                                        {episode.listens_count.toLocaleString()} listens
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Download className="size-4 text-blue-500" />
                                        {episode.downloads_count.toLocaleString()} downloads
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Heart className="size-4 text-rose-500" />
                                        {episode.likes_count} likes
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MessageSquare className="size-4 text-violet-500" />
                                        {episode.comments_count} comments
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {episode.description && (
                        <div className="mb-8 overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-4 font-display text-xl font-black tracking-tight text-zinc-900">Description</h2>
                            <div className="prose max-w-none whitespace-pre-wrap text-zinc-600">{episode.description}</div>
                        </div>
                    )}

                    {/* Show Notes */}
                    {episode.show_notes && (
                        <div className="mb-8 overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-4 font-display text-xl font-black tracking-tight text-zinc-900">Show Notes</h2>
                            <div className="prose max-w-none whitespace-pre-wrap text-zinc-600">{episode.show_notes}</div>
                        </div>
                    )}

                    {/* Related Episodes */}
                    {related.length > 0 && (
                        <div>
                            <h2 className="mb-4 font-display text-2xl font-black tracking-tight text-zinc-900">More Episodes</h2>
                            <div className="space-y-3">
                                {related.map((relatedEpisode) => (
                                    <div
                                        key={relatedEpisode.id}
                                        className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white p-5 shadow-sm transition-all hover:shadow-md"
                                        onClick={() => router.visit(`/local-voices/podcasts/${episode.podcast.slug}/episodes/${relatedEpisode.slug}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                                <Play className="size-4" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-zinc-900 group-hover:text-primary">{relatedEpisode.title}</h3>
                                                <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                                                    {relatedEpisode.published_at && (
                                                        <span>{new Date(relatedEpisode.published_at).toLocaleDateString()}</span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="size-3.5" />
                                                        {relatedEpisode.formatted_duration}
                                                    </span>
                                                </div>
                                            </div>
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
