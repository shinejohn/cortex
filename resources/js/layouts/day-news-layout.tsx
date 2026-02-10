import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import LocationPrompt from "@/components/day-news/location-prompt";
import { LocationProvider } from "@/contexts/location-context";
import { type Auth } from "@/types";
import { Link } from "@inertiajs/react";
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Rss,
    Twitter,
    Youtube,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { usePage, useForm } from "@inertiajs/react";

interface DayNewsLayoutProps {
    children: ReactNode;
    auth?: Auth;
    seo: {
        title: string;
        description?: string;
        image?: string | null;
        url?: string;
        type?: "website" | "article";
        [key: string]: any;
    };
    showLocationPrompt?: boolean;
    containerClassName?: string;
}

/* -------------------------------------------------------------------
   Footer data configuration
   ------------------------------------------------------------------- */

interface FooterLink {
    readonly label: string;
    readonly href: string;
}

interface FooterSection {
    readonly title: string;
    readonly links: readonly FooterLink[];
}

const SECTIONS_LINKS: readonly FooterSection[] = [
    {
        title: "Sections",
        links: [
            { label: "News", href: "/" },
            { label: "Business", href: "/business" },
            { label: "Events", href: "/events" },
            { label: "Classifieds", href: "/classifieds" },
            { label: "Coupons", href: "/coupons" },
            { label: "Legal Notices", href: "/legal-notices" },
            { label: "Photos", href: "/photos" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Careers", href: "/careers" },
            { label: "Advertise", href: "/advertise" },
            { label: "Ethics Policy", href: "/ethics-policy" },
            { label: "Subscription Options", href: "/subscription-options" },
            { label: "Newsroom", href: "/newsroom" },
        ],
    },
] as const;

const LEGAL_LINKS: readonly FooterLink[] = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "Accessibility", href: "/accessibility" },
    { label: "Do Not Sell My Information", href: "/do-not-sell-my-information" },
] as const;

interface SocialLink {
    readonly name: string;
    readonly href: string;
    readonly icon: React.ComponentType<{ className?: string }>;
    readonly ariaLabel: string;
}

const SOCIAL_LINKS: readonly SocialLink[] = [
    { name: "Facebook", href: "https://facebook.com/daynews", icon: Facebook, ariaLabel: "Facebook" },
    { name: "Twitter", href: "https://twitter.com/daynews", icon: Twitter, ariaLabel: "Twitter" },
    { name: "Instagram", href: "https://instagram.com/daynews", icon: Instagram, ariaLabel: "Instagram" },
    { name: "YouTube", href: "https://youtube.com/daynews", icon: Youtube, ariaLabel: "YouTube" },
    { name: "RSS", href: "/rss", icon: Rss, ariaLabel: "RSS Feed" },
] as const;

/* -------------------------------------------------------------------
   Day News Footer (spec-ui design: 4-col grid, newsletter, bottom bar)
   ------------------------------------------------------------------- */

function DayNewsFooter() {
    const currentYear = new Date().getFullYear();
    const { siteLocation } = usePage<{ siteLocation?: { cityName?: string; stateName?: string; address?: string } }>().props;
    const cityName = siteLocation?.cityName;
    const stateName = siteLocation?.stateName;
    const address = siteLocation?.address;

    const newsletterForm = useForm({ email: "" });
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        newsletterForm.post("/newsletter/subscribe", {
            preserveScroll: true,
            onSuccess: () => {
                setSubscribed(true);
                newsletterForm.reset();
            },
        });
    };

    return (
        <footer className="border-t bg-background text-foreground" role="contentinfo">
            {/* Main footer content */}
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Column 1: About */}
                    <div>
                        <h3 className="font-display text-xl font-bold tracking-tight">
                            {cityName ? `${cityName} Day News` : "Day News"}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {stateName ? `${stateName}'s Trusted News Source` : "Your Trusted Local News Source"}
                        </p>

                        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                            <div className="flex items-start">
                                <MapPin className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
                                <span>{address || "Fibonacco, Inc."}</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="mr-2 h-4 w-4 shrink-0" />
                                <a
                                    href="tel:+17275551234"
                                    className="transition-colors hover:text-foreground"
                                >
                                    (727) 555-1234
                                </a>
                            </div>
                            <div className="flex items-center">
                                <Mail className="mr-2 h-4 w-4 shrink-0" />
                                <a
                                    href="mailto:contact@day.news"
                                    className="transition-colors hover:text-foreground"
                                >
                                    contact@day.news
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 & 3: Sections + Company */}
                    {SECTIONS_LINKS.map((section) => (
                        <div key={section.title}>
                            <h4 className="font-semibold">{section.title}</h4>
                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Column 4: Connect & Newsletter */}
                    <div>
                        <h4 className="font-semibold">Connect</h4>
                        <div className="mt-4 flex gap-3">
                            {SOCIAL_LINKS.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                                        aria-label={social.ariaLabel}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </a>
                                );
                            })}
                        </div>

                        <h4 className="mt-6 font-semibold">Newsletter</h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Stay updated with local news, events, and more.
                        </p>
                        {subscribed ? (
                            <p className="mt-3 text-sm font-medium text-green-600">
                                Thank you for subscribing!
                            </p>
                        ) : (
                            <form onSubmit={handleSubscribe} className="mt-3 flex">
                                <input
                                    type="email"
                                    value={newsletterForm.data.email}
                                    onChange={(e) => newsletterForm.setData("email", e.target.value)}
                                    placeholder="Your email"
                                    required
                                    className="flex-1 rounded-l-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    type="submit"
                                    disabled={newsletterForm.processing}
                                    className="rounded-r-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {newsletterForm.processing ? "..." : "Subscribe"}
                                </button>
                            </form>
                        )}
                        {newsletterForm.errors.email && (
                            <p className="mt-1 text-xs text-red-500">{newsletterForm.errors.email}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom footer bar */}
            <div className="border-t border-border py-6">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <p className="mb-4 text-sm text-muted-foreground md:mb-0">
                            &copy; {currentYear} Fibonacco, Inc. All Rights Reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            {LEGAL_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* -------------------------------------------------------------------
   Day News Layout
   ------------------------------------------------------------------- */

export default function DayNewsLayout({
    children,
    auth,
    seo,
    showLocationPrompt = false,
    containerClassName = "container mx-auto px-4 py-8 sm:px-6 lg:px-8",
}: DayNewsLayoutProps) {
    return (
        <LocationProvider>
            <div className="flex min-h-screen flex-col bg-background">
                <SEO
                    type={seo.type || "website"}
                    site="day-news"
                    data={{
                        ...seo,
                        description: seo.description || "",
                        image: seo.image || undefined,
                        url: seo.url || "",
                    }}
                />
                <DayNewsHeader auth={auth} />
                {showLocationPrompt && <LocationPrompt />}
                <main className={`flex-1 ${containerClassName}`}>
                    {children}
                </main>
                <DayNewsFooter />
            </div>
        </LocationProvider>
    );
}
