import { SEO } from "@/components/common/seo";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Auth } from "@/types";
import { router } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Headphones, Mic, Plus, Users } from "lucide-react";

interface CreatorProfile {
    id: string;
    display_name: string;
    bio: string | null;
    avatar: string | null;
    cover_image: string | null;
    status: string;
    followers_count: number;
    podcasts_count: number;
    episodes_count: number;
    total_listens: number;
}

interface Podcast {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    cover_image: string | null;
    status: string;
    episodes_count: number;
    subscribers_count: number;
    total_listens: number;
    episodes: Array<{
        id: string;
        title: string;
        status: string;
    }>;
}

interface CreatorDashboardPageProps {
    auth?: Auth;
    profile: CreatorProfile;
    podcasts: Podcast[];
    viewMode?: string;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "approved":
            return "bg-green-100 text-green-700 border-green-200";
        case "pending":
            return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case "rejected":
            return "bg-destructive/10 text-destructive border-destructive/20";
        case "suspended":
            return "bg-muted text-foreground border";
        default:
            return "bg-muted text-foreground border";
    }
};

export default function CreatorDashboard() {
    const { auth, profile, podcasts, viewMode } = usePage<CreatorDashboardPageProps>().props;

    return (
        <GoLocalVoicesLayout auth={auth}>
            <Head title="Creator Dashboard - Go Local Voices" />
            <SEO
                type="website"
                site="go-local-voices"
                data={{
                    title: "Creator Dashboard - Go Local Voices",
                    description: "Manage your podcasts and episodes",
                    url: "/dashboard",
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <div className="mb-8 rounded-lg border border bg-card p-8 shadow-sm">
                    {profile.cover_image && (
                        <div className="mb-6 -mx-8 -mt-8">
                            <img src={profile.cover_image} alt="Cover" className="h-48 w-full object-cover rounded-t-lg" />
                        </div>
                    )}
                    <div className="flex items-start gap-6">
                        {profile.avatar && (
                            <img
                                src={profile.avatar}
                                alt={profile.display_name}
                                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                            />
                        )}
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                                <h1 className="text-3xl font-bold text-foreground">{profile.display_name}</h1>
                                <Badge className={getStatusColor(profile.status)}>{profile.status.toUpperCase()}</Badge>
                            </div>
                            {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border bg-card p-4 shadow-sm">
                        <div className="text-sm text-muted-foreground mb-1">Podcasts</div>
                        <div className="text-2xl font-bold text-foreground">{profile.podcasts_count}</div>
                    </div>
                    <div className="rounded-lg border border bg-card p-4 shadow-sm">
                        <div className="text-sm text-muted-foreground mb-1">Episodes</div>
                        <div className="text-2xl font-bold text-foreground">{profile.episodes_count}</div>
                    </div>
                    <div className="rounded-lg border border bg-card p-4 shadow-sm">
                        <div className="text-sm text-muted-foreground mb-1">Followers</div>
                        <div className="text-2xl font-bold text-foreground">{profile.followers_count}</div>
                    </div>
                    <div className="rounded-lg border border bg-card p-4 shadow-sm">
                        <div className="text-sm text-muted-foreground mb-1">Total Listens</div>
                        <div className="text-2xl font-bold text-foreground">{profile.total_listens.toLocaleString()}</div>
                    </div>
                </div>

                {/* Podcasts */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">Your Podcasts</h2>
                        {profile.status === "approved" && (
                            <Button
                                onClick={() => router.visit("/podcasts/create")}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Podcast
                            </Button>
                        )}
                    </div>
                    {podcasts.length === 0 ? (
                        <div className="rounded-lg border border bg-card p-12 text-center shadow-sm">
                            <Headphones className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="mb-4 text-muted-foreground">No podcasts yet.</p>
                            {profile.status === "approved" && (
                                <Button
                                    onClick={() => router.visit("/podcasts/create")}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    Create Your First Podcast
                                </Button>
                            )}
                            {profile.status === "pending" && (
                                <p className="text-sm text-muted-foreground">
                                    Your creator profile is pending approval. You'll be able to create podcasts once approved.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {podcasts.map((podcast) => (
                                <div
                                    key={podcast.id}
                                    className="cursor-pointer rounded-lg border border bg-card transition-all hover:shadow-md hover:border-purple-300"
                                    onClick={() => router.visit(`/podcasts/${podcast.slug}`)}
                                >
                                    {podcast.cover_image ? (
                                        <img src={podcast.cover_image} alt={podcast.title} className="h-48 w-full rounded-t-lg object-cover" />
                                    ) : (
                                        <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-purple-100 to-pink-100">
                                            <Headphones className="h-12 w-12 text-purple-400" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="font-semibold text-foreground">{podcast.title}</h3>
                                            <Badge
                                                variant={podcast.status === "published" ? "default" : "secondary"}
                                                className={
                                                    podcast.status === "published"
                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                        : "bg-muted text-foreground border"
                                                }
                                            >
                                                {podcast.status}
                                            </Badge>
                                        </div>
                                        {podcast.description && <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{podcast.description}</p>}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{podcast.episodes_count} episodes</span>
                                            <span>{podcast.total_listens.toLocaleString()} listens</span>
                                        </div>
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
