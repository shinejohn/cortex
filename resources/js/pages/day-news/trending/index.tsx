import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Clock, MessageCircle, Share2, Heart, TrendingUp, Users } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface TrendingPageProps {
    auth?: Auth;
    timePeriod: string;
    category: string;
    trendingStories: any[];
    trendingTopics: Array<{
        id: number;
        name: string;
        slug: string;
        count: number;
    }>;
    trendingCategories: Array<{
        name: string;
        count: number;
        views: number;
    }>;
    trendingPeople: Array<{
        id: string;
        name: string;
        avatar: string;
        posts_count: number;
    }>;
    communityPulse: {
        hourly: number[];
        peak_hour: number;
        total_today: number;
    };
    engagementStats?: {
        comment_count: number;
        contributor_count: number;
        share_count: number;
        reaction_count: number;
    };
    activeReaders: number;
}

export default function TrendingIndex() {
    const { auth, timePeriod, category, trendingStories, trendingTopics, trendingCategories, trendingPeople, communityPulse, engagementStats, activeReaders } =
        usePage<TrendingPageProps>().props;

    const form = useForm({
        period: timePeriod,
        category: category,
    });

    const handlePeriodChange = (period: string) => {
        form.setData("period", period);
        form.get("/trending", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const timePeriods = [
        { value: "now", label: "Now" },
        { value: "hour", label: "Last Hour" },
        { value: "day", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
    ];

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <Head title="Trending - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Trending - Day News",
                        description: "What's trending in your community",
                        url: "/trending",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                            <div>
                                <h1 className="mb-2 flex items-center font-display text-3xl font-black tracking-tight text-gray-900">
                                    <TrendingUp className="mr-2 size-8 text-indigo-600" />
                                    Trending
                                </h1>
                                <p className="text-gray-600">
                                    What your neighbors are talking about right now
                                </p>
                            </div>
                            <div className="mt-4 flex items-center gap-6 md:mt-0">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="mr-1.5 size-4 text-indigo-600" />
                                    <span>{activeReaders ?? 0} people exploring trends</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="mr-1.5 size-4" />
                                    <span>Updated just now</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time Period Toggle */}
                    <div className="mb-8">
                        <div className="inline-flex overflow-hidden rounded-lg border-none bg-white p-1.5 shadow-sm">
                            {timePeriods.map((period) => (
                                <button
                                    key={period.value}
                                    onClick={() => handlePeriodChange(period.value)}
                                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                        timePeriod === period.value
                                            ? "bg-indigo-600 text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trending Stories */}
                    {trendingStories.length > 0 && (
                        <div className="mb-8">
                            <div className="mb-4 flex items-center gap-2">
                                <TrendingUp className="size-5 text-indigo-600" />
                                <h2 className="font-display text-2xl font-black tracking-tight text-gray-900">
                                    Trending Stories
                                </h2>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {trendingStories.map((story: any) => (
                                    <NewsArticleCard key={story.id} article={story} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content - 2 columns */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Trending Topics */}
                            {trendingTopics.length > 0 && (
                                <div className="overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 font-display text-xl font-black tracking-tight text-gray-900">
                                        Trending Topics
                                    </h3>
                                    <div className="space-y-2">
                                        {trendingTopics.map((topic) => (
                                            <div
                                                key={topic.id}
                                                className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-indigo-50/50"
                                                onClick={() => router.visit(`/tags/${topic.slug}`)}
                                            >
                                                <span className="font-medium text-gray-900">{topic.name}</span>
                                                <Badge className="bg-indigo-100 text-indigo-700">
                                                    {topic.count} mentions
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Community Pulse */}
                            {communityPulse && (
                                <div className="overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 font-display text-xl font-black tracking-tight text-gray-900">
                                        Community Pulse
                                    </h3>
                                    <div className="mb-3 text-sm text-gray-500">
                                        Activity over the last 24 hours
                                        {communityPulse.peak_hour !== undefined && (
                                            <> * Peak: {communityPulse.peak_hour}:00</>
                                        )}
                                        {communityPulse.total_today !== undefined && (
                                            <> * Total: {communityPulse.total_today} articles</>
                                        )}
                                    </div>
                                    <div className="flex h-32 items-end gap-1">
                                        {communityPulse.hourly?.map((count, hour) => (
                                            <div
                                                key={hour}
                                                className="flex-1 rounded-t bg-indigo-500 transition-all hover:bg-indigo-600"
                                                style={{
                                                    height: `${(count / Math.max(...(communityPulse.hourly || [1]), 1)) * 100}%`,
                                                }}
                                                title={`${hour}:00 - ${count} articles`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - 1 column */}
                        <div className="space-y-6">
                            {/* Trending Categories */}
                            {trendingCategories.length > 0 && (
                                <div className="overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 font-display text-xl font-black tracking-tight text-gray-900">
                                        Trending Categories
                                    </h3>
                                    <div className="space-y-2">
                                        {trendingCategories.map((cat, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50"
                                            >
                                                <span className="font-medium text-gray-900">{cat.name}</span>
                                                <div className="text-right text-sm text-gray-500">
                                                    <div>{cat.count} articles</div>
                                                    <div>{cat.views?.toLocaleString() ?? 0} views</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trending People */}
                            {trendingPeople.length > 0 && (
                                <div className="overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 font-display text-xl font-black tracking-tight text-gray-900">
                                        Trending Authors
                                    </h3>
                                    <div className="space-y-3">
                                        {trendingPeople.map((person) => (
                                            <div
                                                key={person.id}
                                                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-indigo-50/50"
                                                onClick={() => router.visit(`/authors/${person.id}`)}
                                            >
                                                <img
                                                    src={person.avatar}
                                                    alt={person.name}
                                                    className="size-10 rounded-full object-cover"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{person.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {person.posts_count} articles
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Community Engagement Summary */}
                            <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                                <div className="border-b border-gray-200 p-4">
                                    <h3 className="flex items-center font-bold text-gray-900">
                                        <Share2 className="mr-2 size-5 text-indigo-600" />
                                        Community Engagement
                                    </h3>
                                </div>
                                <div className="space-y-4 p-4">
                                    {/* Comments */}
                                    <div>
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <MessageCircle className="size-3.5" />
                                                Comments
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {engagementStats?.comment_count?.toLocaleString() ?? 0}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100">
                                            <div className="h-full w-[78%] rounded-full bg-blue-500" />
                                        </div>
                                    </div>
                                    {/* Shares */}
                                    <div>
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Share2 className="size-3.5" />
                                                Shares
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {engagementStats?.share_count?.toLocaleString() ?? 0}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100">
                                            <div className="h-full w-[65%] rounded-full bg-green-500" />
                                        </div>
                                    </div>
                                    {/* Reactions */}
                                    <div>
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Heart className="size-3.5" />
                                                Reactions
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {engagementStats?.reaction_count?.toLocaleString() ?? 0}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100">
                                            <div className="h-full w-[82%] rounded-full bg-yellow-500" />
                                        </div>
                                    </div>
                                    {/* New Contributors */}
                                    <div>
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Users className="size-3.5" />
                                                New Contributors
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {engagementStats?.contributor_count?.toLocaleString() ?? 0}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100">
                                            <div className="h-full w-[42%] rounded-full bg-purple-500" />
                                        </div>
                                    </div>

                                    {/* Peak Activity */}
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Peak Activity Time</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {communityPulse?.peak_hour !== undefined
                                                    ? `${communityPulse.peak_hour}:00`
                                                    : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
