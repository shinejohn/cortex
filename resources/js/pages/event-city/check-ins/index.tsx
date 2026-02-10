import { Head, Link, router } from "@inertiajs/react";
import { CalendarIcon, CheckCircle2Icon, EyeIcon, FilterIcon, MapPinIcon, SearchIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AppLayout from "@/layouts/app-layout";

interface Venue {
    id: string;
    name: string;
    address?: string;
}

interface Event {
    id: string;
    title: string;
    event_date: string;
    venue: Venue | null;
}

interface User {
    id: string;
    name: string;
    avatar?: string;
}

interface CheckIn {
    id: string;
    event_id: string;
    user_id: string;
    location: string | null;
    notes: string | null;
    is_public: boolean;
    checked_in_at: string;
    event: Event;
    user: User;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    checkIns: {
        data: CheckIn[];
        links: PaginationLink[];
        meta: {
            current_page: number;
            from: number | null;
            last_page: number;
            per_page: number;
            to: number | null;
            total: number;
        };
    };
    filters: {
        event_id: string | null;
        user_id: string | null;
        public_only: boolean;
    };
}

export default function CheckInsIndex({ checkIns, filters }: Props) {
    const [eventId, setEventId] = useState(filters.event_id || "");
    const [publicOnly, setPublicOnly] = useState(filters.public_only || false);

    const handleFilter = () => {
        router.get(
            route("check-ins.index") as string,
            {
                ...(eventId ? { event_id: eventId } : {}),
                ...(publicOnly ? { public_only: "1" } : {}),
            },
            { preserveState: true },
        );
    };

    const handleClearFilters = () => {
        setEventId("");
        setPublicOnly(false);
        router.get(route("check-ins.index") as string, {}, { preserveState: true });
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <AppLayout>
            <Head title="Check-Ins" />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-display text-3xl font-black tracking-tight">Check-Ins</h1>
                        <p className="mt-2 text-muted-foreground">See who's attending events in your community.</p>
                    </div>

                    {/* Filters */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <Label htmlFor="event_id" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                                        Event ID
                                    </Label>
                                    <Input
                                        id="event_id"
                                        value={eventId}
                                        onChange={(e) => setEventId(e.target.value)}
                                        placeholder="Filter by event ID..."
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch id="public_only" checked={publicOnly} onCheckedChange={setPublicOnly} />
                                    <Label htmlFor="public_only" className="text-sm">
                                        Public only
                                    </Label>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleFilter} size="sm">
                                        <FilterIcon className="mr-2 size-4" />
                                        Filter
                                    </Button>
                                    <Button onClick={handleClearFilters} variant="outline" size="sm">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results count */}
                    <p className="text-sm text-muted-foreground mb-4">
                        {checkIns.meta.total} check-in{checkIns.meta.total !== 1 ? "s" : ""}
                    </p>

                    {/* Check-in list */}
                    {checkIns.data.length > 0 ? (
                        <div className="space-y-4">
                            {checkIns.data.map((checkIn) => (
                                <Link key={checkIn.id} href={route("check-ins.show", checkIn.id) as string}>
                                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-4">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-4">
                                                {/* User Avatar */}
                                                <Avatar className="size-12 shrink-0">
                                                    <AvatarImage src={checkIn.user?.avatar} />
                                                    <AvatarFallback>{checkIn.user?.name?.[0] || "?"}</AvatarFallback>
                                                </Avatar>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-display font-bold tracking-tight">
                                                                {checkIn.user?.name}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                                checked in to{" "}
                                                                <span className="font-medium text-foreground">
                                                                    {checkIn.event?.title}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {checkIn.is_public ? (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    <EyeIcon className="size-3 mr-1" />
                                                                    Public
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Private
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <CalendarIcon className="size-3.5" />
                                                            {formatTimeAgo(checkIn.checked_in_at)}
                                                        </span>
                                                        {checkIn.event?.venue && (
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPinIcon className="size-3.5" />
                                                                {checkIn.event.venue.name}
                                                            </span>
                                                        )}
                                                        {checkIn.location && (
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPinIcon className="size-3.5" />
                                                                {checkIn.location}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {checkIn.notes && (
                                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 italic">
                                                            "{checkIn.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                            <CardContent className="p-12 text-center">
                                <CheckCircle2Icon className="mx-auto size-12 text-muted-foreground mb-4" />
                                <h3 className="font-display text-lg font-bold tracking-tight mb-2">No check-ins found</h3>
                                <p className="text-sm text-muted-foreground">
                                    {filters.event_id || filters.public_only
                                        ? "Try adjusting your filters to see more results."
                                        : "Check-ins will appear here when people attend events."}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination */}
                    {checkIns.links && checkIns.data.length > 0 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {checkIns.links.map((link: PaginationLink, index: number) =>
                                link.url ? (
                                    <Link key={index} href={link.url}>
                                        <Button
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    </Link>
                                ) : (
                                    <Button
                                        key={index}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        disabled
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
