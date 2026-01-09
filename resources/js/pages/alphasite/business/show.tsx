import { Head, Link, useForm } from "@inertiajs/react";
import { Business, BusinessTemplate, Tab } from "@/types";
import Layout from "@/layouts/layout";
import { useState } from "react";

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

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <h1 className="text-4xl font-bold mb-4">{business.name}</h1>
                                {business.description && <p className="text-xl text-blue-100 mb-4">{business.description}</p>}
                                <div className="flex flex-wrap gap-4 text-sm">
                                    {business.address && (
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            {business.address}, {business.city}, {business.state}
                                        </div>
                                    )}
                                    {business.phone && (
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                            {business.phone}
                                        </div>
                                    )}
                                    {business.rating && (
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-semibold">{business.rating}</span>
                                            {business.reviews_count && <span className="ml-1">({business.reviews_count} reviews)</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                {business.images && business.images.length > 0 && (
                                    <img src={business.images[0]} alt={business.name} className="w-full h-64 object-cover rounded-lg shadow-lg" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab}
                                    href={`/business/${business.slug}/${tab}`}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                        activeTab === tab
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2">
                            {activeTab === "overview" && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold mb-4">About {business.name}</h2>
                                    {business.description && <p className="text-gray-700 mb-4">{business.description}</p>}
                                    {crossPlatformContent?.articles && crossPlatformContent.articles.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-xl font-semibold mb-3">Related Articles</h3>
                                            <div className="space-y-3">
                                                {crossPlatformContent.articles.slice(0, 3).map((article: any) => (
                                                    <Link
                                                        key={article.id}
                                                        href={article.url}
                                                        className="block p-3 border border-gray-200 rounded hover:bg-gray-50"
                                                    >
                                                        <h4 className="font-semibold">{article.title}</h4>
                                                        <p className="text-sm text-gray-600">{article.excerpt}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "reviews" && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                                    <p className="text-gray-600">Reviews will be displayed here.</p>
                                </div>
                            )}

                            {activeTab === "photos" && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold mb-4">Photos</h2>
                                    {business.images && business.images.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {business.images.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`${business.name} - Photo ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">No photos available.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === "events" && crossPlatformContent?.events && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
                                    {crossPlatformContent.events.length > 0 ? (
                                        <div className="space-y-4">
                                            {crossPlatformContent.events.map((event: any) => (
                                                <div key={event.id} className="border border-gray-200 rounded p-4">
                                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                                    <p className="text-sm text-gray-600">{event.date}</p>
                                                    <p className="text-gray-700 mt-2">{event.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">No upcoming events.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === "coupons" && crossPlatformContent?.coupons && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-2xl font-bold mb-4">Coupons & Deals</h2>
                                    {crossPlatformContent.coupons.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {crossPlatformContent.coupons.map((coupon: any) => (
                                                <div key={coupon.id} className="border border-gray-200 rounded p-4">
                                                    <h3 className="font-semibold">{coupon.title}</h3>
                                                    <p className="text-sm text-gray-600">{coupon.description}</p>
                                                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                                        Get Deal
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">No coupons available.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                                {business.phone && (
                                    <p className="text-gray-700 mb-2">
                                        <strong>Phone:</strong> {business.phone}
                                    </p>
                                )}
                                {business.email && (
                                    <p className="text-gray-700 mb-2">
                                        <strong>Email:</strong> {business.email}
                                    </p>
                                )}
                                {business.address && (
                                    <p className="text-gray-700">
                                        <strong>Address:</strong> {business.address}, {business.city}, {business.state}
                                    </p>
                                )}
                            </div>

                            {/* Cross-Platform Links */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h3 className="text-lg font-semibold mb-4">Also Available On</h3>
                                <div className="space-y-2">
                                    {Object.entries(communityLinks).map(([key, link]) => (
                                        <a
                                            key={key}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Related Businesses */}
                            {relatedBusinesses && relatedBusinesses.length > 0 && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold mb-4">Related Businesses</h3>
                                    <div className="space-y-3">
                                        {relatedBusinesses.map((related) => (
                                            <Link
                                                key={related.id}
                                                href={`/business/${related.slug}`}
                                                className="block p-3 border border-gray-200 rounded hover:bg-gray-50"
                                            >
                                                <h4 className="font-semibold">{related.name}</h4>
                                                <p className="text-sm text-gray-600">{related.address}</p>
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
                            <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                                    <h3 className="font-semibold">Chat with {business.name}</h3>
                                    <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="h-96 overflow-y-auto p-4 space-y-3">
                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`max-w-xs p-3 rounded-lg ${
                                                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={data.message}
                                            onChange={(e) => setData("message", e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={processing}
                                        />
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </Layout>
    );
}
