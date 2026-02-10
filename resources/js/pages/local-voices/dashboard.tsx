import { Head, router, usePage } from "@inertiajs/react";
import { Headphones, Mic, Plus, Users, TrendingUp, BarChart3 } from "lucide-react";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
import type { Auth } from "@/types";

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
            return "bg-green-50 text-green-700 border-green-200";
        case "pending":
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
        case "rejected":
            return "bg-destructive/10 text-destructive border-destructive/20";
        case "suspended":
            return "bg-muted text-foreground border";
        default:
            return "bg-muted text-foreground border";
    }
};

export default function CreatorDashboard() {
    const { auth, profile, podcasts } = usePage<CreatorDashboardPageProps>().props;

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

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <div className="mb-8 rounded-2xl bg-card overflow-hidden border-none shadow-sm">
                    {profile.cover_image && (
                        <img src={profile.cover_image} alt="Cover" className="h-48 w-full object-cover" />
                    )}
                    <div className="p-8">
                        <div className="flex items-start gap-6">
                            {profile.avatar && (
                                <img
                                    src={profile.avatar}
                                    alt={profile.display_name}
                                    className="h-24 w-24 rounded-full object-cover ring-4 ring-background shadow-lg -mt-16 relative"
                                />
                            )}
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-3">
                                    <h1 className="font-display text-3xl font-black tracking-tight text-foreground">{profile.display_name}</h1>
                                    <Badge className={getStatusColor(profile.status)}>{profile.status.toUpperCase()}</Badge>
                                </div>
                                {profile.bio && <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-card border-none shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-purple-50">
                                <Mic className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">Podcasts</span>
                        </div>
                        <div className="text-3xl font-black text-foreground">{profile.podcasts_count ?? 0}</div>
                    </div>
                    <div className="rounded-2xl bg-card border-none shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-pink-50">
                                <Headphones className="h-4 w-4 text-pink-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">Episodes</span>
                        </div>
                        <div className="text-3xl font-black text-foreground">{profile.episodes_count ?? 0}</div>
                    </div>
                    <div className="rounded-2xl bg-card border-none shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-50">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">Followers</span>
                        </div>
                        <div className="text-3xl font-black text-foreground">{profile.followers_count ?? 0}</div>
                    </div>
                    <div className="rounded-2xl bg-card border-none shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-green-50">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">Total Listens</span>
                        </div>
                        <div className="text-3xl font-black text-foreground">{profile.total_listens?.toLocaleString() ?? 0}</div>
                    </div>
                </div>

                {/* Podcasts */}
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="font-display text-2xl font-black tracking-tight text-foreground">Your Podcasts</h2>
                        {profile.status === "approved" && (
                            <Button
                                onClick={() => router.visit("/podcasts/create")}
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Podcast
                            </Button>
                        )}
                    </div>
                    {podcasts.length === 0 ? (
                        <div className="rounded-2xl bg-card border-none shadow-sm p-16 text-center">
                            <Headphones className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                            <p className="mb-2 text-muted-foreground font-medium">No podcasts yet.</p>
                            {profile.status === "approved" && (
                                <Button
                                    onClick={() => router.visit("/podcasts/create")}
                                    className="mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    Create Your First Podcast
                                </Button>
                            )}
                            {profile.status === "pending" && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Your creator profile is pending approval. You'll be able to create podcasts once approved.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {podcasts.map((podcast) => (
                                <div
                                    key={podcast.id}
                                    className="group cursor-pointer rounded-2xl bg-card overflow-hidden border-none shadow-sm hover:shadow-md transition-all"
                                    onClick={() => router.visit(`/podcasts/${podcast.slug}`)}
                                >
                                    {podcast.cover_image ? (
                                        <div className="overflow-hidden">
                                            <img
                                                src={podcast.cover_image}
                                                alt={podcast.title}
                                                className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                                            <Headphones className="h-12 w-12 text-purple-400" />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="font-semibold text-foreground group-hover:text-purple-600 transition-colors truncate">
                                                {podcast.title}
                                            </h3>
                                            <Badge
                                                variant={podcast.status === "published" ? "default" : "secondary"}
                                                className={
                                                    podcast.status === "published"
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-muted text-foreground border"
                                                }
                                            >
                                                {podcast.status}
                                            </Badge>
                                        </div>
                                        {podcast.description && (
                                            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{podcast.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{podcast.episodes_count ?? 0} episodes</span>
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                {podcast.total_listens?.toLocaleString() ?? 0} listens
                                            </span>
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
