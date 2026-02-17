import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MessageCircle, Calendar, ShoppingCart, TrendingUp,
    Megaphone, Headphones, DollarSign, Settings, Lock
} from "lucide-react";

const AI_SERVICES = [
    {
        key: "concierge",
        name: "AI Concierge",
        description: "24/7 customer Q&A powered by your FAQ database",
        icon: MessageCircle,
        tier_minimum: "standard",
        price_monthly: 49,
    },
    {
        key: "reservations",
        name: "AI Reservations",
        description: "Automated booking and calendar management",
        icon: Calendar,
        tier_minimum: "standard",
        price_monthly: 49,
    },
    {
        key: "order_assistant",
        name: "AI Order Assistant",
        description: "Order capture and payment processing",
        icon: ShoppingCart,
        tier_minimum: "standard",
        price_monthly: 49,
    },
    {
        key: "sales_agent",
        name: "AI Sales Agent",
        description: "Lead qualification and follow-up automation",
        icon: TrendingUp,
        tier_minimum: "premium",
        price_monthly: 99,
    },
    {
        key: "marketing",
        name: "AI Marketing Manager",
        description: "Campaign management and content creation",
        icon: Megaphone,
        tier_minimum: "premium",
        price_monthly: 99,
    },
    {
        key: "customer_service",
        name: "AI Customer Service",
        description: "Complaint handling and satisfaction monitoring",
        icon: Headphones,
        tier_minimum: "premium",
        price_monthly: 99,
    },
    {
        key: "finance",
        name: "AI Financial Manager",
        description: "Invoicing, P&L, and cash flow management",
        icon: DollarSign,
        tier_minimum: "enterprise",
        price_monthly: 99,
    },
    {
        key: "operations",
        name: "AI Operations Manager",
        description: "Workflow optimization and resource allocation",
        icon: Settings,
        tier_minimum: "enterprise",
        price_monthly: 99,
    },
];

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        alphasite_subdomain: string | null;
        subscription_tier: string;
        city: string | null;
        state: string | null;
    };
    subscription: {
        tier: string;
        status: string;
        trial_expires_at: string | null;
        ai_services_enabled: string[];
    } | null;
    servicesConfig: {
        enabled: boolean;
        services: string[];
    };
    fourCallsIntegration: Record<string, unknown> | null;
    subscriptionDetails: Record<string, unknown> | null;
    availablePackages: Record<string, unknown>;
}

const tierOrder = ["basic", "standard", "premium", "enterprise"];

function canUnlock(serviceTier: string, currentTier: string): boolean {
    const currentIdx = tierOrder.indexOf(currentTier);
    const requiredIdx = tierOrder.indexOf(serviceTier);
    return currentIdx >= requiredIdx;
}

export default function CrmAiServices({
    business,
    subscription,
    servicesConfig,
}: Props) {
    const currentTier = subscription?.tier ?? "basic";
    const enabledServices = servicesConfig?.services ?? [];

    return (
        <AlphasiteCrmLayout
            business={business}
            subscription={subscription}
            title="AI Services"
        >
            <Head title={`AI Services | ${business.name}`} />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-display font-black tracking-tight text-foreground">
                        AI Services
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Enhance your CRM with autonomous AI agents.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {AI_SERVICES.map((svc) => {
                        const isActive = enabledServices.includes(svc.key);
                        const isLocked = !canUnlock(svc.tier_minimum, currentTier);
                        const Icon = svc.icon;

                        return (
                            <Card
                                key={svc.key}
                                className={`flex flex-col ${isActive
                                        ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-900/10"
                                        : isLocked
                                            ? "opacity-75 bg-muted/50"
                                            : ""
                                    }`}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        {isActive && (
                                            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Active</Badge>
                                        )}
                                        {isLocked && !isActive && (
                                            <Badge variant="outline" className="gap-1">
                                                <Lock className="h-3 w-3" /> {svc.tier_minimum}+
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="mt-4">{svc.name}</CardTitle>
                                    <CardDescription>{svc.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        ${svc.price_monthly}/mo calls
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    {isActive ? (
                                        <Button variant="outline" className="w-full">Configure</Button>
                                    ) : isLocked ? (
                                        <Button variant="ghost" disabled className="w-full">
                                            Upgrade to Unlock
                                        </Button>
                                    ) : (
                                        <Button asChild className="w-full">
                                            <Link href={route("alphasite.claim.complete", business.slug)}>
                                                Add Service
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AlphasiteCrmLayout>
    );
}
