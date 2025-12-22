import { SEO } from "@/components/common/seo";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Auth } from "@/types";
import { router } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Headphones, Play, Users } from "lucide-react";

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
    const { auth, podcast, viewMode } = usePage<PodcastShowPageProps>().props;

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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-4">
                    <Button variant="ghost" onClick={() => router.visit("/")} className="text-purple-600 hover:text-purple-700">
                        ← Back to Go Local Voices
                    </Button>
                </div>

                {/* Podcast Header */}
                <div className="mb-8 flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm md:flex-row">
                    {podcast.cover_image ? (
                        <img
                            src={podcast.cover_image}
                            alt={podcast.title}
                            className="h-64 w-64 flex-shrink-0 rounded-lg object-cover shadow-md"
                        />
                    ) : (
                        <div className="flex h-64 w-64 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                            <Headphones className="h-24 w-24 text-purple-400" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">{podcast.title}</h1>
                        <div className="mb-4 flex items-center gap-2">
                            <img
                                src={podcast.creator.avatar || "/default-avatar.png"}
                                alt={podcast.creator.display_name}
                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                            />
                            <span className="text-gray-600">{podcast.creator.display_name}</span>
                        </div>
                        {podcast.description && (
                            <p className="mb-4 text-gray-700">{podcast.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4">
                            {podcast.category && (
                                <Badge className="border-purple-200 bg-purple-50 text-purple-700">
                                    {podcast.category}
                                </Badge>
                            )}
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Headphones className="h-4 w-4" />
                                {podcast.episodes_count} {podcast.episodes_count === 1 ? "episode" : "episodes"}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                {podcast.subscribers_count} {podcast.subscribers_count === 1 ? "subscriber" : "subscribers"}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Play className="h-4 w-4" />
                                {podcast.total_listens.toLocaleString()} listens
                            </div>
                        </div>
                    </div>
                </div>

                {/* Episodes */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Episodes</h2>
                        {auth && (
                            <Button 
                                onClick={() => router.visit(`/podcasts/${podcast.slug}/episodes/create`)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                Add Episode
                            </Button>
                        )}
                    </div>
                    {podcast.episodes.length === 0 ? (
                        <div className="py-12 text-center rounded-lg border border-gray-200 bg-white">
                            <Headphones className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-600">No episodes yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {podcast.episodes.map((episode) => (
                                <div
                                    key={episode.id}
                                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md hover:border-purple-300"
                                    onClick={() => router.visit(`/podcasts/${podcast.slug}/episodes/${episode.slug}`)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                {episode.episode_number && (
                                                    <Badge variant="outline" className="border-purple-200 text-purple-700">
                                                        #{episode.episode_number}
                                                    </Badge>
                                                )}
                                                <h3 className="text-lg font-semibold text-gray-900">{episode.title}</h3>
                                            </div>
                                            {episode.description && (
                                                <p className="mb-2 line-clamp-2 text-gray-600">{episode.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                {episode.published_at && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(episode.published_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {episode.duration && (
                                                    <span>{episode.formatted_duration}</span>
                                                )}
                                                <span>{episode.listens_count.toLocaleString()} listens</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                                            <Play className="h-4 w-4" />
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

