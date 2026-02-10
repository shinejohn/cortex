import { Head, Link } from "@inertiajs/react";
import {
    Bot,
    Phone,
    MessageSquare,
    Brain,
    ChevronRight,
    Check,
    Zap,
    Shield,
    Settings,
    ArrowRight,
    Activity,
    CreditCard,
} from "lucide-react";
import Layout from "@/layouts/layout";

interface Business {
    id: string;
    name: string;
    slug: string;
}

interface AIServiceConfig {
    chatbot_enabled?: boolean;
    auto_reply_enabled?: boolean;
    sentiment_analysis_enabled?: boolean;
    lead_scoring_enabled?: boolean;
    review_response_enabled?: boolean;
    faq_auto_answer_enabled?: boolean;
}

interface FourCallsIntegration {
    is_active: boolean;
    phone_number?: string;
    agent_name?: string;
    greeting_message?: string;
    stats?: {
        total_calls: number;
        answered_calls: number;
        missed_calls: number;
        avg_duration_seconds: number;
    };
}

interface Subscription {
    plan: string;
    status: string;
    current_period_end?: string;
    features?: string[];
}

interface Package {
    name: string;
    price: number;
    description?: string;
    features?: string[];
}

interface Props {
    business: Business;
    servicesConfig: AIServiceConfig;
    fourCallsIntegration?: FourCallsIntegration | null;
    subscription?: Subscription | null;
    availablePackages?: Record<string, Package> | Package[];
}

function ServiceCard({
    title,
    description,
    icon: Icon,
    isEnabled,
    comingSoon,
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    isEnabled: boolean;
    comingSoon?: boolean;
}) {
    return (
        <div className={`bg-card rounded-2xl border-none shadow-sm p-6 relative ${comingSoon ? "opacity-75" : ""}`}>
            {comingSoon && (
                <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                        Coming Soon
                    </span>
                </div>
            )}
            <div className="flex items-start gap-4">
                <div
                    className={`flex items-center justify-center h-12 w-12 rounded-xl shrink-0 ${
                        isEnabled ? "bg-emerald-50 dark:bg-emerald-950" : "bg-muted"
                    }`}
                >
                    <Icon className={`h-6 w-6 ${isEnabled ? "text-emerald-600" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        {isEnabled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full">
                                <Check className="h-3 w-3" />
                                Active
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
}

export default function CrmAIServices({
    business,
    servicesConfig,
    fourCallsIntegration,
    subscription,
    availablePackages,
}: Props) {
    const packages = availablePackages
        ? Array.isArray(availablePackages)
            ? availablePackages
            : Object.values(availablePackages)
        : [];

    return (
        <Layout>
            <Head>
                <title>AI Services - {business.name} CRM - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 lg:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
                            <Link href="/crm" className="hover:text-white transition-colors">
                                CRM
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span>AI Services</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight">AI Services</h1>
                                <p className="text-blue-100/90 mt-2">
                                    Configure AI-powered tools for {business.name}
                                </p>
                            </div>
                            {subscription && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                                    <Activity className="h-4 w-4" />
                                    {subscription.plan} Plan
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* 4Calls.ai Section */}
                    <div className="mb-10">
                        <h2 className="font-display text-2xl font-black tracking-tight text-foreground mb-6 flex items-center gap-2">
                            <Phone className="h-6 w-6 text-primary" />
                            AI Phone Agent
                            <span className="text-sm font-normal text-muted-foreground ml-2">Powered by 4Calls.ai</span>
                        </h2>

                        {fourCallsIntegration?.is_active ? (
                            <div className="bg-card rounded-2xl border-none shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-medium text-emerald-600">Active</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {fourCallsIntegration.phone_number && (
                                        <div className="bg-muted/50 rounded-xl p-4">
                                            <div className="text-xs text-muted-foreground mb-1">Phone Number</div>
                                            <div className="text-sm font-medium text-foreground">{fourCallsIntegration.phone_number}</div>
                                        </div>
                                    )}
                                    {fourCallsIntegration.agent_name && (
                                        <div className="bg-muted/50 rounded-xl p-4">
                                            <div className="text-xs text-muted-foreground mb-1">Agent Name</div>
                                            <div className="text-sm font-medium text-foreground">{fourCallsIntegration.agent_name}</div>
                                        </div>
                                    )}
                                    {fourCallsIntegration.stats && (
                                        <>
                                            <div className="bg-muted/50 rounded-xl p-4">
                                                <div className="text-xs text-muted-foreground mb-1">Total Calls</div>
                                                <div className="text-lg font-bold text-foreground">
                                                    {fourCallsIntegration.stats.total_calls}
                                                </div>
                                            </div>
                                            <div className="bg-muted/50 rounded-xl p-4">
                                                <div className="text-xs text-muted-foreground mb-1">Answer Rate</div>
                                                <div className="text-lg font-bold text-foreground">
                                                    {fourCallsIntegration.stats.total_calls > 0
                                                        ? `${Math.round(
                                                              (fourCallsIntegration.stats.answered_calls /
                                                                  fourCallsIntegration.stats.total_calls) *
                                                                  100
                                                          )}%`
                                                        : "N/A"}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {fourCallsIntegration.greeting_message && (
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <div className="text-xs text-muted-foreground mb-1">Greeting Message</div>
                                        <p className="text-sm text-foreground italic">"{fourCallsIntegration.greeting_message}"</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-card rounded-2xl border-none shadow-sm p-8 text-center">
                                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                                    <Phone className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">AI Phone Agent Not Active</h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                    Set up an AI-powered phone agent to answer customer calls 24/7, take messages, and schedule appointments automatically.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* AI Services Grid */}
                    <div className="mb-10">
                        <h2 className="font-display text-2xl font-black tracking-tight text-foreground mb-6 flex items-center gap-2">
                            <Brain className="h-6 w-6 text-primary" />
                            AI-Powered Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ServiceCard
                                title="AI Chatbot"
                                description="Automated customer support chatbot that answers questions using your FAQs and business information."
                                icon={MessageSquare}
                                isEnabled={!!servicesConfig.chatbot_enabled}
                            />
                            <ServiceCard
                                title="Auto-Reply"
                                description="Automatically respond to customer inquiries with AI-generated, contextual responses."
                                icon={Zap}
                                isEnabled={!!servicesConfig.auto_reply_enabled}
                            />
                            <ServiceCard
                                title="Sentiment Analysis"
                                description="Analyze customer feedback and reviews to understand sentiment trends and improve service."
                                icon={Brain}
                                isEnabled={!!servicesConfig.sentiment_analysis_enabled}
                            />
                            <ServiceCard
                                title="Lead Scoring"
                                description="AI-powered lead scoring to prioritize high-value potential customers automatically."
                                icon={Activity}
                                isEnabled={!!servicesConfig.lead_scoring_enabled}
                            />
                            <ServiceCard
                                title="Review Response"
                                description="Generate professional AI responses to customer reviews to maintain your online reputation."
                                icon={MessageSquare}
                                isEnabled={!!servicesConfig.review_response_enabled}
                            />
                            <ServiceCard
                                title="FAQ Auto-Answer"
                                description="Automatically answer common questions using your FAQ database and AI understanding."
                                icon={Shield}
                                isEnabled={!!servicesConfig.faq_auto_answer_enabled}
                            />
                        </div>
                    </div>

                    {/* Available Packages */}
                    {packages.length > 0 && (
                        <div>
                            <h2 className="font-display text-2xl font-black tracking-tight text-foreground mb-6 flex items-center gap-2">
                                <CreditCard className="h-6 w-6 text-primary" />
                                Available Packages
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {packages.map((pkg, index) => (
                                    <div
                                        key={index}
                                        className="bg-card rounded-2xl border-none shadow-sm p-6 hover:shadow-md transition-all"
                                    >
                                        <h3 className="font-display text-xl font-bold text-foreground mb-1">{pkg.name}</h3>
                                        <div className="text-3xl font-black text-primary mb-2">
                                            ${pkg.price}
                                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                                        </div>
                                        {pkg.description && (
                                            <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                                        )}
                                        {pkg.features && pkg.features.length > 0 && (
                                            <ul className="space-y-2 mb-6">
                                                {pkg.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
