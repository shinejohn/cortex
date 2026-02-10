import React from "react";
import { Link } from "@inertiajs/react";
import { Heart, MessageSquare, MapPin, Share2, ArrowRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FeaturedAnnouncementProps {
    announcement: any;
}

export function FeaturedAnnouncement({ announcement }: FeaturedAnnouncementProps) {
    if (!announcement) return null;

    return (
        <div className="group relative overflow-hidden rounded-3xl border-none bg-card shadow-lg transition-all hover:shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative aspect-square lg:aspect-auto overflow-hidden">
                    {announcement.image ? (
                        <img
                            src={announcement.image}
                            alt={announcement.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/5">
                            <Badge variant="outline" className="opacity-20 scale-150">{announcement.type}</Badge>
                        </div>
                    )}

                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    <div className="absolute top-6 left-6">
                        <Badge className="bg-primary px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl">
                            Featured Spotlight
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col p-8 lg:p-12">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-black border-primary/20 text-primary">
                                {announcement.type?.replace("_", " ")}
                            </Badge>
                            <span className="text-xs font-bold text-muted-foreground">
                                • {announcement.published_at_diff ?? ""}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" className="size-9 rounded-full bg-muted/50">
                            <Share2 className="size-4" />
                        </Button>
                    </div>

                    <h2 className="mb-6 font-display text-3xl font-black leading-tight tracking-tight lg:text-4xl">
                        {announcement.title}
                    </h2>

                    <p className="mb-8 line-clamp-4 text-lg text-muted-foreground leading-relaxed">
                        {announcement.content}
                    </p>

                    <div className="mt-auto flex flex-col gap-8">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <MapPin className="size-5 text-primary" />
                                <span className="font-bold">{announcement.location ?? "Local Community"}</span>
                            </div>
                            {announcement.event_date && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-5 text-primary" />
                                    <span className="font-bold">{announcement.event_date_formatted ?? announcement.event_date}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-6 border-l pl-6">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                                        <Heart className="size-5 fill-current" />
                                    </div>
                                    <span className="font-black tracking-tight text-xl">{announcement.reactions_count ?? 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                                        <MessageSquare className="size-5 fill-current" />
                                    </div>
                                    <span className="font-black tracking-tight text-xl">{announcement.comments_count ?? 0}</span>
                                </div>
                            </div>
                        </div>

                        <Link href={route("daynews.announcements.show", announcement.id) as any} className="w-full sm:w-auto">
                            <Button className="h-14 w-full px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 sm:w-auto">
                                Read Full Announcement
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
