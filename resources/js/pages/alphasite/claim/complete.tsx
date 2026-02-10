import { Head, Link, useForm } from "@inertiajs/react";
import {
    CheckCircle2,
    Crown,
    ArrowRight,
    Shield,
    Bot,
    Phone,
    BarChart3,
    Star,
    Zap,
} from "lucide-react";
import Layout from "@/layouts/layout";
import { useState } from "react";

interface Business {
    id: string;
    name: string;
    slug: string;
    address?: string;
    city?: string;
    state?: string;
}

interface SubscriptionTier {
    name: string;
    price: number;
}

interface Props {
    business: Business;
    subscriptionTiers: Record<string, SubscriptionTier>;
}

const tierFeatures: Record<string, { icon: React.ElementType; features: string[]; description: string }> = {
    standard: {
        icon: Shield,
        description: "Essential AI tools for small businesses",
        features: [
            "AI-Powered Business Page",
            "Basic CRM Dashboard",
            "Review Monitoring",
            "Email Support",
            "FAQ Management",
        ],
    },
    premium: {
        icon: Star,
        description: "Advanced features for growing businesses",
        features: [
            "Everything in Standard",
            "AI Chatbot",
            "AI Phone Agent (4Calls.ai)",
            "Advanced Analytics",
            "Sentiment Analysis",
            "Lead Scoring",
            "Priority Support",
        ],
    },
    enterprise: {
        icon: Crown,
        description: "Full suite for established businesses",
        features: [
            "Everything in Premium",
            "Custom Integrations",
            "Multi-Location Support",
            "Dedicated Account Manager",
            "API Access",
            "Custom AI Training",
            "White-Glove Onboarding",
        ],
    },
};

export default function ClaimComplete({ business, subscriptionTiers }: Props) {
    const [selectedTier, setSelectedTier] = useState<string>("premium");

    const { data, setData, post, processing } = useForm({
        tier: "premium",
        stripe_subscription_id: "",
    });

    const handleSelectTier = (tier: string) => {
        setSelectedTier(tier);
        setData("tier", tier);
    };

    return (
        <Layout>
            <Head>
                <title>Complete Your Claim - {business.name} - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 lg:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight mb-2">
                            Ownership Verified
                        </h1>
                        <p className="text-blue-100/90 text-lg">
                            Great news! You have verified ownership of <strong>{business.name}</strong>.
                            <br />
                            Choose a plan to complete your claim and unlock AI-powered tools.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Subscription Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                        {Object.entries(subscriptionTiers).map(([key, tier]) => {
                            const tierInfo = tierFeatures[key];
                            const isSelected = selectedTier === key;
                            const isPremium = key === "premium";

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleSelectTier(key)}
                                    className={`relative text-left rounded-2xl p-6 transition-all ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary"
                                            : "bg-card border-none shadow-sm hover:shadow-md"
                                    } ${isPremium && !isSelected ? "ring-2 ring-primary/30" : ""}`}
                                >
                                    {isPremium && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                                                isSelected ? "bg-white text-primary" : "bg-primary text-primary-foreground"
                                            }`}>
                                                <Zap className="h-3 w-3" />
                                                Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-4 mt-1">
                                        {tierInfo && (
                                            <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${
                                                isSelected ? "bg-white/20" : "bg-primary/10"
                                            }`}>
                                                <tierInfo.icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-primary"}`} />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <span className="text-4xl font-black">${tier.price}</span>
                                        <span className={`text-sm ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                            /month
                                        </span>
                                    </div>

                                    {tierInfo && (
                                        <>
                                            <p className={`text-sm mb-4 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                                {tierInfo.description}
                                            </p>
                                            <ul className="space-y-2.5">
                                                {tierInfo.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2
                                                            className={`h-4 w-4 shrink-0 ${
                                                                isSelected ? "text-white" : "text-emerald-500"
                                                            }`}
                                                        />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}

                                    <div
                                        className={`mt-6 py-2.5 px-4 rounded-xl text-center text-sm font-semibold transition-colors ${
                                            isSelected
                                                ? "bg-white text-primary"
                                                : "bg-primary/10 text-primary"
                                        }`}
                                    >
                                        {isSelected ? "Selected" : "Select Plan"}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected Plan Summary */}
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-card rounded-2xl border-none shadow-sm p-8 text-center">
                            <h3 className="font-display text-xl font-bold text-foreground mb-2">
                                Complete Your Claim
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                You selected the{" "}
                                <strong className="text-foreground">
                                    {subscriptionTiers[selectedTier]?.name}
                                </strong>{" "}
                                plan at{" "}
                                <strong className="text-foreground">
                                    ${subscriptionTiers[selectedTier]?.price}/month
                                </strong>
                                .
                            </p>

                            <div className="bg-muted/50 rounded-xl p-5 mb-6 text-left">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                                        <Bot className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">{business.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {business.city && `${business.city}, `}
                                            {business.state}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground mb-6">
                                Payment processing will be handled securely through Stripe. You can cancel or change plans at any time.
                            </p>

                            <Link
                                href={`/business/${business.slug}`}
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                Complete Claim
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
