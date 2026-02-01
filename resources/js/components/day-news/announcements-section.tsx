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
    /* 
    // SPEC MOCK DATA (kept for reference but commented out as per rules)
    const mockAnnouncements = [
      { id: 1, title: 'Local Student Graduates with Honors', region: 'Clearwater', image: '...' },
      { id: 2, title: 'Dunedin Downtown Market Returns', region: 'Dunedin', image: '...' }
    ];
    */

    if (!announcements || announcements.length === 0) {
        return null;
    }

    return (
        <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center">
                <div className="mr-2 rounded-md bg-yellow-100 p-1">
                    <Bell className="h-4 w-4 text-yellow-600" />
                </div>
                <h2 className="font-display text-sm font-bold">Announcements</h2>
            </div>
            <div className="space-y-3">
                {announcements.map((announcement) => (
                    <Link
                        key={announcement.id}
                        href={`/announcements/${announcement.id}`}
                        className="flex rounded-md p-1 transition-colors hover:bg-gray-50"
                    >
                        {announcement.image && (
                            <img
                                src={announcement.image}
                                alt={announcement.title}
                                className="h-12 w-12 rounded-md object-cover"
                            />
                        )}
                        {!announcement.image && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
                                <Bell className="h-6 w-6 text-gray-400" />
                            </div>
                        )}

                        <div className="ml-2 overflow-hidden">
                            <div className="mb-1 flex items-center text-xs text-gray-500">
                                <MapPin className="mr-1 h-3 w-3" />
                                <span className="truncate">
                                    {announcement.regions && announcement.regions.length > 0
                                        ? announcement.regions[0].name
                                        : "Local"}
                                </span>
                            </div>
                            <h3 className="line-clamp-2 text-xs font-medium text-news-primary">
                                {announcement.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-3 border-t border-gray-100 pt-2">
                <Link href="/announcements" className="text-[10px] font-semibold uppercase tracking-wider text-news-primary hover:underline">
                    View All Announcements
                </Link>
            </div>
        </div>
    );
};

export default AnnouncementsSection;
