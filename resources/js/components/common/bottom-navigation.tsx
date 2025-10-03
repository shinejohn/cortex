import { BookOpen, Calendar, MapPin, Megaphone, Music, ShoppingBag, Ticket, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface NavItem {
    readonly title: string;
    readonly href: string;
    readonly icon?: React.ReactNode;
    readonly badge?: {
        readonly text: string;
        readonly variant: BadgeVariant;
    };
    readonly highlight?: boolean;
}

interface NavItemProps {
    readonly item: NavItem;
}

interface BottomNavigationProps {
    readonly className?: string;
}

// Navigation Items Configuration
const NAVIGATION_ITEMS: NavItem[] = [
    {
        title: "Events",
        href: "/events",
        icon: <Calendar className="size-4" />,
    },
    {
        title: "Venues",
        href: "/venues",
        icon: <MapPin className="size-4" />,
    },
    {
        title: "Performers",
        href: "/performers",
        icon: <Music className="size-4" />,
    },
    {
        title: "Communities",
        href: "/community",
        icon: <Users className="size-4" />,
        highlight: true,
    },
    {
        title: "Calendars",
        href: "/calendars/marketplace",
        icon: <Calendar className="size-4" />,
    },
    {
        title: "Social",
        href: "/social",
        icon: <Users className="size-4" />,
        badge: { text: "NEW", variant: "secondary" },
    },
    {
        title: "Tickets",
        href: "/tickets",
        icon: <Ticket className="size-4" />,
    },
    {
        title: "Book It",
        href: "/book",
        icon: <BookOpen className="size-4" />,
        badge: { text: "NEW", variant: "secondary" },
    },
    {
        title: "Shop",
        href: "/shop",
        icon: <ShoppingBag className="size-4" />,
        badge: { text: "NEW", variant: "secondary" },
    },
    {
        title: "Advertise",
        href: "/advertise",
        icon: <Megaphone className="size-4" />,
    },
];

// Utilities
const navigate = (href: string): void => {
    try {
        window.location.href = href;
    } catch (error) {
        console.error("Navigation error:", error);
        window.location.href = href;
    }
};

// Components
function NavItem({ item }: NavItemProps) {
    return (
        <Button
            variant="ghost"
            onClick={() => navigate(item.href)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-muted/80"
        >
            {item.icon}
            <span className="hidden sm:inline">{item.title}</span>
            {item.badge && (
                <Badge variant={item.badge.variant} className="ml-1 text-xs">
                    {item.badge.text}
                </Badge>
            )}
        </Button>
    );
}

export function BottomNavigation({ className }: BottomNavigationProps) {
    return (
        <div className={cn("border-t bg-gradient-to-r from-background/50 via-background to-background/50", className)}>
            <div className="container mx-auto px-4">
                <nav className="flex flex-wrap items-center justify-center gap-2 py-3">
                    {NAVIGATION_ITEMS.map((item) => (
                        <NavItem key={item.href} item={item} />
                    ))}
                </nav>
            </div>
        </div>
    );
}

export default BottomNavigation;
