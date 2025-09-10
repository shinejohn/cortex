import { useEffect, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";

import {
    Bell,
    ChevronDown,
    LogOut,
    MapPin,
    Menu,
    MessageSquare,
    Plus,
    Search,
    Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { UserMenuContent } from "../user-menu-content";
import { BreadcrumbItem, type Auth } from "@/types";
import AppLogo from "../app-logo";
import AppLogoIcon from "../app-logo-icon";
import BottomNavigation from "./bottom-navigation";

// Re-import navigation items for mobile menu
import {
    BookOpen,
    Calendar,
    Megaphone,
    Music,
    ShoppingBag,
    Ticket,
} from "lucide-react";

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

const MOBILE_NAV_ITEMS: NavItem[] = [
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
        href: "/hubs",
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
        href: "/tickets/buy",
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
        href: "/gear",
        icon: <ShoppingBag className="size-4" />,
    },
    {
        title: "Advertise",
        href: "/advertise",
        icon: <Megaphone className="size-4" />,
    },
];

interface Location {
    readonly name: string;
    readonly eventCount: number;
}

interface Notifications {
    readonly count: number;
    readonly hasUnread: boolean;
}

interface HeaderProps {
    readonly auth: Auth;
    readonly breadcrumbs?: BreadcrumbItem[];
    readonly location?: Location;
    readonly notifications?: Notifications;
    readonly unreadMessages?: number;
}

// Constants
const DEFAULT_LOCATION: Location = {
    name: "Clearwater, FL",
    eventCount: 427,
};

const DEFAULT_NOTIFICATIONS: Notifications = {
    count: 0,
    hasUnread: false,
};

// Utilities
const navigate = (href: string): void => {
    try {
        router.visit(href);
    } catch (error) {
        console.error("Navigation error:", error);
        window.location.href = href;
    }
};

const getUserInitials = (name: string): string => {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

interface LocationSelectorProps {
    readonly location: Location;
}

interface SearchBarProps {
    readonly className?: string;
}

interface NotificationBellProps {
    readonly notifications: Notifications;
}

interface MessagesButtonProps {
    readonly unreadCount?: number;
}

interface MobileNavigationProps {
    readonly auth: Auth;
    readonly location: Location;
    readonly notifications: Notifications;
    readonly unreadMessages?: number;
}

function LocationSelector({ location }: LocationSelectorProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex w-full items-center justify-between gap-2 text-sm"
                >
                    <div className="flex items-center gap-2">
                        <MapPin className="size-4" />
                        <div className="text-left">
                            <div className="font-medium">{location.name}</div>
                            <div className="text-xs text-muted-foreground">
                                {location.eventCount} events
                            </div>
                        </div>
                    </div>
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Change Location</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/location/change")}>
                    <MapPin className="mr-2 size-4" />
                    Change Location
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function SearchBar({ className }: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search events, venues, performers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10"
            />
        </form>
    );
}

function NotificationBell({ notifications }: NotificationBellProps) {
    const hasNotifications = notifications.count > 0;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/notifications")}
            className="relative"
        >
            <Bell className="size-5" />
            {hasNotifications && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] px-1 text-xs">
                    {notifications.count}
                </Badge>
            )}
        </Button>
    );
}

function MessagesButton({ unreadCount = 0 }: MessagesButtonProps) {
    const hasUnread = unreadCount > 0;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/messages")}
            className="relative"
        >
            <MessageSquare className="size-5" />
            {hasUnread && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] px-1 text-xs">
                    {unreadCount}
                </Badge>
            )}
        </Button>
    );
}

function MobileNavigation({
    auth,
    location,
    notifications,
    unreadMessages = 0,
}: MobileNavigationProps) {
    const { user } = auth.user;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
                <SheetHeader>
                    <SheetTitle>
                        <Link href={route("home")}>
                            <AppLogo />
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-4">
                    {/* Location */}
                    <div className="border-b pb-4">
                        <div className="w-full">
                            <LocationSelector location={location} />
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-2">
                        {MOBILE_NAV_ITEMS.map((item) => (
                            <Button
                                key={item.href}
                                variant="ghost"
                                onClick={() => navigate(item.href)}
                                className="w-full justify-start gap-3"
                            >
                                {item.icon}
                                <span>{item.title}</span>
                                {item.badge && (
                                    <Badge
                                        variant={item.badge.variant}
                                        className="ml-auto"
                                    >
                                        {item.badge.text}
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </nav>

                    {/* User Actions */}
                    {auth.user && (
                        <div className="border-t pt-4 space-y-2">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/events/create")}
                                className="w-full justify-start gap-3"
                            >
                                <Plus className="size-4" />
                                Create Event
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/notifications")}
                                className="w-full justify-start gap-3"
                            >
                                <Bell className="size-4" />
                                Notifications
                                {notifications.count > 0 && (
                                    <Badge className="ml-auto">
                                        {notifications.count}
                                    </Badge>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/messages")}
                                className="w-full justify-start gap-3"
                            >
                                <MessageSquare className="size-4" />
                                Messages
                                {unreadMessages > 0 && (
                                    <Badge className="ml-auto">
                                        {unreadMessages}
                                    </Badge>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Auth Actions */}
                    <div className="border-t pt-4">
                        {auth.user ? (
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/logout")}
                                className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                            >
                                <LogOut className="size-4" />
                                Log out
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <Button
                                    onClick={() => navigate("/signup")}
                                    className="w-full"
                                >
                                    Sign Up
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/login")}
                                    className="w-full"
                                >
                                    Log In
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Main Header Component
export function Header({
    auth,
    breadcrumbs = [],
    location = DEFAULT_LOCATION,
    notifications = DEFAULT_NOTIFICATIONS,
    unreadMessages = 0,
}: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user } = auth;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
                isScrolled && "shadow-sm"
            )}
        >
            {/* Desktop Header */}
            <div className="hidden lg:block">
                {/* Top Row - Logo, Location, and User Actions */}
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Section */}
                        <div className="flex items-center gap-6">
                            <Link href={route("home")}>
                                <AppLogo />
                            </Link>
                            <LocationSelector location={location} />
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            <SearchBar className="w-64" />

                            {user ? (
                                <>
                                    <Button
                                        variant={"secondary"}
                                        onClick={() =>
                                            navigate("/events/create")
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="size-4" />
                                        Create Event
                                    </Button>
                                    <NotificationBell
                                        notifications={notifications}
                                    />
                                    <MessagesButton
                                        unreadCount={unreadMessages}
                                    />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="relative"
                                            >
                                                <Avatar className="size-8">
                                                    <AvatarImage
                                                        src={user.avatar}
                                                        alt={user.name}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {user.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-56"
                                        >
                                            <UserMenuContent user={user} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate("/login")}
                                    >
                                        Log In
                                    </Button>
                                    <Button onClick={() => navigate("/signup")}>
                                        Sign Up
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Navigation */}
                <BottomNavigation />
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <MobileNavigation
                                auth={auth}
                                location={location}
                                notifications={notifications}
                                unreadMessages={unreadMessages}
                            />
                            <Link href={route("home")}>
                                <AppLogoIcon className="text-lg" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="size-10 rounded-full p-1"
                                        >
                                            <Avatar className="size-8 overflow-hidden rounded-full">
                                                <AvatarImage
                                                    src={auth.user.avatar}
                                                    alt={auth.user.name}
                                                />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getUserInitials(
                                                        auth.user.name
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                    >
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => navigate("/login")}
                                >
                                    Login
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="border-t px-4 py-3">
                    <SearchBar />
                </div>
            </div>
        </header>
    );
}

export default Header;
