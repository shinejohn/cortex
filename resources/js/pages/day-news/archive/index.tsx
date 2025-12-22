import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Clock, FileText, Search, Eye } from "lucide-react";
import { useState } from "react";

interface ArchivePageProps {
    auth?: Auth;
    stats: {
        total_articles: number;
        earliest_date: string | null;
        most_active_day: {
            date: string;
            count: number;
        } | null;
        popular_topics: Array<{
            name: string;
            count: number;
        }>;
    };
    articles: any;
    calendarData: Record<string, number>;
    filters: {
        view: string;
        date: string | null;
        start_date: string | null;
        end_date: string | null;
        search: string;
        categories: string[];
    };
    currentMonth: number;
    currentYear: number;
}

export default function ArchiveIndex() {
    const { auth, stats, articles, calendarData, filters, currentMonth, currentYear } = usePage<ArchivePageProps>().props;
    const [selectedDate, setSelectedDate] = useState<string | null>(filters.date || null);

    const searchForm = useForm({
        search: filters.search || "",
        start_date: filters.start_date || "",
        end_date: filters.end_date || "",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/archive", {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        router.get("/archive", { date }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Archive - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Archive - Day News",
                        description: "Browse historical articles and news",
                        url: "/archive",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="mb-4 text-4xl font-bold">Archive</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <FileText className="size-4" />
                                <span>{stats.total_articles.toLocaleString()} articles</span>
                            </div>
                            {stats.earliest_date && (
                                <div className="flex items-center gap-1">
                                    <Clock className="size-4" />
                                    <span>Since {new Date(stats.earliest_date).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mb-6 rounded-lg border bg-card p-4">
                        <div className="mb-4 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search archive..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing}>
                                Search
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Start Date</label>
                                <Input
                                    type="date"
                                    value={searchForm.data.start_date}
                                    onChange={(e) => searchForm.setData("start_date", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">End Date</label>
                                <Input
                                    type="date"
                                    value={searchForm.data.end_date}
                                    onChange={(e) => searchForm.setData("end_date", e.target.value)}
                                />
                            </div>
                        </div>
                    </form>

                    {/* Calendar */}
                    <div className="mb-8 rounded-lg border bg-card p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                            <Calendar className="size-5" />
                            Calendar View - {new Date(currentYear, currentMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </h3>
                        <div className="grid grid-cols-7 gap-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                            {/* Calendar days would go here - simplified for now */}
                            {Array.from({ length: 31 }, (_, i) => {
                                const day = i + 1;
                                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const count = calendarData[dateStr] || 0;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateSelect(dateStr)}
                                        className={`rounded p-2 text-sm transition-colors ${
                                            selectedDate === dateStr
                                                ? "bg-primary text-primary-foreground"
                                                : count > 0
                                                  ? "bg-muted hover:bg-muted/80"
                                                  : "hover:bg-muted/50"
                                        }`}
                                    >
                                        <div>{day}</div>
                                        {count > 0 && <div className="text-xs">{count}</div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Popular Topics */}
                    {stats.popular_topics.length > 0 && (
                        <div className="mb-8 rounded-lg border bg-card p-6">
                            <h3 className="mb-4 text-xl font-bold">Popular Topics</h3>
                            <div className="flex flex-wrap gap-2">
                                {stats.popular_topics.map((topic, index) => (
                                    <Badge key={index} variant="outline" className="text-sm">
                                        {topic.name} ({topic.count})
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Articles */}
                    {articles && (Array.isArray(articles) ? articles.length > 0 : articles.data?.length > 0) && (
                        <div>
                            <h2 className="mb-4 text-2xl font-bold">Articles</h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {(Array.isArray(articles) ? articles : articles.data).map((article: any) => (
                                    <NewsArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        </div>
                    )}

                    {(!articles || (Array.isArray(articles) ? articles.length === 0 : articles.data?.length === 0)) && (
                        <div className="py-12 text-center">
                            <FileText className="mx-auto mb-4 size-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No articles found for the selected criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}

