import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Auth } from "@/types";
import { usePage } from "@inertiajs/react";
import { TrendingUp, MapPin, Music, DollarSign, Calendar, Download, Info, ArrowRight, BarChart3 } from "lucide-react";
import { useState } from "react";

interface MarketData {
    gigs_by_genre: Array<{ name: string; value: number }>;
    avg_pay_by_genre: Array<{ name: string; value: number }>;
    demand_trend: Array<{ month: string; gigs: number; avg_pay: number }>;
    gigs_by_venue_type: Array<{ name: string; value: number }>;
    top_opportunities: Array<{
        title: string;
        description: string;
        impact: string;
        action: string;
    }>;
}

interface Props {
    auth: Auth;
    marketData: MarketData;
    locations: string[];
    genres: string[];
}

export default function MarketReport() {
    const { auth, marketData, locations, genres } = usePage<Props>().props;
    const [selectedLocation, setSelectedLocation] = useState(locations[0] || "");
    const [selectedGenre, setSelectedGenre] = useState("All Genres");
    const [timeRange, setTimeRange] = useState("last6Months");

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Market Report - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Header */}
            <div className="bg-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Market Report</h1>
                            <p className="text-xl text-purple-100">Data-driven insights for performers</p>
                        </div>
                        <Button variant="outline" className="bg-white text-purple-700 hover:bg-purple-50">
                            <Download className="h-5 w-5 mr-2" />
                            Download Report
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((location) => (
                                        <SelectItem key={location} value={location}>
                                            {location}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {genres.map((genre) => (
                                        <SelectItem key={genre} value={genre}>
                                            {genre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lastMonth">Last Month</SelectItem>
                                    <SelectItem value="last3Months">Last 3 Months</SelectItem>
                                    <SelectItem value="last6Months">Last 6 Months</SelectItem>
                                    <SelectItem value="lastYear">Last Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Gigs</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {marketData.gigs_by_genre.reduce((sum, item) => sum + item.value, 0)}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg Pay</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        $
                                        {Math.round(
                                            marketData.avg_pay_by_genre.reduce((sum, item) => sum + item.value, 0) /
                                                marketData.avg_pay_by_genre.length,
                                        )}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Top Genre</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{marketData.gigs_by_genre[0]?.name || "N/A"}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Music className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Growth</p>
                                    <p className="text-3xl font-bold text-green-600 mt-1">+15%</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gigs by Genre</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Chart visualization will be displayed here</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Average Pay by Genre</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Chart visualization will be displayed here</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Demand Trend */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Demand Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Trend chart will be displayed here</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Opportunities */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {marketData.top_opportunities.map((opportunity, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
                                            <p className="text-gray-600 mb-2">{opportunity.description}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-green-600 font-medium">{opportunity.impact}</span>
                                                <span className="text-gray-500">{opportunity.action}</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    );
}
