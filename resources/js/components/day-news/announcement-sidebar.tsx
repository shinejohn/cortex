import React from "react";
import {
    Calendar,
    ChevronRight,
    Info,
    MapPin,
    ShieldCheck,
    Cross,
    Flower2,
    Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Announcement {
    id: string;
    type: string;
    title: string;
    content: string;
    published_at_diff?: string;
}

interface localEvent {
    id: string;
    title: string;
    location: string;
    month: string;
    day: string;
}

interface AnnouncementSidebarProps {
    memorials: Announcement[];
    upcomingEvents: localEvent[];
    className?: string;
    location?: string;
}

export function AnnouncementSidebar({ upcomingEvents = [], memorials = [], location = "Clearwater" }: AnnouncementSidebarProps) {
    return (
        <div className="flex flex-col gap-8">
            {/* Memorials Section */}
            {memorials.length > 0 && (
                <Card className="overflow-hidden border-none shadow-md bg-zinc-900 text-white">
                    <CardHeader className="bg-zinc-800/50 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Flower2 className="size-4 text-primary" />
                                Community Remembrances
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {memorials.map((memorial) => (
                                <div key={memorial.id} className="group relative border-l-2 border-primary/20 pl-4 hover:border-primary transition-colors">
                                    <h4 className="font-bold text-lg mb-1 leading-tight">{memorial.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                                        <Calendar className="size-3 text-primary" />
                                        <span>{memorial.published_at_diff ?? ""}</span>
                                    </div>
                                    <p className="text-sm text-zinc-300 line-clamp-2 italic">"{memorial.content}"</p>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-zinc-400 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest">
                            View All Memorials
                            <ChevronRight className="ml-2 size-3" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Community Guidelines */}
            <Card className="border-none shadow-sm bg-blue-50/50 border-blue-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-blue-900">
                        <ShieldCheck className="size-4" />
                        Community Guidelines
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {[
                            "Share local celebrations and life transitions.",
                            "Maintain a respectful and supportive tone.",
                            "Verify event details before posting.",
                            "No commercial advertising in announcements.",
                        ].map((rule, i) => (
                            <li key={i} className="flex gap-3 text-sm text-blue-800/80 leading-snug">
                                <div className="mt-1 flex size-1.5 shrink-0 rounded-full bg-blue-400" />
                                {rule}
                            </li>
                        ))}
                    </ul>
                    <Separator className="my-4 bg-blue-200/50" />
                    <Button variant="link" className="p-0 h-auto text-blue-600 font-black text-[10px] uppercase tracking-widest">
                        Read Official Notice Policy
                        <ChevronRight className="ml-1 size-3" />
                    </Button>
                </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="size-4 text-primary" />
                            Upcoming Local Events
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-5">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => (
                                <div key={event.id} className="flex gap-4 group cursor-pointer">
                                    <div className="flex flex-col items-center justify-center size-12 rounded-lg bg-muted shrink-0 text-center font-bold">
                                        <span className="text-[10px] uppercase leading-none text-muted-foreground tracking-widest">{event.month}</span>
                                        <span className="text-lg leading-none font-black">{event.day}</span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors truncate">{event.title}</h4>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                            <MapPin className="size-3 text-primary" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center bg-muted/30 rounded-lg">
                                <Calendar className="size-8 mx-auto text-muted mb-2 opacity-50" />
                                <p className="text-xs text-muted-foreground">No events scheduled this week.</p>
                            </div>
                        )}
                    </div>
                    {upcomingEvents.length > 0 && (
                        <Button variant="outline" className="w-full mt-6 text-[10px] font-black uppercase tracking-widest">
                            Browse Calendar
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Support CTA */}
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 p-6 border border-primary/10">
                <Heart className="size-8 text-primary mb-4" />
                <h3 className="font-display font-black text-lg mb-2 tracking-tight">Celebrate Together</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Sharing announcements helps build a stronger, more connected community.</p>
                <Button className="w-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                    Post an Announcement
                </Button>
            </div>
        </div>
    );
}
