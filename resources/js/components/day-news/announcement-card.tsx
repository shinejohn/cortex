import React from "react";
import { Link } from "@inertiajs/react";
import { Heart, MessageSquare, MapPin, Calendar, Share2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AnnouncementCardProps {
    announcement: any;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
    const typeColor: Record<string, string> = {
        wedding: "bg-pink-100 text-pink-700 border-pink-200",
        birth: "bg-blue-100 text-blue-700 border-blue-200",
        graduation: "bg-indigo-100 text-indigo-700 border-indigo-200",
        celebration: "bg-yellow-100 text-yellow-700 border-yellow-200",
        memorial: "bg-zinc-100 text-zinc-700 border-zinc-200",
        meeting: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    const activeColor = typeColor[announcement.type] || "bg-muted text-muted-foreground border-muted";

    return (
        <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white">
            <div className="relative">
                {announcement.image ? (
                    <div className="aspect-[16/10] overflow-hidden">
                        <img
                            src={announcement.image}
                            alt={announcement.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <div className="aspect-[16/10] bg-muted/30 flex items-center justify-center">
                        <Badge variant="outline" className="opacity-50">{announcement.type}</Badge>
                    </div>
                )}

                <div className="absolute top-4 left-4">
                    <Badge className={cn("font-black uppercase tracking-widest text-[10px] shadow-sm", activeColor)}>
                        {announcement.type?.replace("_", " ")}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="size-6 border">
                            <AvatarImage src={announcement.user?.avatar} />
                            <AvatarFallback className="text-[10px] font-bold">
                                {announcement.user?.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-muted-foreground">{announcement.user?.name}</span>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{announcement.published_at_diff}</span>
                </div>

                <Link href={route("daynews.announcements.show", announcement.id) as any}>
                    <h3 className="mb-2 line-clamp-2 font-display text-xl font-black leading-tight group-hover:text-primary transition-colors">
                        {announcement.title}
                    </h3>
                </Link>

                <p className="mb-6 line-clamp-3 text-sm text-muted-foreground/90 leading-relaxed">
                    {announcement.content}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                    {announcement.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="size-3.5 text-primary" />
                            <span>{announcement.location}</span>
                        </div>
                    )}
                    {announcement.event_date && (
                        <div className="flex items-center gap-1">
                            <Calendar className="size-3.5 text-primary" />
                            <span>{announcement.event_date_formatted}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <Separator className="bg-muted/50" />

            <div className="flex items-center justify-between px-5 py-3 bg-muted/5">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-bold hover:text-red-500 transition-colors">
                        <Heart className="size-4" />
                        <span>{announcement.reactions_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold hover:text-primary transition-colors">
                        <MessageSquare className="size-4" />
                        <span>{announcement.comments_count || 0}</span>
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-8 rounded-full">
                        <Share2 className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full">
                        <MoreHorizontal className="size-3.5" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
