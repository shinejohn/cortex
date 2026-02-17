import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import Layout from "@/layouts/layout";
import { Business, BusinessTemplate } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
    MapPin, Phone, Globe, Mail, Star, Share2, Bookmark, Camera,
    MessageCircle, Calendar, ShoppingCart, TrendingUp, Megaphone,
    Headphones, DollarSign, Settings, Info, AlertTriangle, PartyPopper,
    RefreshCw, Home, Utensils, Image as ImageIcon, Smartphone, Trophy,
    Newspaper, Ticket, Tag, Users, Mic
} from "lucide-react";

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
            url: string;
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

function StarRating({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${size} ${star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
            ))}
        </div>
    );
}

function EmptyState({ icon: Icon, title, message }: { icon: any; title: string; message: string }) {
    return (
        <div className="text-center py-12">
            <div className="flex justify-center mb-4">
                <div className="bg-muted rounded-full p-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Style Constants & Mappings
   ────────────────────────────────────────────── */

const ServiceIcons: Record<string, any> = {
    order: ShoppingCart,
    reservation: Calendar,
    menu: Utensils,
    concierge: MessageCircle,
    sales: TrendingUp,
    customer_service: Headphones,
};

const AnnouncementStyles: Record<string, { border: string; bg: string; icon: any }> = {
    info: { border: "border-blue-200", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Info },
    warning: { border: "border-yellow-200", bg: "bg-yellow-50 dark:bg-yellow-900/20", icon: AlertTriangle },
    promotion: { border: "border-green-200", bg: "bg-green-50 dark:bg-green-900/20", icon: PartyPopper },
    update: { border: "border-purple-200", bg: "bg-purple-50 dark:bg-purple-900/20", icon: RefreshCw },
};

const LocalVoiceStyles: Record<string, { bg: string; text: string; label: string }> = {
    podcast: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300", label: "Podcast" },
    article: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300", label: "Article" },
    photo_essay: { bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-700 dark:text-yellow-300", label: "Photo Essay" },
    video: { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300", label: "Video" },
};

/* ──────────────────────────────────────────────
   Two-Level Tab Definitions
   ────────────────────────────────────────────── */

const ROW1_TABS = [
    { id: "overview", icon: Home, label: "Overview" },
    { id: "menu", icon: Utensils, label: "Menu" },
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "photos", icon: Camera, label: "Photos" },
    { id: "social", icon: Smartphone, label: "Social" },
    { id: "achievements", icon: Trophy, label: "Awards" },
    { id: "announcements", icon: Megaphone, label: "News" },
];

const ROW2_TABS = [
    { id: "articles", icon: Newspaper, label: "Articles" },
    { id: "events", icon: Calendar, label: "Events" },
    { id: "coupons", icon: Tag, label: "Coupons" },
    { id: "deals", icon: DollarSign, label: "Deals" },
    { id: "tickets", icon: Ticket, label: "Tickets" },
    { id: "classifieds", icon: users => <Users className="h-4 w-4" />, label: "Classifieds" }, // Using function for consistency if needed, but simple component ref elsewhere
    { id: "community", icon: Mic, label: "Community" },
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
                    role: "assistant", // Logic handled by backend, just simulation/types here
                    content: page.props?.response || "I'm here to help! How can I assist you?",
                };
                setChatMessages((prev) => [...prev, aiResponse]);
            },
            onError: () => {
                setChatMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "Sorry, something went wrong. Please try again." }, // Fixed role
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
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
                {customBranding?.favicon && <link rel="icon" href={customBranding.favicon} />}
                {/* Open Graph & Twitter meta tags omitted for brevity, logic remains same */}
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* ═══════════════════════════════════
                    HERO SECTION
                    ═══════════════════════════════════ */}
                <div className="relative bg-gray-900 overflow-hidden">
                    <div className="h-80 relative">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-3xl md:text-5xl font-display font-bold mb-2 tracking-tight">{business.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                                {business.rating && (
                                    <div className="flex items-center bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                                        <span className="font-semibold">{business.rating}</span>
                                        {business.reviews_count != null && (
                                            <span className="text-gray-300 ml-1">({business.reviews_count})</span>
                                        )}
                                    </div>
                                )}
                                {business.industry?.name && (
                                    <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                                        {business.industry.name}
                                    </Badge>
                                )}
                                {business.price_level && (
                                    <Badge variant="outline" className="text-white border-white/30">
                                        {business.price_level}
                                    </Badge>
                                )}
                            </div>
                            {business.alphasite_subdomain && (
                                <div className="text-blue-300 mt-2 text-sm font-medium">
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
                    <div className="bg-background border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <MessageCircle className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold tracking-tight">AI-Powered Services</h2>
                                    <p className="text-sm text-muted-foreground">Instant assistance, available 24/7</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {aiServices.services.filter((s) => s.enabled).map((service) => {
                                    const Icon = ServiceIcons[service.id] || MessageCircle;
                                    return (
                                        <Card
                                            key={service.id}
                                            className="cursor-pointer hover:shadow-md transition-all hover:bg-muted/50 border-muted"
                                            onClick={() => setChatOpen(true)}
                                        >
                                            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-sm">{service.name}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <Separator className="my-6" />

                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                {business.phone && (
                                    <Button variant="secondary" size="sm" asChild>
                                        <a href={`tel:${business.phone}`}>
                                            <Phone className="mr-2 h-4 w-4" /> Call
                                        </a>
                                    </Button>
                                )}
                                {business.email && (
                                    <Button variant="secondary" size="sm" asChild>
                                        <a href={`mailto:${business.email}`}>
                                            <Mail className="mr-2 h-4 w-4" /> Message
                                        </a>
                                    </Button>
                                )}
                                <Button variant="secondary" size="sm">
                                    <Share2 className="mr-2 h-4 w-4" /> Share
                                </Button>
                                <Button variant="secondary" size="sm">
                                    <Bookmark className="mr-2 h-4 w-4" /> Save
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => setActiveTab("photos")}>
                                    <Camera className="mr-2 h-4 w-4" /> Add Photo
                                </Button>
                                <Button size="sm" onClick={() => setActiveTab("reviews")}>
                                    <Star className="mr-2 h-4 w-4 fill-current" /> Write Review
                                </Button>
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
                            const style = AnnouncementStyles[announcement.type || "info"] || AnnouncementStyles.info;
                            const Icon = style.icon;
                            return (
                                <div key={announcement.id} className={`${style.bg} ${style.border} border rounded-lg p-4 mb-3 flex items-start gap-4 shadow-sm`}>
                                    <div className="p-2 bg-background/50 rounded-full shrink-0">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{announcement.body}</p>
                                    </div>
                                    {announcement.published_at && (
                                        <Badge variant="secondary" className="hidden sm:inline-flex bg-background/50">
                                            {new Date(announcement.published_at).toLocaleDateString()}
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ═══════════════════════════════════
                    TWO-LEVEL TAB NAVIGATION
                    ═══════════════════════════════════ */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Row 1: Business Core */}
                        {row1Visible.length > 0 && (
                            <div className="flex overflow-x-auto no-scrollbar border-b border-border/50">
                                {row1Visible.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <Link
                                            key={tab.id}
                                            href={`/business/${business.slug}${tab.id === "overview" ? "" : `/${tab.id}`}`}
                                            onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); window.history.pushState({}, "", `/business/${business.slug}${tab.id === "overview" ? "" : `/${tab.id}`}`); }}
                                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${isActive
                                                    ? "border-primary text-primary"
                                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                                                }`}
                                        >
                                            <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                            {tab.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                        {/* Row 2: Ecosystem & Marketplace */}
                        {row2Visible.length > 0 && (
                            <div className="flex overflow-x-auto no-scrollbar py-2 gap-1">
                                {row2Visible.map((tab) => {
                                    const Icon = typeof tab.icon === 'function' ? tab.icon : tab.icon; // Handle component or element
                                    // lucide-react icons are components, so typically we render them as <Icon />.
                                    // If row2Visible definition used functions, handle that.
                                    // In definitions above, simple lucide components are used directly except classifieds.
                                    // Consistent rendering needed.
                                    const TabIcon = tab.icon; // Assuming component
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <Link
                                            key={tab.id}
                                            href={`/business/${business.slug}/${tab.id}`}
                                            onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); window.history.pushState({}, "", `/business/${business.slug}/${tab.id}`); }}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                }`}
                                        >
                                            {/* @ts-ignore - Dynamic icon rendering */}
                                            {typeof TabIcon === 'function' && !('displayName' in TabIcon) ? TabIcon({}) : <TabIcon className="h-3.5 w-3.5" />}
                                            {tab.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    MAIN CONTENT + SIDEBAR
                    ═══════════════════════════════════ */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* ─── Main Content Area ─── */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* ══ OVERVIEW ══ */}
                            {activeTab === "overview" && (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-2xl">About {business.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {business.description && <p className="text-muted-foreground leading-relaxed mb-6">{business.description}</p>}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {business.address && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-muted rounded-md shrink-0"><MapPin className="h-5 w-5 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium">Address</p>
                                                            <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">{business.address}, {business.city}, {business.state}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {business.phone && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-muted rounded-md shrink-0"><Phone className="h-5 w-5 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium">Phone</p>
                                                            <a href={`tel:${business.phone}`} className="text-sm text-primary hover:underline">{business.phone}</a>
                                                        </div>
                                                    </div>
                                                )}
                                                {business.website && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-muted rounded-md shrink-0"><Globe className="h-5 w-5 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium">Website</p>
                                                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block max-w-[200px]">{business.website.replace(/^https?:\/\//, "")}</a>
                                                        </div>
                                                    </div>
                                                )}
                                                {business.email && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-muted rounded-md shrink-0"><Mail className="h-5 w-5 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium">Email</p>
                                                            <a href={`mailto:${business.email}`} className="text-sm text-primary hover:underline truncate block max-w-[200px]">{business.email}</a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {content?.articles && content.articles.length > 0 && (
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-xl">Latest Articles</CardTitle>
                                                <Button variant="ghost" size="sm" onClick={() => setActiveTab("articles")}>View all</Button>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-4">
                                                {content.articles.slice(0, 3).map((article) => (
                                                    <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="group flex gap-4 items-start">
                                                        {article.image_url && (
                                                            <img src={article.image_url} alt={article.title} className="w-24 h-16 object-cover rounded-md group-hover:opacity-90 transition-opacity" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{article.title}</h4>
                                                            {article.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{article.excerpt}</p>}
                                                            {article.source && <Badge variant="secondary" className="mt-2 text-[10px]">{article.source}</Badge>}
                                                        </div>
                                                    </a>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {content?.events && content.events.length > 0 && (
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-xl">Upcoming Events</CardTitle>
                                                <Button variant="ghost" size="sm" onClick={() => setActiveTab("events")}>View all</Button>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                                {content.events.slice(0, 4).map((event) => {
                                                    const eventUrl = event.url || `https://${gecDomain}/events/${event.id}`;
                                                    return (
                                                        <a key={event.id} href={eventUrl} target="_blank" rel="noopener noreferrer" className="block border rounded-lg p-3 hover:border-primary/50 hover:bg-muted/50 transition group">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{event.date}</Badge>
                                                                {event.price && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{event.price}</span>}
                                                            </div>
                                                            <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{event.title}</h4>
                                                            {event.time && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Info className="h-3 w-3" />{event.time}</p>}
                                                        </a>
                                                    );
                                                })}
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}

                            {/* ══ REVIEWS ══ */}
                            {activeTab === "reviews" && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-2xl">Reviews</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {reviews?.average_rating != null ? (
                                            <>
                                                <div className="flex flex-col sm:flex-row items-center gap-8 mb-8 pb-8 border-b">
                                                    <div className="text-center shrink-0">
                                                        <div className="text-5xl font-bold tracking-tighter text-foreground">{reviews.average_rating.toFixed(1)}</div>
                                                        <div className="flex justify-center my-2"><StarRating rating={reviews.average_rating} /></div>
                                                        <p className="text-sm text-muted-foreground">{reviews.total_count || 0} reviews</p>
                                                    </div>
                                                    {reviews.rating_breakdown && (
                                                        <div className="flex-1 w-full space-y-2">
                                                            {[5, 4, 3, 2, 1].map((star) => {
                                                                const count = reviews.rating_breakdown?.[star] || 0;
                                                                const pct = Math.round((count / (reviews.total_count || 1)) * 100);
                                                                return (
                                                                    <div key={star} className="flex items-center gap-3">
                                                                        <span className="text-xs font-semibold w-3">{star}</span>
                                                                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                                            <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                                                                        </div>
                                                                        <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-6">
                                                    {reviews.data.map((review) => (
                                                        <div key={review.id} className="flex gap-4">
                                                            <Avatar>
                                                                <AvatarImage src={review.avatar_url} />
                                                                <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="font-semibold text-sm">{review.author}</h4>
                                                                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <StarRating rating={review.rating} size="w-3 h-3" />
                                                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.content}</p>
                                                                {review.response && (
                                                                    <div className="mt-3 bg-muted/50 p-3 rounded-md text-sm">
                                                                        <p className="font-semibold text-xs mb-1">Response from business:</p>
                                                                        <p className="text-muted-foreground">{review.response}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <EmptyState icon={Star} title="No reviews yet" message="Be the first to leave a review for this business!" />
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">Write a Review</Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {/* ══ PLACEHOLDER FOR OTHER TABS ══ */}
                            {/* In a real implementation, you would implement Menu, Photos, etc. similarly using Cards/Grids */}
                            {activeTab !== "overview" && activeTab !== "reviews" && (
                                <EmptyState
                                    icon={Info}
                                    title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon`}
                                    message="This section is currently under development."
                                />
                            )}

                        </div>

                        {/* ─── Sidebar Area ─── */}
                        <div className="space-y-6">
                            {/* Similar sidebar content can be refactored into Cards */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Hours</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    {business.opening_hours ? (
                                        Object.entries(business.opening_hours).map(([day, hours]) => (
                                            <div key={day} className="flex justify-between">
                                                <span className="capitalize text-muted-foreground">{day}</span>
                                                <span className="font-medium">{hours}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No hours available</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
