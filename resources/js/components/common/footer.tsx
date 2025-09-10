import { Link } from "@inertiajs/react";
import {
    FacebookIcon,
    InstagramIcon,
    TwitterIcon,
    LinkedinIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Page: Global Footer
 * Type: SSR
 * Mockdata: OFF
 * Description: SEO-optimized footer with community links and Fibonacco ecosystem
 * Components: shadcn/ui Button, Inertia Link
 */

interface FooterLink {
    readonly label: string;
    readonly href: string;
}

interface FooterSection {
    readonly title: string;
    readonly links: readonly FooterLink[];
}

interface SocialLink {
    readonly name: string;
    readonly href: string;
    readonly icon: React.ComponentType<{ className?: string }>;
    readonly ariaLabel: string;
}

interface AppStoreLink {
    readonly name: string;
    readonly href: string;
    readonly icon: React.ReactNode;
}

// Footer configuration data
const FOOTER_SECTIONS: readonly FooterSection[] = [
    {
        title: "About Go Event City",
        links: [
            { label: "About Us", href: "/about" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Community Impact", href: "/community-impact" },
            { label: "Press & Media", href: "/press" },
            { label: "Careers", href: "/careers" },
            { label: "Contact Us", href: "/contact" },
        ],
    },
    {
        title: "For Event Goers",
        links: [
            { label: "Browse Events", href: "/events" },
            { label: "Buy Tickets", href: "/tickets" },
            { label: "Sell Tickets", href: "/tickets/sell" },
            { label: "Find Friends", href: "/find-friends" },
            { label: "Premium Membership", href: "/premium" },
            { label: "Mobile Apps", href: "/mobile-apps" },
        ],
    },
    {
        title: "For Businesses",
        links: [
            { label: "List Your Venue", href: "/venues/submit" },
            { label: "Performer Tools", href: "/performers/tools" },
            { label: "Event Organizer Hub", href: "/organizer-hub" },
            { label: "Advertising Solutions", href: "/advertise" },
            { label: "Booking Marketplace", href: "/book-it/venues" },
            { label: "Success Stories", href: "/success-stories" },
        ],
    },
    {
        title: "Fibonacco Ecosystem",
        links: [
            { label: "AlphaSite.ai", href: "/ecosystem/alphasite" },
            { label: "Day.News", href: "/ecosystem/daynews" },
            { label: "DowntownGuide", href: "/ecosystem/downtownguide" },
            { label: "Global Explorer", href: "/ecosystem/globalexplorer" },
            { label: "Partner With Us", href: "/partner-with-us" },
        ],
    },
] as const;

const SOCIAL_LINKS: readonly SocialLink[] = [
    {
        name: "Facebook",
        href: "https://facebook.com/goeventcity",
        icon: FacebookIcon,
        ariaLabel: "Visit our Facebook page",
    },
    {
        name: "Instagram",
        href: "https://instagram.com/goeventcity",
        icon: InstagramIcon,
        ariaLabel: "Visit our Instagram page",
    },
    {
        name: "Twitter",
        href: "https://twitter.com/goeventcity",
        icon: TwitterIcon,
        ariaLabel: "Visit our Twitter page",
    },
    {
        name: "LinkedIn",
        href: "https://linkedin.com/company/goeventcity",
        icon: LinkedinIcon,
        ariaLabel: "Visit our LinkedIn page",
    },
] as const;

const LEGAL_LINKS: readonly FooterLink[] = [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
] as const;

const APP_STORE_LINKS: readonly AppStoreLink[] = [
    {
        name: "iOS App Store",
        href: "/app-store",
        icon: (
            <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
        ),
    },
    {
        name: "Google Play",
        href: "/play-store",
        icon: (
            <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202c1.308.743 1.308 2.879 0 3.594zM3.603 1.368L1.61 2.897a1.076 1.076 0 0 0-.11.19L13.3 14.887l2.881-2.854L3.603 1.368zm9.237 10.762L1.897 21.191a1.255 1.255 0 0 0 .534.298L14.822 15.3l-2.02-2.001-.962-.969zM1.61 21.103l10.833-9.69L14.822 8.7 2.431 2.511a1.255 1.255 0 0 0-.534.298L1.61 21.103z" />
            </svg>
        ),
    },
] as const;

// Component definitions
function FooterSection({ section }: { readonly section: FooterSection }) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
                {section.title}
            </h3>
            <ul className="space-y-2">
                {section.links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 rounded"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SocialMediaLinks() {
    return (
        <div className="flex space-x-4 mb-4">
            {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                    <Button
                        key={social.name}
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                        asChild
                    >
                        <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.ariaLabel}
                        >
                            <Icon className="h-5 w-5" />
                        </a>
                    </Button>
                );
            })}
        </div>
    );
}

function LegalLinks() {
    return (
        <div className="flex flex-wrap space-x-4 mt-2">
            {LEGAL_LINKS.map((link, index) => (
                <span key={link.href} className="flex items-center">
                    <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 rounded"
                    >
                        {link.label}
                    </Link>
                    {index < LEGAL_LINKS.length - 1 && (
                        <span className="text-muted-foreground/50 ml-4">|</span>
                    )}
                </span>
            ))}
        </div>
    );
}

function AppStoreButtons() {
    return (
        <div className="flex flex-col sm:flex-row gap-2">
            {APP_STORE_LINKS.map((app) => (
                <Button
                    key={app.name}
                    variant="secondary"
                    size="sm"
                    className="text-xs transition-colors duration-200"
                    asChild
                >
                    <Link href={app.href} className="flex items-center">
                        {app.icon}
                        <span className="ml-1">{app.name}</span>
                    </Link>
                </Button>
            ))}
        </div>
    );
}

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-background border-t" role="contentinfo">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FOOTER_SECTIONS.map((section) => (
                        <FooterSection key={section.title} section={section} />
                    ))}
                </div>

                {/* Footer bottom section */}
                <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
                        {/* Copyright and legal links */}
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">
                                © {currentYear} Go Event City | Part of
                                Fibonacco
                            </p>
                            <LegalLinks />
                        </div>

                        {/* Social media and app downloads */}
                        <div className="flex flex-col items-start lg:items-end">
                            <SocialMediaLinks />
                            <AppStoreButtons />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
