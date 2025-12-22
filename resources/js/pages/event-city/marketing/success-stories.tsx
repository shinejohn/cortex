import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { SEO } from "@/components/common/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Auth } from "@/types";
import { usePage } from "@inertiajs/react";
import { Quote, Star, Users, Calendar, DollarSign } from "lucide-react";

interface SuccessStory {
    id: string;
    title: string;
    category: string;
    author: string;
    author_role: string;
    author_image: string;
    content: string;
    metrics: {
        events_booked?: number;
        revenue_increase?: string;
        audience_growth?: string;
    };
    featured: boolean;
}

interface Props {
    auth: Auth;
    stories: SuccessStory[];
}

export default function SuccessStories() {
    const { auth, stories } = usePage<Props>().props;
    const featuredStories = stories.filter((s) => s.featured);
    const regularStories = stories.filter((s) => !s.featured);

    return (
        <div className="min-h-screen bg-white">
            <SEO
                type="page"
                site="event-city"
                data={{
                    title: "Success Stories - GoEventCity",
                }}
            />
            <Header auth={auth} />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold mb-4">Success Stories</h1>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                        Discover how performers, venues, and event organizers are thriving with GoEventCity
                    </p>
                </div>
            </div>

            {/* Featured Stories */}
            {featuredStories.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Stories</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {featuredStories.map((story) => (
                            <Card key={story.id} className="overflow-hidden">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        src={story.author_image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=400&fit=crop"}
                                        alt={story.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="default">{story.category}</Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{story.title}</h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center">
                                            <img
                                                src={story.author_image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop"}
                                                alt={story.author}
                                                className="h-10 w-10 rounded-full mr-2"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">{story.author}</p>
                                                <p className="text-sm text-gray-600">{story.author_role}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4 line-clamp-3">{story.content}</p>
                                    {story.metrics && (
                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                                            {story.metrics.events_booked && (
                                                <div>
                                                    <p className="text-2xl font-bold text-purple-600">{story.metrics.events_booked}</p>
                                                    <p className="text-sm text-gray-600">Events Booked</p>
                                                </div>
                                            )}
                                            {story.metrics.revenue_increase && (
                                                <div>
                                                    <p className="text-2xl font-bold text-green-600">{story.metrics.revenue_increase}</p>
                                                    <p className="text-sm text-gray-600">Revenue Increase</p>
                                                </div>
                                            )}
                                            {story.metrics.audience_growth && (
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-600">{story.metrics.audience_growth}</p>
                                                    <p className="text-sm text-gray-600">Audience Growth</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* All Stories */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">All Stories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularStories.map((story) => (
                            <Card key={story.id} className="hover:shadow-lg transition-shadow">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={story.author_image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop"}
                                        alt={story.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardContent className="p-6">
                                    <Badge variant="outline" className="mb-2">{story.category}</Badge>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <img
                                            src={story.author_image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop"}
                                            alt={story.author}
                                            className="h-8 w-8 rounded-full"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{story.author}</p>
                                            <p className="text-xs text-gray-600">{story.author_role}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 line-clamp-3">{story.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-purple-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Share Your Success Story</h2>
                    <p className="text-xl text-purple-100 mb-8">
                        Have a success story to share? We'd love to hear from you!
                    </p>
                    <Button size="lg" variant="outline" className="bg-white text-purple-700 hover:bg-purple-50">
                        Submit Your Story
                    </Button>
                </div>
            </div>

            <Footer />
        </div>
    );
}

