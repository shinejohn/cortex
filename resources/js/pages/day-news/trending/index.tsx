import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Clock, TrendingUp, Users } from "lucide-react";
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
    activeReaders: number;
}

export default function TrendingIndex() {
    const { auth, timePeriod, category, trendingStories, trendingTopics, trendingCategories, trendingPeople, communityPulse, activeReaders } =
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
            <div className="min-h-screen bg-background">
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

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h1 className="text-4xl font-bold">Trending</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="size-4" />
                                <span>{activeReaders} active readers</span>
                            </div>
                        </div>

                        {/* Time Period Selector */}
                        <div className="flex flex-wrap gap-2">
                            {timePeriods.map((period) => (
                                <Button
                                    key={period.value}
                                    variant={timePeriod === period.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePeriodChange(period.value)}
                                >
                                    <Clock className="mr-2 size-4" />
                                    {period.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Trending Stories */}
                    {trendingStories.length > 0 && (
                        <div className="mb-8">
                            <div className="mb-4 flex items-center gap-2">
                                <TrendingUp className="size-5 text-primary" />
                                <h2 className="text-2xl font-bold">Trending Stories</h2>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {trendingStories.map((story: any) => (
                                    <NewsArticleCard key={story.id} article={story} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Trending Topics */}
                        {trendingTopics.length > 0 && (
                            <div className="rounded-lg border bg-card p-6">
                                <h3 className="mb-4 text-xl font-bold">Trending Topics</h3>
                                <div className="space-y-2">
                                    {trendingTopics.map((topic) => (
                                        <div
                                            key={topic.id}
                                            className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-muted"
                                            onClick={() => router.visit(`/tags/${topic.slug}`)}
                                        >
                                            <span className="font-medium">{topic.name}</span>
                                            <Badge variant="secondary">{topic.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trending Categories */}
                        {trendingCategories.length > 0 && (
                            <div className="rounded-lg border bg-card p-6">
                                <h3 className="mb-4 text-xl font-bold">Trending Categories</h3>
                                <div className="space-y-2">
                                    {trendingCategories.map((cat, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg p-2">
                                            <span className="font-medium">{cat.name}</span>
                                            <div className="text-right text-sm text-muted-foreground">
                                                <div>{cat.count} articles</div>
                                                <div>{cat.views.toLocaleString()} views</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trending People */}
                        {trendingPeople.length > 0 && (
                            <div className="rounded-lg border bg-card p-6">
                                <h3 className="mb-4 text-xl font-bold">Trending Authors</h3>
                                <div className="space-y-3">
                                    {trendingPeople.map((person) => (
                                        <div
                                            key={person.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted"
                                            onClick={() => router.visit(`/authors/${person.id}`)}
                                        >
                                            <img src={person.avatar} alt={person.name} className="size-10 rounded-full object-cover" />
                                            <div className="flex-1">
                                                <div className="font-medium">{person.name}</div>
                                                <div className="text-xs text-muted-foreground">{person.posts_count} articles</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Community Pulse */}
                    {communityPulse && (
                        <div className="mt-8 rounded-lg border bg-card p-6">
                            <h3 className="mb-4 text-xl font-bold">Community Pulse</h3>
                            <div className="mb-2 text-sm text-muted-foreground">
                                Activity over the last 24 hours • Peak: {communityPulse.peak_hour}:00 • Total: {communityPulse.total_today} articles
                            </div>
                            <div className="flex h-32 items-end gap-1">
                                {communityPulse.hourly.map((count, hour) => (
                                    <div
                                        key={hour}
                                        className="flex-1 rounded-t bg-primary"
                                        style={{
                                            height: `${(count / Math.max(...communityPulse.hourly, 1)) * 100}%`,
                                        }}
                                        title={`${hour}:00 - ${count} articles`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}
