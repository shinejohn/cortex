import { Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, BarChart3, Calendar, Edit, Settings, Users } from "lucide-react";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { SEO } from "@/components/common/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Auth } from "@/types";

interface Hub {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    banner_image: string;
    about: string;
    category: string;
    location: string;
    website: string;
    contact_email: string;
    contact_phone: string;
    social_links: Record<string, string>;
    members_count: number;
    events_count: number;
    articles_count: number;
    followers_count: number;
    is_featured: boolean;
    is_verified: boolean;
    analytics_enabled: boolean;
    articles_enabled: boolean;
    community_enabled: boolean;
    events_enabled: boolean;
    gallery_enabled: boolean;
    sections: Array<{
        id: string;
        type: string;
        title: string;
        is_visible: boolean;
    }>;
    members: Array<{
        id: string;
        user: {
            id: string;
            name: string;
            avatar: string;
        };
        role: string;
    }>;
}

interface Props {
    auth: Auth;
    hub: Hub;
    isMember: boolean;
    userRole: string | null;
}

export default function HubShow() {
    const { auth, hub, isMember, userRole } = usePage<Props>().props;
    const canEdit = userRole === "owner" || userRole === "admin" || userRole === "editor";

    return (
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: `${hub.name} - GoEventCity`,
                    description: hub.description,
                    image: hub.banner_image || hub.image,
                }}
            />
            <Header auth={auth} />

            {/* Hub Header */}
            <div
                className="bg-muted text-foreground relative"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${hub.banner_image || hub.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={() => router.visit("/hubs")} className="text-white/80 hover:text-white">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Hubs
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-3xl font-bold">{hub.name}</h1>
                                {hub.is_verified && <Badge className="bg-primary">Verified</Badge>}
                                {hub.is_featured && <Badge className="bg-primary">Featured</Badge>}
                            </div>
                            <p className="mt-2 text-white/80 max-w-2xl">{hub.description}</p>
                        </div>
                        {canEdit && (
                            <div className="mt-4 md:mt-0 flex items-center space-x-2">
                                <Link href={`/hubs/${hub.slug}/builder`}>
                                    <Button variant="outline" className="bg-card/10 border-white/20 text-white hover:bg-card/20">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Manage Hub
                                    </Button>
                                </Link>
                                {hub.analytics_enabled && (
                                    <Link href={`/hubs/${hub.slug}/analytics`}>
                                        <Button variant="outline" className="bg-card/10 border-white/20 text-white hover:bg-card/20">
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Analytics
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        {hub.events_enabled && <TabsTrigger value="events">Events</TabsTrigger>}
                        {hub.articles_enabled && <TabsTrigger value="articles">Articles</TabsTrigger>}
                        {hub.community_enabled && <TabsTrigger value="community">Community</TabsTrigger>}
                        {hub.gallery_enabled && <TabsTrigger value="gallery">Gallery</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {hub.about && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>About</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-foreground whitespace-pre-wrap">{hub.about}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Hub Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <div className="text-2xl font-bold text-foreground">{hub.members_count}</div>
                                                <div className="text-sm text-muted-foreground">Members</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-foreground">{hub.events_count}</div>
                                                <div className="text-sm text-muted-foreground">Events</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-foreground">{hub.articles_count}</div>
                                                <div className="text-sm text-muted-foreground">Articles</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-foreground">{hub.followers_count}</div>
                                                <div className="text-sm text-muted-foreground">Followers</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                {/* Quick Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {hub.category && (
                                            <div>
                                                <div className="text-sm text-muted-foreground">Category</div>
                                                <div className="font-medium">{hub.category}</div>
                                            </div>
                                        )}
                                        {hub.location && (
                                            <div>
                                                <div className="text-sm text-muted-foreground">Location</div>
                                                <div className="font-medium">{hub.location}</div>
                                            </div>
                                        )}
                                        {hub.website && (
                                            <div>
                                                <div className="text-sm text-muted-foreground">Website</div>
                                                <a
                                                    href={hub.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                                                >
                                                    Visit Website
                                                </a>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Members */}
                                {hub.members && hub.members.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Members</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {hub.members.slice(0, 5).map((member) => (
                                                    <div key={member.id} className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-muted overflow-hidden mr-2">
                                                                <img
                                                                    src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.name}`}
                                                                    alt={member.user.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">{member.user.name}</div>
                                                                <div className="text-xs text-muted-foreground">{member.role}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {hub.members.length > 5 && (
                                                    <Button variant="ghost" className="w-full">
                                                        View All {hub.members_count} Members
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {hub.events_enabled && (
                        <TabsContent value="events" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Events</CardTitle>
                                        {canEdit && (
                                            <Link href={`/events/create?hub_id=${hub.id}`}>
                                                <Button size="sm">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Add Event
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Events will be displayed here.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {hub.articles_enabled && (
                        <TabsContent value="articles" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Articles</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Articles will be displayed here.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {hub.community_enabled && (
                        <TabsContent value="community" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Community</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Community discussions will be displayed here.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {hub.gallery_enabled && (
                        <TabsContent value="gallery" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gallery</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Gallery images will be displayed here.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            <Footer />
        </div>
    );
}
