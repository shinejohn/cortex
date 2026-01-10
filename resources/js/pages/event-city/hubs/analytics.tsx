import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Auth } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { ArrowLeft, Download, BarChart3, TrendingUp, Users, Calendar, FileText } from "lucide-react";
import { useState } from "react";

interface Hub {
    id: string;
    name: string;
    slug: string;
    image: string;
}

interface AnalyticsData {
    dateLabels: string[];
    page_views: number[];
    unique_visitors: number[];
    events_created: number[];
    events_published: number[];
    articles_created: number[];
    articles_published: number[];
    members_joined: number[];
    followers_gained: number[];
    revenue: number[];
}

interface Props {
    auth: Auth;
    hub: Hub;
    analytics: AnalyticsData[];
    totals: {
        page_views: number;
        unique_visitors: number;
        events_created: number;
        events_published: number;
        articles_created: number;
        articles_published: number;
        members_joined: number;
        followers_gained: number;
        revenue: number;
    };
    averages: {
        page_views: number;
        unique_visitors: number;
        engagement_score: number;
    };
    dateRange: string;
}

export default function HubAnalytics() {
    const { auth, hub, analytics, totals, averages, dateRange } = usePage<Props>().props;
    const [selectedRange, setSelectedRange] = useState(dateRange);

    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
        router.get(`/hubs/${hub.slug}/analytics`, { date_range: range }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-muted/50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: `Analytics - ${hub.name} - GoEventCity`,
                }}
            />
            <Header auth={auth} />

            {/* Hub Header */}
            <div
                className="bg-muted text-foreground relative"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${hub.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={() => router.visit(`/hubs/${hub.slug}`)} className="text-white/80 hover:text-white">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Hub
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{hub.name} - Analytics</h1>
                            <p className="mt-2 text-white/80 max-w-2xl">Track your hub's performance, engagement, and growth metrics</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            <Select value={selectedRange} onValueChange={handleRangeChange}>
                                <SelectTrigger className="bg-black/30 backdrop-blur-sm text-white border-white/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                    <SelectItem value="90">Last 90 days</SelectItem>
                                    <SelectItem value="365">Last year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" className="bg-primary text-white hover:bg-primary">
                                <Download className="h-4 w-4 mr-1.5" />
                                Export Report
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Overview Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-accent flex items-center justify-center">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-sm font-medium text-muted-foreground">Page Views</h2>
                                    <p className="text-2xl font-semibold text-foreground">{totals.page_views.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Avg: {averages.page_views.toLocaleString()}/day</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-sm font-medium text-muted-foreground">Unique Visitors</h2>
                                    <p className="text-2xl font-semibold text-foreground">{totals.unique_visitors.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Avg: {averages.unique_visitors.toLocaleString()}/day</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-accent flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-sm font-medium text-muted-foreground">Events Published</h2>
                                    <p className="text-2xl font-semibold text-foreground">{totals.events_published}</p>
                                    <p className="text-xs text-muted-foreground">Created: {totals.events_created}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-accent flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-sm font-medium text-muted-foreground">Engagement Score</h2>
                                    <p className="text-2xl font-semibold text-foreground">{averages.engagement_score.toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">Members: {totals.members_joined}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Placeholder */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Analytics Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                            <p className="text-muted-foreground">Chart visualization will be implemented here</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Articles Created</span>
                                    <span className="font-medium">{totals.articles_created}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Articles Published</span>
                                    <span className="font-medium">{totals.articles_published}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Growth</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Members Joined</span>
                                    <span className="font-medium">{totals.members_joined}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Followers Gained</span>
                                    <span className="font-medium">{totals.followers_gained}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">${totals.revenue.toFixed(2)}</div>
                            <p className="text-sm text-muted-foreground mt-1">Total revenue</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Footer />
        </div>
    );
}
