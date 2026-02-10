import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon, CalendarIcon, CheckCircle2Icon, ClockIcon, EyeIcon, MapPinIcon, StickyNoteIcon, UserIcon } from "lucide-react";
import { route } from "ziggy-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    email: string;
    avatar?: string;
}

interface CheckIn {
    id: string;
    event_id: string;
    user_id: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    is_public: boolean;
    checked_in_at: string;
    created_at: string;
    event: Event;
    user: User;
}

interface Props {
    checkIn: CheckIn;
}

export default function CheckInShow({ checkIn }: Props) {
    return (
        <AppLayout>
            <Head title={`Check-In: ${checkIn.event?.title}`} />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-2xl">
                    {/* Back Button */}
                    <Button variant="ghost" size="sm" asChild className="mb-6">
                        <Link href={route("check-ins.index") as string}>
                            <ArrowLeftIcon className="mr-2 size-4" />
                            Back to Check-Ins
                        </Link>
                    </Button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <CheckCircle2Icon className="size-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="font-display text-2xl font-black tracking-tight">Check-In Details</h1>
                        <p className="mt-2 text-muted-foreground">
                            Checked in {new Date(checkIn.checked_in_at).toLocaleDateString("en-US", { dateStyle: "long" })}
                        </p>
                    </div>

                    {/* User Info */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-14">
                                    <AvatarImage src={checkIn.user?.avatar} />
                                    <AvatarFallback className="text-lg">{checkIn.user?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Attendee</p>
                                    <p className="font-display text-lg font-bold tracking-tight mt-0.5">{checkIn.user?.name}</p>
                                    <p className="text-sm text-muted-foreground">{checkIn.user?.email}</p>
                                </div>
                                <Badge variant={checkIn.is_public ? "default" : "outline"}>
                                    {checkIn.is_public ? (
                                        <>
                                            <EyeIcon className="size-3 mr-1" />
                                            Public
                                        </>
                                    ) : (
                                        "Private"
                                    )}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Event Info */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Event</p>
                                <p className="font-display text-lg font-bold tracking-tight mt-1">{checkIn.event?.title}</p>
                            </div>

                            <div className="space-y-3">
                                {checkIn.event?.event_date && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarIcon className="size-4 shrink-0" />
                                        {new Date(checkIn.event.event_date).toLocaleDateString("en-US", { dateStyle: "full" })}
                                    </div>
                                )}

                                {checkIn.event?.venue && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPinIcon className="size-4 shrink-0" />
                                        <div>
                                            <span>{checkIn.event.venue.name}</span>
                                            {checkIn.event.venue.address && (
                                                <span className="block text-xs">{checkIn.event.venue.address}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Check-In Details */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Checked In At</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <ClockIcon className="size-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            {new Date(checkIn.checked_in_at).toLocaleString("en-US", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Visibility</p>
                                    <p className="text-sm font-medium mt-1">{checkIn.is_public ? "Public" : "Private"}</p>
                                </div>
                            </div>

                            {checkIn.location && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Location</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPinIcon className="size-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{checkIn.location}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {checkIn.latitude && checkIn.longitude && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Latitude</p>
                                        <p className="text-sm font-mono mt-1">{checkIn.latitude}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Longitude</p>
                                        <p className="text-sm font-mono mt-1">{checkIn.longitude}</p>
                                    </div>
                                </div>
                            )}

                            {checkIn.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Notes</p>
                                        <div className="flex items-start gap-2 mt-2">
                                            <StickyNoteIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <p className="text-sm text-muted-foreground italic">"{checkIn.notes}"</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
