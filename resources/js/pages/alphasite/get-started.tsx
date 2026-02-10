import { Head, Link } from "@inertiajs/react";
import {
    ArrowRight,
    Search,
    ShieldCheck,
    Sparkles,
    Bot,
    Globe,
    BarChart3,
    Phone,
    Star,
    CheckCircle2,
    Building2,
} from "lucide-react";
import Layout from "@/layouts/layout";

export default function GetStarted() {
    return (
        <Layout>
            <Head>
                <title>Get Started - AlphaSite</title>
                <meta name="description" content="Claim your business page and unlock AI-powered tools on AlphaSite" />
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                        <div className="text-center max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6">
                                <Sparkles className="h-4 w-4" />
                                Free to Get Started
                            </div>
                            <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tight mb-6">
                                Grow Your Business with AI
                            </h1>
                            <p className="text-xl lg:text-2xl text-blue-100/90 mb-10">
                                Claim your free business page, activate AI tools, and reach more customers in your community.
                            </p>
                            <Link
                                href="/directory"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg hover:bg-white/90 transition-colors shadow-lg"
                            >
                                <Search className="h-5 w-5" />
                                Find Your Business
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-center text-foreground mb-4">
                        How It Works
                    </h2>
                    <p className="text-center text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
                        Get up and running in three simple steps
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-5">
                                <Search className="h-8 w-8 text-primary" />
                            </div>
                            <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                                1
                            </div>
                            <h3 className="font-display text-xl font-bold text-foreground mb-2">Find Your Business</h3>
                            <p className="text-muted-foreground text-sm">
                                Search our directory to find your existing business listing, or create a new one if it does not exist yet.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-5">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            </div>
                            <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                                2
                            </div>
                            <h3 className="font-display text-xl font-bold text-foreground mb-2">Verify Ownership</h3>
                            <p className="text-muted-foreground text-sm">
                                Verify that you own the business through phone or email verification. Quick and secure process.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-5">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                                3
                            </div>
                            <h3 className="font-display text-xl font-bold text-foreground mb-2">Activate AI Tools</h3>
                            <p className="text-muted-foreground text-sm">
                                Choose a plan and unlock AI-powered features including chatbots, phone agents, and smart analytics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="bg-card border-y">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-center text-foreground mb-4">
                            What You Get
                        </h2>
                        <p className="text-center text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
                            Everything you need to manage and grow your local business
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <FeatureCard
                                icon={Globe}
                                title="AI Business Page"
                                description="A professional, SEO-optimized business page that showcases your services, hours, and reviews."
                            />
                            <FeatureCard
                                icon={Bot}
                                title="AI Chatbot"
                                description="24/7 automated customer support that answers questions using your business information."
                            />
                            <FeatureCard
                                icon={Phone}
                                title="AI Phone Agent"
                                description="Never miss a call. Our AI agent answers calls, takes messages, and books appointments."
                            />
                            <FeatureCard
                                icon={BarChart3}
                                title="CRM Dashboard"
                                description="Track customer interactions, manage leads, and monitor your business performance."
                            />
                            <FeatureCard
                                icon={Star}
                                title="Review Management"
                                description="Monitor and respond to reviews with AI-generated professional responses."
                            />
                            <FeatureCard
                                icon={Building2}
                                title="Local Directory"
                                description="Be discovered by customers searching for businesses in your area and industry."
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing Preview */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-center text-foreground mb-4">
                        Simple Pricing
                    </h2>
                    <p className="text-center text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
                        Start free and upgrade as your business grows
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <PricingCard
                            name="Standard"
                            price="$29.99"
                            description="Essential AI tools for small businesses"
                            features={[
                                "AI Business Page",
                                "Basic CRM Dashboard",
                                "Review Monitoring",
                                "Email Support",
                            ]}
                        />
                        <PricingCard
                            name="Premium"
                            price="$79.99"
                            description="Advanced features for growing businesses"
                            features={[
                                "Everything in Standard",
                                "AI Chatbot",
                                "AI Phone Agent",
                                "Advanced Analytics",
                                "Priority Support",
                            ]}
                            highlighted
                        />
                        <PricingCard
                            name="Enterprise"
                            price="$199.99"
                            description="Full suite for established businesses"
                            features={[
                                "Everything in Premium",
                                "Custom Integrations",
                                "Multi-Location Support",
                                "Dedicated Account Manager",
                                "API Access",
                            ]}
                        />
                    </div>
                </div>

                {/* Final CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
                        <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight mb-4">
                            Ready to Transform Your Business?
                        </h2>
                        <p className="text-xl text-blue-100/90 mb-8 max-w-xl mx-auto">
                            Join thousands of local businesses using AI to grow and serve their communities.
                        </p>
                        <Link
                            href="/directory"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                        >
                            Get Started Now
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-muted/30 rounded-2xl p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function PricingCard({
    name,
    price,
    description,
    features,
    highlighted,
}: {
    name: string;
    price: string;
    description: string;
    features: string[];
    highlighted?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl p-6 ${
                highlighted
                    ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary scale-105"
                    : "bg-card border-none shadow-sm"
            }`}
        >
            <h3 className="font-display text-xl font-bold mb-1">{name}</h3>
            <div className="text-3xl font-black mb-1">
                {price}
                <span className={`text-sm font-normal ${highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    /mo
                </span>
            </div>
            <p className={`text-sm mb-5 ${highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {description}
            </p>
            <ul className="space-y-2.5">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${highlighted ? "text-primary-foreground" : "text-emerald-500"}`} />
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
}
