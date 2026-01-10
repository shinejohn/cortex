import { Head, router, usePage } from "@inertiajs/react";
import { Headphones, Mic, Plus, Users } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
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
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "approved":
            return "bg-green-100 text-green-700";
        case "pending":
            return "bg-yellow-100 text-yellow-700";
        case "rejected":
            return "bg-destructive/10 text-destructive";
        case "suspended":
            return "bg-muted text-foreground";
        default:
            return "bg-muted text-foreground";
    }
};

export default function CreatorDashboard() {
    const { auth, profile, podcasts } = usePage<CreatorDashboardPageProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Creator Dashboard - Local Voices" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Creator Dashboard - Local Voices",
                        description: "Manage your podcasts and episodes",
                        url: "/local-voices/dashboard",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className="mb-8 rounded-lg border bg-card p-8">
                        {profile.cover_image && (
                            <div className="mb-6 -mx-8 -mt-8">
                                <img src={profile.cover_image} alt="Cover" className="h-48 w-full object-cover" />
                            </div>
                        )}
                        <div className="flex items-start gap-6">
                            {profile.avatar && <img src={profile.avatar} alt={profile.display_name} className="size-24 rounded-full object-cover" />}
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                    <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                                    <Badge className={getStatusColor(profile.status)}>{profile.status.toUpperCase()}</Badge>
                                </div>
                                {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-8 grid gap-4 md:grid-cols-4">
                        <div className="rounded-lg border bg-card p-4">
                            <div className="text-sm text-muted-foreground">Podcasts</div>
                            <div className="text-2xl font-bold">{profile.podcasts_count}</div>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="text-sm text-muted-foreground">Episodes</div>
                            <div className="text-2xl font-bold">{profile.episodes_count}</div>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="text-sm text-muted-foreground">Followers</div>
                            <div className="text-2xl font-bold">{profile.followers_count}</div>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="text-sm text-muted-foreground">Total Listens</div>
                            <div className="text-2xl font-bold">{profile.total_listens.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Podcasts */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Your Podcasts</h2>
                            {profile.status === "approved" && (
                                <Button onClick={() => router.visit("/local-voices/podcasts/create")}>
                                    <Plus className="mr-2 size-4" />
                                    Create Podcast
                                </Button>
                            )}
                        </div>
                        {podcasts.length === 0 ? (
                            <div className="rounded-lg border bg-card p-12 text-center">
                                <Headphones className="mx-auto mb-4 size-12 text-muted-foreground" />
                                <p className="mb-4 text-muted-foreground">No podcasts yet.</p>
                                {profile.status === "approved" && (
                                    <Button onClick={() => router.visit("/local-voices/podcasts/create")}>Create Your First Podcast</Button>
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
                                        className="cursor-pointer rounded-lg border bg-card transition-shadow hover:shadow-md"
                                        onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}`)}
                                    >
                                        {podcast.cover_image ? (
                                            <img src={podcast.cover_image} alt={podcast.title} className="h-48 w-full rounded-t-lg object-cover" />
                                        ) : (
                                            <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-muted">
                                                <Headphones className="size-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <h3 className="font-semibold">{podcast.title}</h3>
                                                <Badge variant={podcast.status === "published" ? "default" : "secondary"}>{podcast.status}</Badge>
                                            </div>
                                            {podcast.description && (
                                                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{podcast.description}</p>
                                            )}
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
            </div>
        </LocationProvider>
    );
}
