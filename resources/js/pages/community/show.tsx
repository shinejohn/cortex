import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CommunityFilters, CommunityShowPageProps, CommunityThread, ThreadAuthor } from "@/types/community";
import { Head, router, usePage } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    AlertCircleIcon,
    ArrowLeftIcon,
    BriefcaseIcon,
    CalendarIcon,
    CheckIcon,
    EyeIcon,
    FilterIcon,
    HelpCircleIcon,
    MessageCircleIcon,
    MessageSquareIcon,
    PlusIcon,
    SearchIcon,
    TagIcon,
    UsersIcon,
    XIcon,
} from "lucide-react";
import { useState } from "react";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export default function CommunityShow() {
    const { auth, community, threads, filters = {}, sort = { sortBy: "recent" } } = usePage<CommunityShowPageProps>().props;

    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState<Partial<CommunityFilters>>({
        threadType: filters.threadType || "",
        tag: filters.tag || "",
        author: filters.author || "",
        dateRange: filters.dateRange || "",
        sortBy: sort.sortBy || "recent",
    });

    const handleFilterChange = (filterName: keyof CommunityFilters, value: string): void => {
        const newFilters = { ...localFilters, [filterName]: value };
        setLocalFilters(newFilters);

        // Update URL with new filters
        router.get(
            window.location.pathname,
            {
                ...newFilters,
                search: searchQuery,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = (): void => {
        setLocalFilters({
            threadType: "",
            tag: "",
            author: "",
            dateRange: "",
            sortBy: "recent",
        });
        setSearchQuery("");

        router.get(
            window.location.pathname,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSearch = (): void => {
        router.get(
            window.location.pathname,
            {
                ...localFilters,
                search: searchQuery,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleStartThread = (): void => {
        router.visit(`/community/${community.id}/new-thread`);
    };

    const handleViewThread = (threadId: string): void => {
        router.visit(`/community/${community.id}/thread/${threadId}`);
    };

    const getUniqueAuthors = (): ThreadAuthor[] => {
        if (!threads.data.length) return [];
        const authorsMap = new Map();
        threads.data.forEach((thread) => {
            if (!authorsMap.has(thread.author.id)) {
                authorsMap.set(thread.author.id, thread.author);
            }
        });
        return Array.from(authorsMap.values());
    };

    return (
        <>
            <Head title={`${community.name} - Community`} />
            <Header auth={auth} />

            {/* Community Header */}
            <div className="bg-primary/5 text-foreground relative border-b border-border">
                {community.image && (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${community.image})`,
                            }}
                        />
                        <div className="absolute inset-0 bg-background/80" />
                    </>
                )}
                <div className="relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center mb-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit("/community")}
                                className="text-muted-foreground hover:text-foreground p-0"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                Back to Communities
                            </Button>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">{community.name} - Community</h1>
                                <p className="mt-2 text-muted-foreground max-w-2xl">
                                    Connect with {community.memberCount.toLocaleString()} members in the {community.name.toLowerCase()} community.
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <Button onClick={handleStartThread}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Start a Thread
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Thread Type Pills */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <Button
                        variant={!localFilters.threadType ? "default" : "outline"}
                        onClick={() => handleFilterChange("threadType", "")}
                        className="rounded-full"
                    >
                        All Threads
                    </Button>
                    {community.threadTypes.map((type) => (
                        <Button
                            key={type}
                            variant={localFilters.threadType === type ? "default" : "outline"}
                            onClick={() => handleFilterChange("threadType", type)}
                            className="rounded-full"
                        >
                            {type}
                        </Button>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="bg-card rounded-lg border p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Search discussions..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>

                        {/* Sort By Dropdown */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">Sort by:</label>
                            <select
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={localFilters.sortBy}
                                onChange={(e) => handleFilterChange("sortBy", e.target.value as CommunityFilters["sortBy"])}
                            >
                                <option value="recent">Most Recent</option>
                                <option value="popular">Most Popular</option>
                                <option value="unanswered">Unanswered</option>
                            </select>
                        </div>

                        {/* Filter Toggle Button */}
                        <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters(!showFilters)}>
                            <FilterIcon className="h-4 w-4 mr-2" />
                            <span>Filters</span>
                            {(localFilters.tag || localFilters.author || localFilters.dateRange || searchQuery) && (
                                <Badge variant="secondary" className="ml-2">
                                    Active
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Tags Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        <div className="flex items-center">
                                            <TagIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                            Tags
                                        </div>
                                    </label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={localFilters.tag}
                                        onChange={(e) => handleFilterChange("tag", e.target.value)}
                                    >
                                        <option value="">All Tags</option>
                                        {community.popularTags.map((tag) => (
                                            <option key={tag} value={tag}>
                                                {tag}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Author Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        <div className="flex items-center">
                                            <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                            Author
                                        </div>
                                    </label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={localFilters.author}
                                        onChange={(e) => handleFilterChange("author", e.target.value)}
                                    >
                                        <option value="">All Authors</option>
                                        {getUniqueAuthors().map((author) => (
                                            <option key={author.id} value={author.name}>
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        <div className="flex items-center">
                                            <FilterIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                            Date Range
                                        </div>
                                    </label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={localFilters.dateRange}
                                        onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                                    >
                                        <option value="">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>
                            </div>

                            {/* Filter Actions */}
                            <div className="mt-4 flex justify-end gap-2">
                                <Button variant="ghost" onClick={clearFilters}>
                                    Clear All
                                </Button>
                                <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Threads List */}
                    <div className="w-full lg:w-2/3">
                        {/* Threads Count */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {threads.data.length} Thread
                                {threads.data.length !== 1 ? "s" : ""}
                            </h2>
                            {(localFilters.tag || localFilters.author || localFilters.dateRange || localFilters.threadType || searchQuery) && (
                                <div className="flex flex-wrap gap-2">
                                    {localFilters.threadType && (
                                        <Badge variant="secondary" className="gap-1">
                                            {localFilters.threadType}
                                            <button onClick={() => handleFilterChange("threadType", "")}>
                                                <XIcon className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    {localFilters.tag && (
                                        <Badge variant="secondary" className="gap-1">
                                            Tag: {localFilters.tag}
                                            <button onClick={() => handleFilterChange("tag", "")}>
                                                <XIcon className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    {localFilters.author && (
                                        <Badge variant="secondary" className="gap-1">
                                            By: {localFilters.author}
                                            <button onClick={() => handleFilterChange("author", "")}>
                                                <XIcon className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    {searchQuery && (
                                        <Badge variant="secondary" className="gap-1">
                                            Search: "{searchQuery}"
                                            <button
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    handleSearch();
                                                }}
                                            >
                                                <XIcon className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Threads List */}
                        {threads.data.length === 0 ? (
                            <div className="bg-card rounded-lg p-8 text-center">
                                <MessageCircleIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-lg font-medium">No threads found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    We couldn't find any threads matching your criteria. Try adjusting your filters or search term.
                                </p>
                                <div className="mt-6">
                                    <Button onClick={clearFilters}>Clear all filters</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {threads.data.map((thread) => (
                                    <ThreadCard key={thread.id} thread={thread} onClick={() => handleViewThread(thread.id)} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-1/3">
                        {/* Community Stats */}
                        <div className="bg-card rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-bold mb-4">Community Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Members</span>
                                    <span className="font-medium">{community.memberCount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Threads</span>
                                    <span className="font-medium">{threads.data.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Active Today</span>
                                    <span className="font-medium">{Math.floor(community.memberCount * 0.12)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">New This Week</span>
                                    <span className="font-medium">{Math.floor(threads.data.length * 0.28)}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <Button onClick={handleStartThread} className="w-full">
                                    Start a New Thread
                                </Button>
                            </div>
                        </div>

                        {/* Community Guidelines */}
                        <div className="bg-card rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-bold mb-3">Community Guidelines</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start">
                                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                    <span>Be respectful and constructive in discussions</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                    <span>Stay on topic and use appropriate tags</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                    <span>No promotional content without permission</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                    <span>Respect others' privacy and intellectual property</span>
                                </li>
                            </ul>
                        </div>

                        {/* Popular Tags */}
                        <div className="bg-card rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-3">Popular Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {community.popularTags.map((tag) => (
                                    <Button
                                        key={tag}
                                        variant={localFilters.tag === tag ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleFilterChange("tag", tag)}
                                        className="rounded-full"
                                    >
                                        {tag}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

// Thread Card Component
interface ThreadCardProps {
    thread: CommunityThread;
    onClick: () => void;
}

const ThreadCard = ({ thread, onClick }: ThreadCardProps) => {
    const getThreadTypeIcon = (type: string) => {
        switch (type) {
            case "Question":
                return <HelpCircleIcon className="h-5 w-5 text-chart-2" />;
            case "Announcement":
                return <AlertCircleIcon className="h-5 w-5 text-destructive" />;
            case "Resource":
                return <BriefcaseIcon className="h-5 w-5 text-chart-3" />;
            case "Event":
                return <CalendarIcon className="h-5 w-5 text-chart-4" />;
            case "Discussion":
            default:
                return <MessageSquareIcon className="h-5 w-5 text-primary" />;
        }
    };

    const getThreadTypeBadgeColor = (type: string): string => {
        switch (type) {
            case "Question":
                return "bg-chart-2/10 text-chart-2 border-chart-2/20";
            case "Announcement":
                return "bg-destructive/10 text-destructive border-destructive/20";
            case "Resource":
                return "bg-chart-3/10 text-chart-3 border-chart-3/20";
            case "Event":
                return "bg-chart-4/10 text-chart-4 border-chart-4/20";
            case "Discussion":
            default:
                return "bg-primary/10 text-primary border-primary/20";
        }
    };

    return (
        <div className="bg-card rounded-lg border hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={onClick}>
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <div className="mr-3">{getThreadTypeIcon(thread.type)}</div>
                        <div>
                            <h3 className="text-lg font-medium hover:text-primary">{thread.title}</h3>
                            <div className="flex items-center mt-1 space-x-2">
                                <Badge className={getThreadTypeBadgeColor(thread.type)}>{thread.type}</Badge>
                                {thread.isPinned && <Badge variant="outline">Pinned</Badge>}
                                {thread.isLocked && <Badge variant="outline">Locked</Badge>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <span>{dayjs(thread.createdAt).fromNow()}</span>
                    </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{thread.preview}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {thread.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                    {thread.tags.length > 3 && <Badge variant="secondary">+{thread.tags.length - 3} more</Badge>}
                </div>
                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={thread.author.avatar} alt={thread.author.name} className="h-6 w-6 rounded-full mr-2" />
                        <span className="text-sm font-medium">{thread.author.name}</span>
                        {thread.author.role && <span className="ml-2 text-xs text-muted-foreground">• {thread.author.role}</span>}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <MessageCircleIcon className="h-4 w-4 mr-1" />
                            <span>{thread.replyCount}</span>
                        </div>
                        <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            <span>{thread.viewsCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
