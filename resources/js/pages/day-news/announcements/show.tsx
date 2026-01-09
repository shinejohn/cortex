import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Calendar, Heart, MapPin, MessageSquare } from "lucide-react";

interface Announcement {
    id: string;
    type: string;
    title: string;
    content: string;
    image: string | null;
    location: string | null;
    event_date: string | null;
    published_at: string;
    views_count: number;
    reactions_count: number;
    comments_count: number;
    user: {
        id: string;
        name: string;
        avatar: string | null;
    };
    regions: Array<{
        id: string;
        name: string;
    }>;
}

interface ShowAnnouncementProps {
    auth?: Auth;
    announcement: Announcement;
    related: Announcement[];
}

export default function ShowAnnouncement() {
    const { auth, announcement, related } = usePage<ShowAnnouncementProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`${announcement.title} - Day News`} />
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: announcement.title,
                        description: announcement.content.substring(0, 160),
                        image: announcement.image,
                        url: `/announcements/${announcement.id}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Badge variant="outline" className="mb-4 capitalize">
                            {announcement.type.replace("_", " ")}
                        </Badge>
                        <h1 className="mb-4 text-4xl font-bold">{announcement.title}</h1>

                        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {announcement.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="size-4" />
                                    {announcement.location}
                                </div>
                            )}
                            {announcement.event_date && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="size-4" />
                                    {new Date(announcement.event_date).toLocaleDateString()}
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Heart className="size-4" />
                                {announcement.reactions_count} reactions
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageSquare className="size-4" />
                                {announcement.comments_count} comments
                            </div>
                        </div>
                    </div>

                    {announcement.image && (
                        <img src={announcement.image} alt={announcement.title} className="mb-8 h-96 w-full rounded-lg object-cover" />
                    )}

                    <div className="prose prose-lg max-w-none dark:prose-invert">
                        <p className="whitespace-pre-wrap">{announcement.content}</p>
                    </div>

                    {/* Related Announcements */}
                    {related.length > 0 && (
                        <div className="mt-12">
                            <h2 className="mb-4 text-2xl font-bold">Related Announcements</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {related.map((item) => (
                                    <div
                                        key={item.id}
                                        className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                                        onClick={() => router.visit(`/announcements/${item.id}`)}
                                    >
                                        <h3 className="mb-2 font-semibold">{item.title}</h3>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}
