import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { MapPin, Phone, Star, X, Send, MessageCircle, Mail, ExternalLink, Image, Calendar, Tag } from "lucide-react";
import Layout from "@/layouts/layout";
import { Business, BusinessTemplate, Tab } from "@/types";

interface Props {
    business: Business;
    template: BusinessTemplate;
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
    schema: Record<string, any>;
    tabs: string[];
    aiServices: {
        enabled: boolean;
        services: string[];
        chat_enabled?: boolean;
        faq_enabled?: boolean;
        content_generation?: boolean;
    };
    communityLinks: Record<string, { url: string; label: string }>;
    crossPlatformContent?: {
        articles?: any[];
        events?: any[];
        coupons?: any[];
    };
    relatedBusinesses?: Business[];
    activeTab: string;
}

export default function BusinessShow({
    business,
    template,
    seo,
    schema,
    tabs,
    aiServices,
    communityLinks,
    crossPlatformContent,
    relatedBusinesses,
    activeTab,
}: Props) {
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
    const { data, setData, post, processing } = useForm({
        message: "",
    });

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.message.trim()) return;

        const userMessage = { role: "user", content: data.message };
        setChatMessages((prev) => [...prev, userMessage]);
        setData("message", "");

        post(`/business/${business.slug}/ai/chat`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const aiResponse = { role: "assistant", content: page.props.response || "I'm here to help!" };
                setChatMessages((prev) => [...prev, aiResponse]);
            },
        });
    };

    return (
        <Layout>
            <Head>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                {seo.keywords && seo.keywords.length > 0 && <meta name="keywords" content={seo.keywords.join(", ")} />}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                            <div className="md:col-span-2">
                                <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight mb-4">{business.name}</h1>
                                {business.description && <p className="text-xl text-blue-100/90 mb-6 max-w-2xl">{business.description}</p>}
                                <div className="flex flex-wrap gap-5 text-sm">
                                    {business.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-blue-200" />
                                            <span>{business.address}, {business.city}, {business.state}</span>
                                        </div>
                                    )}
                                    {business.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-5 w-5 text-blue-200" />
                                            <span>{business.phone}</span>
                                        </div>
                                    )}
                                    {business.rating && (
                                        <div className="flex items-center gap-2">
                                            <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                                            <span className="font-semibold">{business.rating}</span>
                                            {business.reviews_count && <span className="text-blue-200">({business.reviews_count} reviews)</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                {business.images && business.images.length > 0 && (
                                    <img
                                        src={business.images[0]}
                                        alt={business.name}
                                        className="w-full h-64 object-cover rounded-2xl shadow-2xl ring-4 ring-white/20"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-card border-b sticky top-0 z-10 shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex gap-1 overflow-x-auto py-1">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab}
                                    href={`/business/${business.slug}/${tab}`}
                                    className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors ${
                                        activeTab === tab
                                            ? "border-primary text-primary bg-primary/5"
                                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {activeTab === "overview" && (
                                <div className="bg-card rounded-2xl border-none shadow-sm p-6 lg:p-8">
                                    <h2 className="font-display text-2xl font-black tracking-tight mb-4">About {business.name}</h2>
                                    {business.description && <p className="text-foreground leading-relaxed mb-6">{business.description}</p>}
                                    {crossPlatformContent?.articles && crossPlatformContent.articles.length > 0 && (
                                        <div className="mt-8 pt-6 border-t">
                                            <h3 className="font-display text-xl font-bold tracking-tight mb-4">Related Articles</h3>
                                            <div className="space-y-3">
                                                {crossPlatformContent.articles.slice(0, 3).map((article: any) => (
                                                    <Link
                                                        key={article.id}
                                                        href={article.url}
                                                        className="group block rounded-xl border p-4 hover:shadow-md hover:border-primary/30 transition-all"
                                                    >
                                                        <h4 className="font-semibold group-hover:text-primary transition-colors">{article.title}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{article.excerpt}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "reviews" && (
                                <div className="bg-card rounded-2xl border-none shadow-sm p-6 lg:p-8">
                                    <h2 className="font-display text-2xl font-black tracking-tight mb-4">Reviews</h2>
                                    <p className="text-muted-foreground">Reviews will be displayed here.</p>
                                </div>
                            )}

                            {activeTab === "photos" && (
                                <div className="bg-card rounded-2xl border-none shadow-sm p-6 lg:p-8">
                                    <h2 className="font-display text-2xl font-black tracking-tight mb-4">Photos</h2>
                                    {business.images && business.images.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {business.images.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`${business.name} - Photo ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded-xl hover:opacity-90 transition-opacity"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Image className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                                            <p className="text-muted-foreground">No photos available.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "events" && crossPlatformContent?.events && (
                                <div className="bg-card rounded-2xl border-none shadow-sm p-6 lg:p-8">
                                    <h2 className="font-display text-2xl font-black tracking-tight mb-4">Upcoming Events</h2>
                                    {crossPlatformContent.events.length > 0 ? (
                                        <div className="space-y-4">
                                            {crossPlatformContent.events.map((event: any) => (
                                                <div key={event.id} className="group rounded-xl border p-5 hover:shadow-md transition-all">
                                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {event.date}
                                                    </p>
                                                    <p className="text-foreground mt-2">{event.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                                            <p className="text-muted-foreground">No upcoming events.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "coupons" && crossPlatformContent?.coupons && (
                                <div className="bg-card rounded-2xl border-none shadow-sm p-6 lg:p-8">
                                    <h2 className="font-display text-2xl font-black tracking-tight mb-4">Coupons & Deals</h2>
                                    {crossPlatformContent.coupons.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {crossPlatformContent.coupons.map((coupon: any) => (
                                                <div key={coupon.id} className="group rounded-xl border p-5 hover:shadow-md transition-all">
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-primary" />
                                                        {coupon.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{coupon.description}</p>
                                                    <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">
                                                        Get Deal
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Tag className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                                            <p className="text-muted-foreground">No coupons available.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                <h3 className="font-display text-lg font-bold tracking-tight mb-4">Contact Information</h3>
                                <div className="space-y-3">
                                    {business.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span>{business.phone}</span>
                                        </div>
                                    )}
                                    {business.email && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span>{business.email}</span>
                                        </div>
                                    )}
                                    {business.address && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                            <span>{business.address}, {business.city}, {business.state}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cross-Platform Links */}
                            <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                <h3 className="font-display text-lg font-bold tracking-tight mb-4">Also Available On</h3>
                                <div className="space-y-2">
                                    {Object.entries(communityLinks).map(([key, link]) => (
                                        <a
                                            key={key}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Related Businesses */}
                            {relatedBusinesses && relatedBusinesses.length > 0 && (
                                <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                    <h3 className="font-display text-lg font-bold tracking-tight mb-4">Related Businesses</h3>
                                    <div className="space-y-3">
                                        {relatedBusinesses.map((related) => (
                                            <Link
                                                key={related.id}
                                                href={`/business/${related.slug}`}
                                                className="group block rounded-xl border p-3 hover:shadow-md hover:border-primary/30 transition-all"
                                            >
                                                <h4 className="font-semibold group-hover:text-primary transition-colors">{related.name}</h4>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <MapPin className="h-3 w-3" />
                                                    {related.address}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Chat Widget (if enabled) */}
                {aiServices.enabled && aiServices.chat_enabled && (
                    <>
                        {chatOpen && (
                            <div className="fixed bottom-20 right-4 w-96 bg-card rounded-2xl shadow-2xl border z-50 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        Chat with {business.name}
                                    </h3>
                                    <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="h-96 overflow-y-auto p-4 space-y-3">
                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`max-w-xs p-3 rounded-2xl text-sm ${
                                                    msg.role === "user"
                                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                                        : "bg-muted text-foreground rounded-bl-md"
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleChatSubmit} className="p-4 border-t">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data.message}
                                            onChange={(e) => setData("message", e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            disabled={processing}
                                        />
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
                        >
                            <MessageCircle className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>
        </Layout>
    );
}
