import { Head, Link, usePage } from "@inertiajs/react";
import { ReactNode } from "react";
import { route } from "ziggy-js";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    HelpCircle,
    ClipboardList,
    Sparkles,
    Command,
    ExternalLink,
    Tag,
    UserCircle
} from "lucide-react";

interface CrmLayoutProps {
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
    children: ReactNode;
    title?: string;
}

const navItems = [
    { href: "alphasite.crm.command-center", label: "Command Center", icon: Command },
    { href: "alphasite.crm.dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "alphasite.crm.profile", label: "Business Profile", icon: UserCircle },
    { href: "alphasite.crm.customers", label: "Customers", icon: Users },
    { href: "alphasite.crm.interactions", label: "Interactions", icon: MessageSquare },
    { href: "alphasite.crm.faqs", label: "FAQs", icon: HelpCircle },
    { href: "alphasite.crm.surveys", label: "Surveys", icon: ClipboardList },
    { href: "alphasite.crm.coupon-claims", label: "Coupon Claims", icon: Tag },
    { href: "alphasite.crm.ai", label: "AI Services", icon: Sparkles },
];

export default function AlphasiteCrmLayout({
    business,
    subscription,
    children,
    title,
}: CrmLayoutProps) {
    const { url } = usePage<{ url: string }>();
    const publicUrl = business.alphasite_subdomain
        ? `https://${business.alphasite_subdomain}.alphasite.com`
        : route("alphasite.business.show", business.slug);

    const trialDaysLeft =
        subscription?.tier === "trial" && subscription?.trial_expires_at
            ? Math.max(
                0,
                Math.ceil(
                    (new Date(subscription.trial_expires_at).getTime() -
                        Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
            )
            : null;

    return (
        <>
            <Head title={title ? `${title} | ${business.name}` : business.name} />
            <div className="min-h-screen bg-muted/30">
                <div className="flex">
                    {/* Sidebar */}
                    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
                        <div className="p-6 border-b border-border">
                            <h1 className="font-display font-black tracking-tight text-xl text-foreground truncate">
                                {business.name}
                            </h1>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                                {business.city}
                                {business.state ? `, ${business.state}` : ""}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-black ${subscription?.tier === "trial"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : subscription?.tier === "basic"
                                                ? "bg-muted text-muted-foreground"
                                                : "bg-emerald-100 text-emerald-700"
                                        }`}
                                >
                                    {subscription?.tier === "trial"
                                        ? `Trial${trialDaysLeft !== null ? ` · ${trialDaysLeft}d left` : ""}`
                                        : subscription?.tier ?? "Basic"}
                                </span>
                            </div>
                        </div>
                        <nav className="flex-1 p-3 space-y-1">
                            {navItems.map((item) => {
                                const href = route(item.href);
                                const isActive =
                                    url === href ||
                                    (href !== "/crm/dashboard" &&
                                        url.startsWith(href));
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${isActive
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        <Icon className="size-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t border-border">
                            <a
                                href={publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <ExternalLink className="size-4" />
                                View public page
                            </a>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 overflow-auto">
                        {subscription?.tier === "trial" && trialDaysLeft !== null && trialDaysLeft <= 14 && (
                            <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-yellow-800">
                                        Your trial expires in {trialDaysLeft} day
                                        {trialDaysLeft !== 1 ? "s" : ""}.
                                        Subscribe to keep your AI features.
                                    </p>
                                    <Link
                                        href={route("alphasite.crm.ai")}
                                        className="text-sm font-medium text-yellow-900 hover:underline"
                                    >
                                        Subscribe now
                                    </Link>
                                </div>
                            </div>
                        )}
                        <div className="p-8">{children}</div>
                    </main>
                </div>
            </div>
        </>
    );
}
