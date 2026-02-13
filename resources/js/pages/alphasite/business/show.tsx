import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import Layout from "@/layouts/layout";
import { Business, BusinessTemplate } from "@/types";

/* ──────────────────────────────────────────────
   Type Definitions
   ────────────────────────────────────────────── */

interface Article {
    id: string;
    title: string;
    excerpt?: string;
    url: string;
    image_url?: string;
    published_at?: string;
    source?: string;
}

interface Event {
    id: string;
    title: string;
    description?: string;
    date: string;
    end_date?: string;
    time?: string;
    location?: string;
    url?: string;
    image_url?: string;
    price?: string;
}

interface Coupon {
    id: string;
    title: string;
    description?: string;
    code?: string;
    discount?: string;
    expires_at?: string;
    terms?: string;
}

interface Deal {
    id: string;
    title: string;
    description?: string;
    original_price?: string;
    deal_price?: string;
    discount_percent?: number;
    expires_at?: string;
    url?: string;
}

interface Achievement {
    id: string;
    title: string;
    description?: string;
    awarded_by?: string;
    awarded_at?: string;
    icon?: string;
    type?: "award" | "certification" | "recognition" | "milestone";
}

interface Announcement {
    id: string;
    title: string;
    body: string;
    type?: "info" | "warning" | "promotion" | "update";
    published_at?: string;
    expires_at?: string;
}

interface TicketPlan {
    id: string;
    name: string;
    description?: string;
    price: string;
    currency?: string;
    available_count?: number;
    event_id?: string;
    event_title?: string;
    url?: string;
}

interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price?: string;
    image_url?: string;
    category?: string;
    dietary_tags?: string[];
}

interface MenuCategory {
    name: string;
    items: MenuItem[];
}

interface Review {
    id: string;
    author: string;
    rating: number;
    content: string;
    created_at: string;
    avatar_url?: string;
    response?: string;
}

interface AIService {
    id: string;
    name: string;
    description: string;
    icon: string;
    enabled: boolean;
}

interface BusinessHours {
    [day: string]: string;
}

interface Ad {
    id: string;
    title: string;
    body?: string;
    image_url?: string;
    cta_text?: string;
    cta_url?: string;
    sponsor?: string;
}

interface Classified {
    id: string;
    title: string;
    description?: string;
    category?: string;
    posted_at?: string;
    contact?: string;
    price?: string;
    url?: string;
}

interface PhotoContribution {
    id: string;
    url: string;
    caption?: string;
    contributor?: string;
    date?: string;
}

interface LocalVoice {
    id: string;
    title: string;
    description?: string;
    author?: string;
    url?: string;
    type?: "podcast" | "article" | "photo_essay" | "video";
    duration?: string;
    image_url?: string;
    published_at?: string;
}

interface SocialPost {
    id: string;
    platform: string;
    text: string;
    image_url?: string;
    date: string;
    likes?: number;
    comments?: number;
    url?: string;
}

/* ──────────────────────────────────────────────
   Page Props
   ────────────────────────────────────────────── */

interface Props {
    business: Business & {
        opening_hours?: BusinessHours;
        logo_url?: string;
        cover_image_url?: string;
        price_level?: string;
        website?: string;
        social_links?: Record<string, string>;
        alphasite_subdomain?: string;
        industry?: { name: string; slug: string };
    };
    template: BusinessTemplate;
    seo: {
        title: string;
        description: string;
        keywords: string;
        og: {
            title: string;
            description: string;
            image: string;
            url: string;
            type: string;
            site_name: string;
            locale: string;
        };
        twitter: {
            card: string;
            title: string;
            description: string;
            image: string;
        };
        geo: {
            region: string | null;
            placename: string | null;
            position: string | null;
            icbm: string | null;
        };
    };
    schemas: {
        primary: Record<string, any>;
        breadcrumb: Record<string, any>;
        aggregateRating?: Record<string, any>;
        events?: Record<string, any>[];
        faq?: Record<string, any>;
    };
    schema?: Record<string, any>;
    tabs: string[];
    aiServices: {
        enabled: boolean;
        services: AIService[];
        chat_enabled?: boolean;
        faq_enabled?: boolean;
        content_generation?: boolean;
    };
    communityLinks: Record<string, { url: string; label: string }>;
    crossPlatformContent?: {
        articles?: Article[];
        events?: Event[];
        coupons?: Coupon[];
        deals?: Deal[];
        achievements?: Achievement[];
        announcements?: Announcement[];
        tickets?: TicketPlan[];
        ads?: Ad[];
        classifieds?: Classified[];
        photoContributions?: PhotoContribution[];
        localVoices?: LocalVoice[];
        socialFeed?: SocialPost[];
    };
    menuData?: {
        categories: MenuCategory[];
    };
    reviews?: {
        data: Review[];
        average_rating?: number;
        total_count?: number;
        rating_breakdown?: Record<number, number>;
    };
    relatedBusinesses?: Business[];
    activeTab: string;
    goeventcityDomain?: string;
    canonicalUrl?: string;
    displayMode?: "standalone" | "subdomain" | "directory";
    showAlphaSiteHeader?: boolean;
    showAlphaSiteFooter?: boolean;
    customBranding?: {
        favicon?: string;
        site_name?: string;
        primary_color?: string;
        logo_url?: string;
    } | null;
}

/* ──────────────────────────────────────────────
   Helper Components
   ────────────────────────────────────────────── */

function StarRating({ rating, size = "w-5 h-5" }: { rating: number; size?: string }) {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`${size} ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
    return (
        <div className="text-center py-12">
            <span className="text-4xl mb-4 block">{icon}</span>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-card rounded-lg shadow p-6 ${className}`}>{children}</div>;
}

/* ──────────────────────────────────────────────
   Style Constants
   ────────────────────────────────────────────── */

const serviceStyles: Record<string, { bg: string; iconBg: string; text: string }> = {
    order: { bg: "bg-yellow-50", iconBg: "bg-yellow-100", text: "text-yellow-600" },
    reservation: { bg: "bg-blue-50", iconBg: "bg-blue-100", text: "text-blue-600" },
    menu: { bg: "bg-green-50", iconBg: "bg-green-100", text: "text-green-600" },
    concierge: { bg: "bg-orange-50", iconBg: "bg-orange-100", text: "text-orange-600" },
    sales: { bg: "bg-purple-50", iconBg: "bg-purple-100", text: "text-purple-600" },
    customer_service: { bg: "bg-pink-50", iconBg: "bg-pink-100", text: "text-pink-600" },
};

const defaultServiceStyle = { bg: "bg-gray-50", iconBg: "bg-gray-100", text: "text-gray-600" };

const announcementStyles: Record<string, { border: string; bg: string; icon: string }> = {
    info: { border: "border-blue-200", bg: "bg-blue-50", icon: "ℹ️" },
    warning: { border: "border-yellow-200", bg: "bg-yellow-50", icon: "⚠️" },
    promotion: { border: "border-green-200", bg: "bg-green-50", icon: "🎉" },
    update: { border: "border-purple-200", bg: "bg-purple-50", icon: "🔄" },
};

const defaultAnnouncementStyle = { border: "border-gray-200", bg: "bg-gray-50", icon: "📢" };

const platformIcons: Record<string, string> = {
    facebook: "📘", instagram: "📸", twitter: "🐦", tiktok: "🎵", linkedin: "💼", youtube: "▶️",
};

const localVoiceStyles: Record<string, { bg: string; text: string; label: string }> = {
    podcast: { bg: "bg-purple-100", text: "text-purple-700", label: "🎧 Podcast" },
    article: { bg: "bg-blue-100", text: "text-blue-700", label: "📝 Article" },
    photo_essay: { bg: "bg-yellow-100", text: "text-yellow-700", label: "📸 Photo Essay" },
    video: { bg: "bg-red-100", text: "text-red-700", label: "🎬 Video" },
};

/* ──────────────────────────────────────────────
   Two-Level Tab Definitions
   ────────────────────────────────────────────── */

const ROW1_TABS = [
    { id: "overview", icon: "🏠", label: "Overview" },
    { id: "menu", icon: "🍽️", label: "Menu" },
    { id: "reviews", icon: "⭐", label: "Reviews" },
    { id: "photos", icon: "📷", label: "Photos" },
    { id: "social", icon: "📱", label: "Social" },
    { id: "achievements", icon: "🏆", label: "Awards" },
    { id: "announcements", icon: "📢", label: "News" },
];

const ROW2_TABS = [
    { id: "articles", icon: "📰", label: "Articles" },
    { id: "events", icon: "📅", label: "Events" },
    { id: "coupons", icon: "🏷️", label: "Coupons" },
    { id: "deals", icon: "💰", label: "Deals" },
    { id: "tickets", icon: "🎟️", label: "Tickets" },
    { id: "classifieds", icon: "📋", label: "Classifieds" },
    { id: "community", icon: "🎙️", label: "Community" },
];

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */

export default function BusinessShow({
    business,
    template,
    seo,
    schema,
    schemas,
    tabs,
    aiServices,
    communityLinks,
    crossPlatformContent,
    menuData,
    reviews,
    relatedBusinesses,
    activeTab: initialTab,
    goeventcityDomain,
    canonicalUrl,
    displayMode,
    customBranding,
}: Props) {
    const gecDomain = goeventcityDomain || 'goeventcity.com';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
    const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
    const { data, setData, post, processing } = useForm({ message: "" });

    const content = crossPlatformContent;

    /* ── Chat Handler ── */

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.message.trim()) return;

        const userMessage = { role: "user", content: data.message };
        setChatMessages((prev) => [...prev, userMessage]);
        setData("message", "");

        post(`/business/${business.slug}/ai/chat`, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                const aiResponse = {
                    role: "assistant",
                    content: page.props?.response || "I'm here to help! How can I assist you?",
                };
                setChatMessages((prev) => [...prev, aiResponse]);
            },
            onError: () => {
                setChatMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "Sorry, something went wrong. Please try again." },
                ]);
            },
        });
    };

    /* ── Coupon Copy ── */

    const handleCopyCoupon = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCoupon(code);
        setTimeout(() => setCopiedCoupon(null), 2000);
    };

    /* ── Filter tabs to only those provided by backend ── */

    const row1Visible = ROW1_TABS.filter((t) => tabs.includes(t.id));
    const row2Visible = ROW2_TABS.filter((t) => tabs.includes(t.id));

    /* ══════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════ */

    return (
        <Layout>
            <Head>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                {seo.keywords && <meta name="keywords" content={seo.keywords} />}

                {/* Canonical URL */}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

                {/* Custom branding favicon */}
                {customBranding?.favicon && <link rel="icon" href={customBranding.favicon} />}

                {/* Open Graph */}
                {seo.og && (
                    <>
                        <meta property="og:title" content={seo.og.title} />
                        <meta property="og:description" content={seo.og.description} />
                        <meta property="og:type" content={seo.og.type} />
                        <meta property="og:url" content={seo.og.url} />
                        {seo.og.image && <meta property="og:image" content={seo.og.image} />}
                        {seo.og.site_name && <meta property="og:site_name" content={seo.og.site_name} />}
                        {seo.og.locale && <meta property="og:locale" content={seo.og.locale} />}
                    </>
                )}

                {/* Twitter Card */}
                {seo.twitter && (
                    <>
                        <meta name="twitter:card" content={seo.twitter.card} />
                        <meta name="twitter:title" content={seo.twitter.title} />
                        <meta name="twitter:description" content={seo.twitter.description} />
                        {seo.twitter.image && <meta name="twitter:image" content={seo.twitter.image} />}
                    </>
                )}

                {/* Geo Tags */}
                {seo.geo && (
                    <>
                        {seo.geo.region && <meta name="geo.region" content={seo.geo.region} />}
                        {seo.geo.placename && <meta name="geo.placename" content={seo.geo.placename} />}
                        {seo.geo.position && <meta name="geo.position" content={seo.geo.position} />}
                        {seo.geo.icbm && <meta name="ICBM" content={seo.geo.icbm} />}
                    </>
                )}

                {/* Multi-Schema JSON-LD: primary, breadcrumb, aggregateRating, events, faq */}
                {schemas ? (
                    <>
                        {schemas.primary && (
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.primary) }} />
                        )}
                        {schemas.breadcrumb && (
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }} />
                        )}
                        {schemas.aggregateRating && (
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.aggregateRating) }} />
                        )}
                        {schemas.events && schemas.events.length > 0 && (
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.events) }} />
                        )}
                        {schemas.faq && (
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.faq) }} />
                        )}
                    </>
                ) : schema ? (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
                ) : null}
            </Head>

            <div className="min-h-screen bg-muted/50">
                {/* ═══════════════════════════════════
                    HERO SECTION
                    ═══════════════════════════════════ */}
                <div className="relative bg-gray-900 overflow-hidden">
                    <div className="h-80">
                        {business.images && business.images.length > 0 ? (
                            <div className="flex h-full">
                                {business.images.slice(0, 4).map((image, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${image})` }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{business.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                                {business.rating && (
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-semibold">{business.rating}</span>
                                        {business.reviews_count != null && (
                                            <span className="text-gray-300 ml-1">({business.reviews_count} reviews)</span>
                                        )}
                                    </div>
                                )}
                                {business.industry?.name && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span>{business.industry.name}</span>
                                    </>
                                )}
                                {business.price_level && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span>{business.price_level}</span>
                                    </>
                                )}
                            </div>
                            {business.alphasite_subdomain && (
                                <div className="text-blue-300 mt-1 text-sm">
                                    {business.alphasite_subdomain}.alphasite.com
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    AI SERVICES PANEL
                    ═══════════════════════════════════ */}
                {aiServices.enabled && aiServices.services && aiServices.services.length > 0 && (
                    <div className="bg-card border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">🤖</span>
                                <h2 className="text-lg font-semibold">AI-Powered Services</h2>
                                <span className="text-sm text-muted-foreground ml-2">Instant assistance, 24/7 availability</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {aiServices.services.filter((s) => s.enabled).map((service) => {
                                    const style = serviceStyles[service.id] || defaultServiceStyle;
                                    return (
                                        <button
                                            key={service.id}
                                            onClick={() => setChatOpen(true)}
                                            className={`${style.bg} rounded-lg p-4 text-left hover:shadow-md transition group`}
                                        >
                                            <div className={`${style.iconBg} ${style.text} w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition`}>
                                                {service.icon}
                                            </div>
                                            <h3 className="font-semibold text-sm text-foreground">{service.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                                {business.phone && (
                                    <a href={`tel:${business.phone}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium hover:bg-muted/80 transition">📞 Call</a>
                                )}
                                {business.email && (
                                    <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium hover:bg-muted/80 transition">✉️ Message</a>
                                )}
                                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium hover:bg-muted/80 transition">↗️ Share</button>
                                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium hover:bg-muted/80 transition">🔖 Save</button>
                                <button onClick={() => setActiveTab("photos")} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium hover:bg-muted/80 transition">📷 Add Photo</button>
                                <button onClick={() => setActiveTab("reviews")} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition">⭐ Write Review</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════
                    ANNOUNCEMENTS BANNER
                    ═══════════════════════════════════ */}
                {content?.announcements && content.announcements.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                        {content.announcements.slice(0, 2).map((announcement) => {
                            const style = announcementStyles[announcement.type || "info"] || defaultAnnouncementStyle;
                            return (
                                <div key={announcement.id} className={`${style.bg} ${style.border} border rounded-lg p-4 mb-3 flex items-start gap-3`}>
                                    <span className="text-xl flex-shrink-0">{style.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{announcement.body}</p>
                                    </div>
                                    {announcement.published_at && (
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(announcement.published_at).toLocaleDateString()}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ═══════════════════════════════════
                    TWO-LEVEL TAB NAVIGATION
                    ═══════════════════════════════════ */}
                <div className="bg-card border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Row 1: Business Core (blue accent) */}
                        {row1Visible.length > 0 && (
                            <nav className="flex border-b border-gray-100">
                                {row1Visible.map((tab) => (
                                    <Link
                                        key={tab.id}
                                        href={`/business/${business.slug}${tab.id === "overview" ? "" : `/${tab.id}`}`}
                                        onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); window.history.pushState({}, "", `/business/${business.slug}${tab.id === "overview" ? "" : `/${tab.id}`}`); }}
                                        className={`flex-1 flex flex-col items-center gap-1 py-3 text-sm font-medium transition border-b-[3px] ${
                                            activeTab === tab.id
                                                ? "border-blue-500 text-blue-600 bg-blue-50/50 rounded-t-lg"
                                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                        }`}
                                    >
                                        <span className="text-base">{tab.icon}</span>
                                        <span className="text-xs">{tab.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        )}
                        {/* Row 2: Ecosystem & Marketplace (purple accent) */}
                        {row2Visible.length > 0 && (
                            <nav className="flex">
                                {row2Visible.map((tab) => (
                                    <Link
                                        key={tab.id}
                                        href={`/business/${business.slug}/${tab.id}`}
                                        onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); window.history.pushState({}, "", `/business/${business.slug}/${tab.id}`); }}
                                        className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition border-b-[3px] ${
                                            activeTab === tab.id
                                                ? "border-purple-500 text-purple-600 bg-purple-50/50 rounded-t-lg"
                                                : "border-transparent text-gray-400 hover:text-muted-foreground hover:bg-muted/30"
                                        }`}
                                    >
                                        <span className="text-sm">{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    MAIN CONTENT + SIDEBAR
                    ═══════════════════════════════════ */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* ─── Main Content Area ─── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* ══ OVERVIEW ══ */}
                            {activeTab === "overview" && (
                                <>
                                    <SectionCard>
                                        <h2 className="text-2xl font-bold mb-4">About {business.name}</h2>
                                        {business.description && <p className="text-foreground leading-relaxed mb-4">{business.description}</p>}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                            {business.address && (
                                                <div className="flex items-start gap-3"><span className="text-lg">📍</span><div><p className="text-sm font-medium">Address</p><p className="text-sm text-muted-foreground">{business.address}, {business.city}, {business.state}</p></div></div>
                                            )}
                                            {business.phone && (
                                                <div className="flex items-start gap-3"><span className="text-lg">📞</span><div><p className="text-sm font-medium">Phone</p><a href={`tel:${business.phone}`} className="text-sm text-primary hover:underline">{business.phone}</a></div></div>
                                            )}
                                            {business.website && (
                                                <div className="flex items-start gap-3"><span className="text-lg">🌐</span><div><p className="text-sm font-medium">Website</p><a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{business.website.replace(/^https?:\/\//, "")}</a></div></div>
                                            )}
                                            {business.email && (
                                                <div className="flex items-start gap-3"><span className="text-lg">✉️</span><div><p className="text-sm font-medium">Email</p><a href={`mailto:${business.email}`} className="text-sm text-primary hover:underline">{business.email}</a></div></div>
                                            )}
                                        </div>
                                    </SectionCard>

                                    {content?.articles && content.articles.length > 0 && (
                                        <SectionCard>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-semibold">Latest Articles</h3>
                                                <button onClick={() => setActiveTab("articles")} className="text-sm text-primary hover:underline">View all →</button>
                                            </div>
                                            <div className="space-y-3">
                                                {content.articles.slice(0, 3).map((article) => (
                                                    <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition">
                                                        {article.image_url && <img src={article.image_url} alt={article.title} className="w-20 h-20 object-cover rounded flex-shrink-0" />}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-foreground line-clamp-1">{article.title}</h4>
                                                            {article.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{article.excerpt}</p>}
                                                            {article.source && <span className="text-xs text-muted-foreground mt-1 inline-block">via {article.source}</span>}
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    )}

                                    {content?.events && content.events.length > 0 && (
                                        <SectionCard>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-semibold">Upcoming Events</h3>
                                                <button onClick={() => setActiveTab("events")} className="text-sm text-primary hover:underline">View all →</button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {content.events.slice(0, 4).map((event) => {
                                                    const eventUrl = event.url || `https://${gecDomain}/events/${event.id}`;
                                                    return (
                                                        <a key={event.id} href={eventUrl} target="_blank" rel="noopener noreferrer" className="border rounded-lg p-4 hover:bg-muted/50 hover:shadow-md transition block group">
                                                            <p className="text-xs font-semibold text-primary uppercase tracking-wide">{event.date}</p>
                                                            <h4 className="font-semibold text-foreground mt-1 group-hover:text-primary transition">{event.title}</h4>
                                                            {event.time && <p className="text-sm text-muted-foreground mt-1">{event.time}</p>}
                                                            {event.price && <p className="text-sm font-medium text-primary mt-2">{event.price}</p>}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </SectionCard>
                                    )}

                                    {content?.ads && content.ads.length > 0 && (
                                        <div className="rounded-lg overflow-hidden border">
                                            {content.ads[0].image_url && <img src={content.ads[0].image_url} alt="" className="w-full h-44 object-cover" />}
                                            <div className="p-5 bg-card">
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Sponsored</p>
                                                <h3 className="font-bold text-base">{content.ads[0].title}</h3>
                                                {content.ads[0].body && <p className="text-sm text-muted-foreground mt-1">{content.ads[0].body}</p>}
                                                {content.ads[0].cta_url && (
                                                    <a href={content.ads[0].cta_url} className="inline-block mt-3 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition">{content.ads[0].cta_text || "Learn More"}</a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ══ REVIEWS ══ */}
                            {activeTab === "reviews" && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                                    {reviews?.average_rating != null && (
                                        <div className="flex items-center gap-8 mb-8 pb-6 border-b">
                                            <div className="text-center">
                                                <div className="text-5xl font-bold text-foreground">{reviews.average_rating.toFixed(1)}</div>
                                                <StarRating rating={reviews.average_rating} />
                                                <p className="text-sm text-muted-foreground mt-1">{reviews.total_count || 0} reviews</p>
                                            </div>
                                            {reviews.rating_breakdown && (
                                                <div className="flex-1 space-y-2">
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const count = reviews.rating_breakdown?.[star] || 0;
                                                        const pct = Math.round((count / (reviews.total_count || 1)) * 100);
                                                        return (
                                                            <div key={star} className="flex items-center gap-2">
                                                                <span className="text-sm w-4 text-right">{star}</span>
                                                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                                <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} /></div>
                                                                <span className="text-sm text-muted-foreground w-10 text-right">{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {reviews?.data && reviews.data.length > 0 ? (
                                        <div className="space-y-6">
                                            {reviews.data.map((review) => (
                                                <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                                                            {review.avatar_url ? <img src={review.avatar_url} alt={review.author} className="w-10 h-10 rounded-full object-cover" /> : review.author.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2"><span className="font-semibold">{review.author}</span><span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span></div>
                                                            <StarRating rating={review.rating} size="w-4 h-4" />
                                                            <p className="text-foreground mt-2">{review.content}</p>
                                                            {review.response && (
                                                                <div className="bg-muted/50 rounded-lg p-3 mt-3 ml-4 border-l-2 border-primary">
                                                                    <p className="text-sm font-medium text-foreground mb-1">Response from {business.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{review.response}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <EmptyState icon="⭐" title="No Reviews Yet" message="Be the first to share your experience!" />}
                                </SectionCard>
                            )}

                            {/* ══ PHOTOS ══ */}
                            {activeTab === "photos" && (
                                <SectionCard>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-bold">Photos</h2>
                                        <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition">📷 Add Photo</button>
                                    </div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Business Photos</h3>
                                    {business.images && business.images.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                                            {business.images.map((image, index) => <img key={index} src={image} alt={`${business.name} - Photo ${index + 1}`} className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition cursor-pointer" />)}
                                        </div>
                                    ) : <p className="text-muted-foreground mb-8">No business photos yet.</p>}

                                    {content?.photoContributions && content.photoContributions.length > 0 && (
                                        <>
                                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">📸 Community Photo Contributions</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {content.photoContributions.map((photo) => (
                                                    <div key={photo.id} className="relative rounded-lg overflow-hidden group">
                                                        <img src={photo.url} alt={photo.caption || ""} className="w-full h-48 object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                                                            <div className="p-3 text-white">
                                                                {photo.caption && <p className="text-sm font-medium">{photo.caption}</p>}
                                                                {photo.contributor && <p className="text-xs text-gray-300">by {photo.contributor}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </SectionCard>
                            )}

                            {/* ══ MENU / SERVICES ══ */}
                            {(activeTab === "menu" || activeTab === "services") && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-6">{activeTab === "menu" ? "Menu" : "Services"}</h2>
                                    {menuData?.categories && menuData.categories.length > 0 ? (
                                        <div className="space-y-8">
                                            {menuData.categories.map((category) => (
                                                <div key={category.name}>
                                                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">{category.name}</h3>
                                                    <div className="space-y-4">
                                                        {category.items.map((item) => (
                                                            <div key={item.id} className="flex gap-4 py-3">
                                                                {item.image_url && <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded flex-shrink-0" />}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-4">
                                                                        <div>
                                                                            <h4 className="font-semibold text-foreground">{item.name}</h4>
                                                                            {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                                                                            {item.dietary_tags && item.dietary_tags.length > 0 && (
                                                                                <div className="flex gap-1 mt-2">{item.dietary_tags.map((tag) => <span key={tag} className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">{tag}</span>)}</div>
                                                                            )}
                                                                        </div>
                                                                        {item.price && <span className="font-semibold text-foreground whitespace-nowrap">{item.price}</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <EmptyState icon={activeTab === "menu" ? "🍽️" : "📋"} title={`${activeTab === "menu" ? "Menu" : "Services"} Coming Soon`} message={`${business.name}'s ${activeTab} will be displayed here.`} />}
                                </SectionCard>
                            )}

                            {/* ══ ARTICLES ══ */}
                            {activeTab === "articles" && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-6">Articles</h2>
                                    {content?.articles && content.articles.length > 0 ? (
                                        <div className="space-y-4">
                                            {content.articles.map((article) => (
                                                <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition">
                                                    {article.image_url && <img src={article.image_url} alt={article.title} className="w-32 h-24 object-cover rounded flex-shrink-0" />}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-foreground line-clamp-2">{article.title}</h3>
                                                        {article.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{article.excerpt}</p>}
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                            {article.source && <span>via {article.source}</span>}
                                                            {article.published_at && <span>{new Date(article.published_at).toLocaleDateString()}</span>}
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    ) : <EmptyState icon="📰" title="No Articles Yet" message={`News and articles about ${business.name} from Day.News will appear here.`} />}
                                </SectionCard>
                            )}

                            {/* ══ EVENTS ══ */}
                            {activeTab === "events" && (
                                <SectionCard>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold">Events</h2>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Powered by GoEventCity</span>
                                    </div>
                                    {content?.events && content.events.length > 0 ? (
                                        <div className="space-y-4">
                                            {content.events.map((event) => {
                                                const eventUrl = event.url || `https://${gecDomain}/events/${event.id}`;
                                                return (
                                                    <a key={event.id} href={eventUrl} target="_blank" rel="noopener noreferrer" className="flex gap-0 border rounded-lg overflow-hidden hover:bg-muted/50 hover:shadow-md transition group">
                                                        <div className="bg-primary text-white text-center px-4 py-3 flex flex-col justify-center flex-shrink-0 min-w-[80px]">
                                                            <span className="text-xs uppercase">{new Date(event.date).toLocaleDateString("en-US", { month: "short" })}</span>
                                                            <span className="text-2xl font-bold">{new Date(event.date).getDate()}</span>
                                                        </div>
                                                        <div className="flex-1 p-4">
                                                            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition">{event.title}</h3>
                                                            {event.time && <p className="text-sm text-muted-foreground mt-1">🕐 {event.time}</p>}
                                                            {event.location && <p className="text-sm text-muted-foreground">📍 {event.location}</p>}
                                                            {event.description && <p className="text-foreground mt-2 text-sm line-clamp-2">{event.description}</p>}
                                                            <div className="flex items-center gap-3 mt-3">
                                                                {event.price && <span className="text-sm font-medium text-primary">{event.price}</span>}
                                                                <span className="text-sm text-primary font-medium group-hover:underline">View Details & Buy Tickets →</span>
                                                            </div>
                                                        </div>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    ) : <EmptyState icon="📅" title="No Upcoming Events" message={`Events for ${business.name} from GoEventCity will appear here.`} />}
                                </SectionCard>
                            )}

                            {/* ══ COUPONS ══ */}
                            {activeTab === "coupons" && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-6">Coupons & Deals</h2>
                                    {content?.coupons && content.coupons.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {content.coupons.map((coupon) => (
                                                <div key={coupon.id} className="border-2 border-dashed rounded-lg p-5 hover:border-primary transition">
                                                    {coupon.discount && <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full mb-2">{coupon.discount}</span>}
                                                    <h3 className="font-semibold text-foreground">{coupon.title}</h3>
                                                    {coupon.description && <p className="text-sm text-muted-foreground mt-1">{coupon.description}</p>}
                                                    {coupon.code ? (
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <code className="px-3 py-1.5 bg-muted rounded text-sm font-mono">{coupon.code}</code>
                                                            <button onClick={() => handleCopyCoupon(coupon.code!)} className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:bg-primary/90 transition">{copiedCoupon === coupon.code ? "Copied!" : "Copy"}</button>
                                                        </div>
                                                    ) : <button className="mt-3 px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition">Get Deal</button>}
                                                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                                        {coupon.expires_at && <span>Expires {new Date(coupon.expires_at).toLocaleDateString()}</span>}
                                                        {coupon.terms && <span>• {coupon.terms}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <EmptyState icon="🏷️" title="No Coupons Available" message="Check back later for special offers and deals." />}
                                </SectionCard>
                            )}

                            {/* ══ DEALS ══ */}
                            {activeTab === "deals" && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-6">Special Deals</h2>
                                    {content?.deals && content.deals.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {content.deals.map((deal) => (
                                                <div key={deal.id} className="border rounded-lg p-5 hover:shadow-md transition">
                                                    {deal.discount_percent && <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full mb-2">{deal.discount_percent}% OFF</span>}
                                                    <h3 className="font-semibold text-foreground">{deal.title}</h3>
                                                    {deal.description && <p className="text-sm text-muted-foreground mt-1">{deal.description}</p>}
                                                    <div className="flex items-center gap-3 mt-3">
                                                        {deal.original_price && <span className="text-sm text-muted-foreground line-through">{deal.original_price}</span>}
                                                        {deal.deal_price && <span className="text-lg font-bold text-primary">{deal.deal_price}</span>}
                                                    </div>
                                                    {deal.url && <a href={deal.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition">View Deal</a>}
                                                    {deal.expires_at && <p className="text-xs text-muted-foreground mt-2">Expires {new Date(deal.expires_at).toLocaleDateString()}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : <EmptyState icon="💰" title="No Deals Available" message="Special deals and promotions will appear here." />}
                                </SectionCard>
                            )}

                            {/* ══ ACHIEVEMENTS ══ */}
                            {activeTab === "achievements" && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-6">🏆 Awards & Achievements</h2>
                                    {content?.achievements && content.achievements.length > 0 ? (
                                        <div className="space-y-4">
                                            {content.achievements.map((ach) => {
                                                const typeIcons: Record<string, string> = { award: "🥇", certification: "📜", recognition: "⭐", milestone: "🎯" };
                                                return (
                                                    <div key={ach.id} className="flex gap-4 border rounded-lg p-5">
                                                        <span className="text-3xl flex-shrink-0">{ach.icon || typeIcons[ach.type || "award"] || "🏆"}</span>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-foreground text-lg">{ach.title}</h3>
                                                            {ach.awarded_by && <p className="text-sm text-primary">{ach.awarded_by}</p>}
                                                            {ach.awarded_at && <p className="text-xs text-muted-foreground mt-1">{new Date(ach.awarded_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>}
                                                            {ach.description && <p className="text-sm text-muted-foreground mt-2">{ach.description}</p>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : <EmptyState icon="🏆" title="No Achievements Yet" message="Awards, certifications, and recognitions will appear here." />}
                                </SectionCard>
                            )}

                            {/* ══ ANNOUNCEMENTS ══ */}
                            {activeTab === "announcements" && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-6">Announcements & News</h2>
                                    {content?.announcements && content.announcements.length > 0 ? (
                                        <div className="space-y-4">
                                            {content.announcements.map((ann) => {
                                                const style = announcementStyles[ann.type || "info"] || defaultAnnouncementStyle;
                                                return (
                                                    <div key={ann.id} className={`${style.bg} ${style.border} border rounded-lg p-5`}>
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-2xl flex-shrink-0">{style.icon}</span>
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between"><h3 className="font-semibold text-foreground">{ann.title}</h3>{ann.published_at && <span className="text-xs text-muted-foreground">{new Date(ann.published_at).toLocaleDateString()}</span>}</div>
                                                                <p className="text-sm text-foreground mt-2 leading-relaxed">{ann.body}</p>
                                                                {ann.expires_at && <p className="text-xs text-muted-foreground mt-2">Valid until {new Date(ann.expires_at).toLocaleDateString()}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : <EmptyState icon="📢" title="No Announcements" message="Business news and updates will appear here." />}
                                </SectionCard>
                            )}

                            {/* ══ TICKETS ══ */}
                            {(activeTab === "tickets" || activeTab === "booking") && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-6">{activeTab === "tickets" ? "Tickets" : "Book Now"}</h2>
                                    {content?.tickets && content.tickets.length > 0 ? (
                                        <div className="space-y-4">
                                            {content.tickets.map((ticket) => (
                                                <div key={ticket.id} className="flex items-center gap-4 border rounded-lg p-5 hover:border-primary transition">
                                                    <div className="bg-primary/10 text-primary rounded-lg p-3 flex-shrink-0 text-xl">🎟️</div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-foreground">{ticket.name}</h3>
                                                        {ticket.event_title && <p className="text-sm text-primary">{ticket.event_title}</p>}
                                                        {ticket.description && <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>}
                                                        {ticket.available_count != null && <p className="text-xs text-muted-foreground mt-1">{ticket.available_count > 0 ? `${ticket.available_count} remaining` : "Sold out"}</p>}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="text-lg font-bold text-foreground">{ticket.price}</div>
                                                        {(ticket.url || ticket.event_id) ? (
                                                            <a href={ticket.url || `https://${gecDomain}/events/${ticket.event_id}/tickets`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition">Buy Tickets</a>
                                                        ) : (
                                                            <button onClick={() => { setChatOpen(true); setData("message", `I'd like to book: ${ticket.name}`); }} className="mt-2 px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition">Buy Tickets</button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <EmptyState icon="🎟️" title="No Tickets Available" message="Tickets for upcoming events will appear here." />}
                                </SectionCard>
                            )}

                            {/* ══ CLASSIFIEDS ══ */}
                            {activeTab === "classifieds" && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-6">📋 Classifieds</h2>
                                    {content?.classifieds && content.classifieds.length > 0 ? (
                                        <div className="space-y-4">
                                            {content.classifieds.map((cl) => (
                                                <div key={cl.id} className="border rounded-lg p-5">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            {cl.category && <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${cl.category === "Employment" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{cl.category}</span>}
                                                            <h3 className="font-semibold text-base mt-2">{cl.title}</h3>
                                                        </div>
                                                        {cl.posted_at && <span className="text-xs text-muted-foreground">{new Date(cl.posted_at).toLocaleDateString()}</span>}
                                                    </div>
                                                    {cl.description && <p className="text-sm text-foreground mt-2 leading-relaxed">{cl.description}</p>}
                                                    {cl.price && <p className="text-sm font-semibold text-primary mt-2">{cl.price}</p>}
                                                    <div className="flex items-center gap-4 mt-3">
                                                        {cl.contact && <a href={`mailto:${cl.contact}`} className="text-sm text-primary hover:underline">✉️ {cl.contact}</a>}
                                                        {cl.url && <a href={cl.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View details →</a>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <EmptyState icon="📋" title="No Classifieds" message="Job postings, items for sale, and other classifieds will appear here." />}
                                </SectionCard>
                            )}

                            {/* ══ COMMUNITY (Go Local Voices) ══ */}
                            {activeTab === "community" && (
                                <SectionCard>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-3xl">🎙️</span>
                                        <div>
                                            <h2 className="text-2xl font-bold">Go Local Voices</h2>
                                            <p className="text-sm text-muted-foreground">Community stories, podcasts, and citizen journalism about {business.name}</p>
                                        </div>
                                    </div>
                                    {content?.localVoices && content.localVoices.length > 0 ? (
                                        <div className="space-y-4">
                                            {content.localVoices.map((voice) => {
                                                const typeStyle = localVoiceStyles[voice.type || "article"] || localVoiceStyles.article;
                                                return (
                                                    <a key={voice.id} href={voice.url || "#"} target="_blank" rel="noopener noreferrer" className="flex gap-4 border rounded-lg p-4 hover:bg-muted/50 transition">
                                                        {voice.image_url && <img src={voice.image_url} alt="" className="w-24 h-20 object-cover rounded flex-shrink-0" />}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${typeStyle.bg} ${typeStyle.text}`}>{typeStyle.label}</span>
                                                                {voice.duration && <span className="text-xs text-muted-foreground">{voice.duration}</span>}
                                                            </div>
                                                            <h3 className="font-semibold text-foreground line-clamp-1">{voice.title}</h3>
                                                            {voice.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{voice.description}</p>}
                                                            <div className="text-xs text-muted-foreground mt-2">{voice.author && <span>by {voice.author}</span>}{voice.published_at && <span> • {new Date(voice.published_at).toLocaleDateString()}</span>}</div>
                                                        </div>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    ) : <EmptyState icon="🎙️" title="No Community Content Yet" message="Podcasts, articles, and stories from Go Local Voices will appear here." />}
                                    {communityLinks?.golocalvoices && (
                                        <div className="text-center mt-6">
                                            <a href={communityLinks.golocalvoices.url} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">🎙️ Visit Go Local Voices →</a>
                                        </div>
                                    )}
                                </SectionCard>
                            )}

                            {/* ══ SOCIAL FEED ══ */}
                            {activeTab === "social" && (
                                <SectionCard>
                                    <h2 className="text-2xl font-bold mb-4">Social Feed</h2>
                                    {business.social_links && Object.keys(business.social_links).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {Object.entries(business.social_links).map(([platform, url]) => (
                                                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium hover:bg-muted/80 transition">
                                                    {platformIcons[platform] || "🔗"} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    {content?.socialFeed && content.socialFeed.length > 0 ? (
                                        <div className="space-y-4">
                                            {content.socialFeed.map((sp) => (
                                                <div key={sp.id} className="border rounded-lg overflow-hidden">
                                                    <div className="flex items-center gap-3 p-4 border-b">
                                                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm">{platformIcons[sp.platform] || "🔗"}</div>
                                                        <div className="flex-1"><span className="font-semibold text-sm">{business.name}</span><div className="text-xs text-muted-foreground">{new Date(sp.date).toLocaleDateString()}</div></div>
                                                        <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground capitalize">{sp.platform}</span>
                                                    </div>
                                                    {sp.image_url && <img src={sp.image_url} alt="" className="w-full max-h-72 object-cover" />}
                                                    <div className="p-4">
                                                        <p className="text-sm text-foreground leading-relaxed">{sp.text}</p>
                                                        <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                                                            {sp.likes != null && <span>❤️ {sp.likes}</span>}
                                                            {sp.comments != null && <span>💬 {sp.comments}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <EmptyState icon="📱" title="No Social Posts" message={`Follow ${business.name} on social media for the latest updates.`} />}
                                </SectionCard>
                            )}

                        </div>

                        {/* ─── SIDEBAR ─── */}
                        <div className="lg:col-span-1 space-y-6">
                            <SectionCard>
                                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                                <div className="space-y-3">
                                    {business.phone && <div className="flex items-center gap-3"><span>📞</span><a href={`tel:${business.phone}`} className="text-sm text-primary hover:underline">{business.phone}</a></div>}
                                    {business.email && <div className="flex items-center gap-3"><span>✉️</span><a href={`mailto:${business.email}`} className="text-sm text-primary hover:underline">{business.email}</a></div>}
                                    {business.website && <div className="flex items-center gap-3"><span>🌐</span><a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">{business.website.replace(/^https?:\/\//, "")}</a></div>}
                                    {business.address && <div className="flex items-start gap-3"><span className="flex-shrink-0">📍</span><span className="text-sm text-foreground">{business.address}, {business.city}, {business.state}</span></div>}
                                </div>
                            </SectionCard>

                            {business.opening_hours && Object.keys(business.opening_hours).length > 0 && (
                                <SectionCard>
                                    <h3 className="text-lg font-semibold mb-4">⏰ Hours</h3>
                                    <div className="space-y-2">
                                        {Object.entries(business.opening_hours).map(([day, hours]) => {
                                            const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
                                            return <div key={day} className={`flex justify-between text-sm ${day === today ? "font-semibold text-primary" : "text-foreground"}`}><span>{day}</span><span>{hours}</span></div>;
                                        })}
                                    </div>
                                </SectionCard>
                            )}

                            {business.social_links && Object.keys(business.social_links).length > 0 && (
                                <SectionCard>
                                    <h3 className="text-lg font-semibold mb-4">📱 Connect</h3>
                                    <div className="space-y-2">
                                        {Object.entries(business.social_links).map(([platform, url]) => (
                                            <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline py-1">{platformIcons[platform] || "🔗"} {platform.charAt(0).toUpperCase() + platform.slice(1)}</a>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}

                            {content?.ads && content.ads.length > 1 && (
                                <div className="bg-card rounded-lg shadow p-4 border">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Sponsored</p>
                                    <h4 className="font-semibold text-sm">{content.ads[1].title}</h4>
                                    {content.ads[1].body && <p className="text-xs text-muted-foreground mt-1">{content.ads[1].body}</p>}
                                    {content.ads[1].cta_url && <a href={content.ads[1].cta_url} className="block mt-3 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg text-center hover:bg-primary/90 transition">{content.ads[1].cta_text || "Learn More"}</a>}
                                </div>
                            )}

                            {communityLinks && Object.keys(communityLinks).length > 0 && (
                                <SectionCard>
                                    <h3 className="text-lg font-semibold mb-4">Also Available On</h3>
                                    <div className="space-y-2">
                                        {Object.entries(communityLinks).map(([key, link]) => (
                                            <a key={key} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline py-1">↗️ {link.label}</a>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}

                            {relatedBusinesses && relatedBusinesses.length > 0 && (
                                <SectionCard>
                                    <h3 className="text-lg font-semibold mb-4">Related Businesses</h3>
                                    <div className="space-y-3">
                                        {relatedBusinesses.map((related) => (
                                            <Link key={related.id} href={`/business/${related.slug}`} className="block p-3 border rounded-lg hover:bg-muted/50 transition">
                                                <div className="flex items-center gap-3">
                                                    {related.images && related.images.length > 0 ? <img src={related.images[0]} alt={related.name} className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground text-lg">{related.name.charAt(0)}</div>}
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-sm truncate">{related.name}</h4>
                                                        {related.rating && <div className="flex items-center gap-1"><svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg><span className="text-xs text-muted-foreground">{related.rating}</span></div>}
                                                        {related.address && <p className="text-xs text-muted-foreground truncate">{related.address}</p>}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ COMMUNITY FOOTER ═══ */}
                <div className="bg-gray-900 text-white mt-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
                        <span className="text-2xl">🏘️</span>
                        <h3 className="font-bold text-lg mt-2">ALPHASITE MEMBER</h3>
                        <p className="text-gray-400 text-sm mt-1">Part of the AlphaSite community of local businesses</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8 text-left">
                            <div>
                                <h4 className="font-semibold text-sm mb-3">📄 Our Website</h4>
                                {business.website && <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition block">Visit official website</a>}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-3">🏘️ Community</h4>
                                <Link href={`/community/${business.city?.toLowerCase()}-${business.state?.toLowerCase()}`} className="text-xs text-gray-400 hover:text-white transition block mb-1">All Businesses in {business.city}, {business.state}</Link>
                                <Link href="/directory" className="text-xs text-gray-400 hover:text-white transition block">Browse All Communities</Link>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-3">🏭 Industry</h4>
                                {business.industry && (
                                    <>
                                        <Link href={`/industry/${business.industry.slug}`} className="text-xs text-gray-400 hover:text-white transition block mb-1">All {business.industry.name} in {business.city}</Link>
                                        <Link href="/industry" className="text-xs text-gray-400 hover:text-white transition block">Browse All Industries</Link>
                                    </>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-3">🔍 Similar</h4>
                                {relatedBusinesses?.slice(0, 3).map((r) => <Link key={r.id} href={`/business/${r.slug}`} className="text-xs text-gray-400 hover:text-white transition block mb-1">{r.name}</Link>)}
                            </div>
                        </div>
                        <p className="text-gray-600 text-xs mt-8">Explore {business.city}, {business.state} Business Community • Powered by AlphaSite.ai</p>
                    </div>
                </div>

                {/* ═══ AI CHAT WIDGET ═══ */}
                {aiServices.enabled && aiServices.chat_enabled && (
                    <>
                        {chatOpen && (
                            <div className="fixed bottom-20 right-4 w-96 bg-card rounded-lg shadow-xl border z-50 flex flex-col max-h-[500px]">
                                <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
                                    <div><h3 className="font-semibold">Chat with {business.name}</h3><p className="text-xs text-blue-100">AI-powered • Available 24/7</p></div>
                                    <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200 transition">✕</button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px]">
                                    {chatMessages.length === 0 && <div className="text-center text-muted-foreground py-8"><p className="text-sm">👋 Hi! I'm the AI assistant for {business.name}. How can I help you today?</p></div>}
                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-muted text-foreground"}`}>{msg.content}</div>
                                        </div>
                                    ))}
                                    {processing && <div className="flex justify-start"><div className="bg-muted text-foreground p-3 rounded-lg text-sm"><span className="animate-pulse">Thinking...</span></div></div>}
                                </div>
                                <form onSubmit={handleChatSubmit} className="p-4 border-t flex-shrink-0">
                                    <div className="flex space-x-2">
                                        <input type="text" value={data.message} onChange={(e) => setData("message", e.target.value)} placeholder="Type your message..." className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" disabled={processing} />
                                        <button type="submit" disabled={processing || !data.message.trim()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition text-sm">Send</button>
                                    </div>
                                </form>
                            </div>
                        )}
                        <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-4 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 z-50 transition hover:scale-105 text-xl">💬</button>
                    </>
                )}
            </div>
        </Layout>
    );
}
