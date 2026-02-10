import { Head, router, useForm, usePage } from "@inertiajs/react";
import { BookOpen, Calendar, ChevronDown, Clock, Eye, FileText, Search } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

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
    const { auth, stats, articles, calendarData, filters, currentMonth, currentYear } =
        usePage<ArchivePageProps>().props;
    const [selectedDate, setSelectedDate] = useState<string | null>(filters.date || null);
    const [sepiaMode, setSepiaMode] = useState(false);

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
        router.get(
            "/archive",
            { date },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <LocationProvider>
            <div className={`min-h-screen ${sepiaMode ? "bg-amber-50" : "bg-gray-50"}`}>
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

                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Archive Header Card */}
                    <div
                        className={`mb-6 overflow-hidden rounded-lg p-6 shadow-md ${
                            sepiaMode
                                ? "border border-amber-200 bg-amber-100"
                                : "border-none bg-white"
                        }`}
                    >
                        <div className="flex flex-col justify-between md:flex-row md:items-center">
                            <div>
                                <h1 className="mb-2 font-display text-3xl font-black tracking-tight text-gray-900">
                                    News Archives
                                </h1>
                                <p className="text-gray-600">
                                    Explore {stats.total_articles?.toLocaleString() ?? 0} articles
                                    {stats.earliest_date && (
                                        <>
                                            {" "}
                                            from {new Date(stats.earliest_date).getFullYear()} to present
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
                                <button
                                    onClick={() => setSepiaMode(!sepiaMode)}
                                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                        sepiaMode
                                            ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {sepiaMode ? "Modern View" : "Vintage View"}
                                </button>
                                <div className="group relative">
                                    <button className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                        <BookOpen className="mr-1.5 size-4" />
                                        <span>View Options</span>
                                        <ChevronDown className="ml-1.5 size-4" />
                                    </button>
                                    {/* View managed via filters.view from controller */}
                                </div>
                            </div>
                        </div>

                        {/* Archive Stats */}
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <FileText className="size-4 text-indigo-600" />
                                <span className="font-medium text-gray-900">
                                    {stats.total_articles?.toLocaleString() ?? 0}
                                </span>{" "}
                                articles
                            </div>
                            {stats.earliest_date && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="size-4 text-indigo-600" />
                                    Since{" "}
                                    <span className="font-medium text-gray-900">
                                        {new Date(stats.earliest_date).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {stats.most_active_day && (
                                <div className="flex items-center gap-1.5">
                                    <Eye className="size-4 text-indigo-600" />
                                    Most Active:{" "}
                                    <span className="font-medium text-gray-900">
                                        {new Date(stats.most_active_day.date).toLocaleDateString()} (
                                        {stats.most_active_day.count} articles)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Sidebar - Search & Navigation */}
                        <div className="space-y-6 lg:col-span-1">
                            {/* Search Card */}
                            <div
                                className={`overflow-hidden rounded-lg p-4 shadow-sm ${
                                    sepiaMode ? "border border-amber-200 bg-amber-50" : "border-none bg-white"
                                }`}
                            >
                                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-black tracking-tight text-gray-900">
                                    <Search className="size-5 text-indigo-600" />
                                    Search Archive
                                </h3>
                                <form onSubmit={handleSearch} className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            type="text"
                                            value={searchForm.data.search}
                                            onChange={(e) => searchForm.setData("search", e.target.value)}
                                            placeholder="Search archive..."
                                            className="border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Start Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={searchForm.data.start_date}
                                                onChange={(e) => searchForm.setData("start_date", e.target.value)}
                                                className="border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                End Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={searchForm.data.end_date}
                                                onChange={(e) => searchForm.setData("end_date", e.target.value)}
                                                className="border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={searchForm.processing}
                                        className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        Search
                                    </Button>
                                </form>
                            </div>

                            {/* Calendar Card */}
                            <div
                                className={`overflow-hidden rounded-lg p-6 shadow-sm ${
                                    sepiaMode ? "border border-amber-200 bg-amber-50" : "border-none bg-white"
                                }`}
                            >
                                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-black tracking-tight text-gray-900">
                                    <Calendar className="size-5 text-indigo-600" />
                                    Calendar View -{" "}
                                    {new Date(currentYear, currentMonth - 1).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </h3>
                                <div className="grid grid-cols-7 gap-1">
                                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                        <div
                                            key={day}
                                            className="text-center text-xs font-medium text-gray-500"
                                        >
                                            {day}
                                        </div>
                                    ))}
                                    {Array.from({ length: 31 }, (_, i) => {
                                        const day = i + 1;
                                        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                        const count = calendarData?.[dateStr] || 0;
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => handleDateSelect(dateStr)}
                                                className={`rounded p-1.5 text-xs transition-colors ${
                                                    selectedDate === dateStr
                                                        ? "bg-indigo-600 text-white"
                                                        : count > 0
                                                          ? sepiaMode
                                                              ? "bg-amber-200/60 text-amber-900 hover:bg-amber-200"
                                                              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                                          : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                <div>{day}</div>
                                                {count > 0 && (
                                                    <div className="text-[10px] font-medium">{count}</div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Popular Topics */}
                            {stats.popular_topics?.length > 0 && (
                                <div
                                    className={`overflow-hidden rounded-lg p-6 shadow-sm ${
                                        sepiaMode
                                            ? "border border-amber-200 bg-amber-50"
                                            : "border-none bg-white"
                                    }`}
                                >
                                    <h3 className="mb-4 font-display text-lg font-black tracking-tight text-gray-900">
                                        Popular Topics
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.popular_topics.map((topic, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className={`cursor-pointer text-sm ${
                                                    sepiaMode
                                                        ? "border-amber-300 text-amber-800 hover:bg-amber-200/50"
                                                        : "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                                                }`}
                                            >
                                                {topic.name} ({topic.count})
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Content - Articles */}
                        <div className="lg:col-span-2">
                            {articles &&
                            (Array.isArray(articles) ? articles.length > 0 : articles.data?.length > 0) ? (
                                <div>
                                    <h2 className="mb-4 font-display text-2xl font-black tracking-tight text-gray-900">
                                        {selectedDate
                                            ? `Articles from ${new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
                                            : "Articles"}
                                    </h2>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {(Array.isArray(articles) ? articles : articles.data).map(
                                            (article: any) => (
                                                <NewsArticleCard key={article.id} article={article} />
                                            ),
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`overflow-hidden rounded-lg py-12 text-center shadow-sm ${
                                        sepiaMode
                                            ? "border border-amber-200 bg-amber-50"
                                            : "border-none bg-white"
                                    }`}
                                >
                                    <FileText className="mx-auto mb-4 size-12 text-gray-400" />
                                    <h3 className="mb-2 font-display text-xl font-black tracking-tight text-gray-900">
                                        No articles found
                                    </h3>
                                    <p className="text-gray-500">
                                        No articles found for the selected criteria. Try a different date or search
                                        term.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
