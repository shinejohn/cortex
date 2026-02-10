import { Head, router, usePage } from "@inertiajs/react";
import { ArrowRight, BarChart3, Headphones, Mic, Play, Plus, TrendingUp, Users } from "lucide-react";
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
            return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
        case "pending":
            return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
        case "rejected":
            return "bg-red-50 text-red-700 ring-1 ring-red-200";
        case "suspended":
            return "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
        default:
            return "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
    }
};

export default function CreatorDashboard() {
    const { auth, profile, podcasts } = usePage<CreatorDashboardPageProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title="Creator Dashboard - Local Voices" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Creator Dashboard - Local Voices",
                        description: "Manage your podcasts and episodes",
                        url: route("daynews.local-voices.dashboard") as any,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className="mb-8 overflow-hidden rounded-2xl border-none bg-white shadow-sm">
                        {/* Cover image */}
                        {profile.cover_image && (
                            <div className="h-48 w-full">
                                <img src={profile.cover_image} alt="Cover" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                                {/* Avatar */}
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt={profile.display_name}
                                        className={`size-24 rounded-full object-cover ring-4 ring-white shadow-md ${profile.cover_image ? "-mt-16" : ""}`}
                                    />
                                ) : (
                                    <div className={`flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 ring-4 ring-white shadow-md ${profile.cover_image ? "-mt-16" : ""}`}>
                                        <Mic className="size-10 text-indigo-300" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-3">
                                        <h1 className="font-display text-3xl font-black tracking-tight text-zinc-900">{profile.display_name}</h1>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(profile.status)}`}>
                                            {profile.status.toUpperCase()}
                                        </span>
                                    </div>
                                    {profile.bio && <p className="max-w-2xl text-zinc-500">{profile.bio}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50">
                                    <Mic className="size-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Podcasts</p>
                                    <p className="text-2xl font-black text-zinc-900">{profile.podcasts_count}</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50">
                                    <Play className="size-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Episodes</p>
                                    <p className="text-2xl font-black text-zinc-900">{profile.episodes_count}</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-violet-50">
                                    <Users className="size-6 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Followers</p>
                                    <p className="text-2xl font-black text-zinc-900">{profile.followers_count}</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50">
                                    <Headphones className="size-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Listens</p>
                                    <p className="text-2xl font-black text-zinc-900">{profile.total_listens.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Podcasts Section */}
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-display text-2xl font-black tracking-tight text-zinc-900">Your Podcasts</h2>
                            {profile.status === "approved" && (
                                <Button
                                    onClick={() => router.visit(route("daynews.local-voices.podcast.create") as any)}
                                    className="rounded-xl font-bold shadow-lg shadow-primary/20"
                                >
                                    <Plus className="mr-2 size-4" />
                                    Create Podcast
                                </Button>
                            )}
                        </div>

                        {podcasts.length === 0 ? (
                            <div className="rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-16 text-center">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50">
                                    <Headphones className="size-8 text-indigo-400" />
                                </div>
                                <h3 className="mb-2 font-display text-xl font-black tracking-tight text-zinc-900">No podcasts yet</h3>
                                <p className="mx-auto mb-6 max-w-md text-zinc-500">
                                    {profile.status === "approved"
                                        ? "Create your first podcast and start sharing your voice with the community."
                                        : "Your creator profile is pending approval. You'll be able to create podcasts once approved."}
                                </p>
                                {profile.status === "approved" && (
                                    <Button
                                        onClick={() => router.visit(route("daynews.local-voices.podcast.create") as any)}
                                        className="rounded-xl font-bold shadow-lg shadow-primary/20"
                                    >
                                        Create Your First Podcast
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {podcasts.map((podcast) => (
                                    <div
                                        key={podcast.id}
                                        className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all hover:shadow-md"
                                        onClick={() => router.visit(route("daynews.local-voices.podcast.show", podcast.slug) as any)}
                                    >
                                        {/* Podcast cover */}
                                        <div className="relative aspect-[16/10] overflow-hidden">
                                            {podcast.cover_image ? (
                                                <img
                                                    src={podcast.cover_image}
                                                    alt={podcast.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50">
                                                    <Headphones className="size-12 text-indigo-300" />
                                                </div>
                                            )}
                                            {/* Status badge overlay */}
                                            <div className="absolute right-3 top-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                        podcast.status === "published"
                                                            ? "bg-emerald-500/90 text-white"
                                                            : "bg-white/90 text-zinc-600 ring-1 ring-zinc-200"
                                                    }`}
                                                >
                                                    {podcast.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <h3 className="mb-1 font-display text-lg font-bold tracking-tight text-zinc-900 group-hover:text-primary">
                                                {podcast.title}
                                            </h3>
                                            {podcast.description && (
                                                <p className="mb-4 line-clamp-2 text-sm text-zinc-500">{podcast.description}</p>
                                            )}

                                            {/* Stats */}
                                            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Play className="size-3.5 text-primary" />
                                                    <span className="font-bold text-zinc-600">{podcast.episodes_count}</span> episodes
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Headphones className="size-3.5 text-blue-500" />
                                                    <span className="font-bold text-zinc-600">{podcast.total_listens.toLocaleString()}</span> listens
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Podcast Card */}
                                {profile.status === "approved" && (
                                    <div
                                        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white/50 p-8 transition-all hover:border-primary/40 hover:bg-primary/5"
                                        onClick={() => router.visit(route("daynews.local-voices.podcast.create") as any)}
                                    >
                                        <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                                            <Plus className="size-6 text-primary" />
                                        </div>
                                        <p className="font-bold text-zinc-700">Add New Podcast</p>
                                        <p className="mt-1 text-sm text-zinc-400">Create another show</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
