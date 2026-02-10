import { Link } from "@inertiajs/react";
import { Bell, MapPin } from "lucide-react";
import React from "react";

interface Announcement {
    id: string;
    title: string;
    image: string | null;
    regions?: { name: string }[];
    published_at: string;
}

interface AnnouncementsSectionProps {
    announcements: Announcement[];
}

export const AnnouncementsSection = ({ announcements }: AnnouncementsSectionProps) => {
    if (!announcements || announcements.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 p-4 border-b border-muted/50">
                <div className="rounded-md bg-yellow-100 p-1.5">
                    <Bell className="size-4 text-yellow-600" />
                </div>
                <h2 className="font-display text-sm font-black uppercase tracking-widest">Announcements</h2>
            </div>
            <div className="divide-y divide-muted/30">
                {announcements.map((announcement) => (
                    <Link
                        key={announcement.id}
                        href={`/announcements/${announcement.id}`}
                        className="flex gap-3 p-3 transition-colors hover:bg-muted/30"
                    >
                        {announcement.image ? (
                            <div className="size-12 shrink-0 overflow-hidden rounded-md">
                                <img
                                    src={announcement.image}
                                    alt={announcement.title}
                                    className="size-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted/30">
                                <Bell className="size-5 text-muted-foreground/50" />
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="size-3 text-primary" />
                                <span className="truncate">
                                    {announcement.regions && announcement.regions.length > 0
                                        ? announcement.regions[0].name
                                        : "Local"}
                                </span>
                            </div>
                            <h3 className="line-clamp-2 text-xs font-bold leading-snug group-hover:text-primary transition-colors">
                                {announcement.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="border-t border-muted/50 p-3">
                <Link
                    href="/announcements"
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                    View All Announcements
                </Link>
            </div>
        </div>
    );
};

export default AnnouncementsSection;
