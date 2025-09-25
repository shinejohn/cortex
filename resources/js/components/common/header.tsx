import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { route } from "ziggy-js";

import { Bell, ChevronDown, LogOut, MapPin, Menu, MessageSquare, Plus, Search, Users } from "lucide-react";

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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { type Auth, BreadcrumbItem, SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { NotificationDropdown } from "../NotificationDropdown";
import AppLogo from "../app-logo";
import AppLogoIcon from "../app-logo-icon";
import { UserMenuContent } from "../user-menu-content";
import BottomNavigation from "./bottom-navigation";

// Re-import navigation items for mobile menu
import { BookOpen, Calendar, Megaphone, Music, ShoppingBag, Ticket } from "lucide-react";

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
        href: route("events"),
        icon: <Calendar className="size-4" />,
    },
    {
        title: "Venues",
        href: "/venues",
        icon: <MapPin className="size-4" />,
    },
    {
        title: "Performers",
        href: route("performers"),
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


interface HeaderProps {
    readonly auth: Auth;
    readonly breadcrumbs?: BreadcrumbItem[];
    readonly location?: Location;
}

// Constants
const DEFAULT_LOCATION: Location = {
    name: "Clearwater, FL",
    eventCount: 427,
};

// Utilities
const navigate = (href: string): void => {
    try {
        window.location.href = href;
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


interface MobileNavigationProps {
    readonly auth: Auth;
    readonly location: Location;
}

function LocationSelector({ location }: LocationSelectorProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex w-full items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <MapPin className="size-4" />
                        <div className="text-left">
                            <div className="font-medium">{location.name}</div>
                            <div className="text-xs text-muted-foreground">{location.eventCount} events</div>
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

function MessagesButton({ notifications }: { notifications?: any }) {
    const messageNotifications = notifications?.notifications?.filter((n: any) => n.type === 'message') || [];
    const unreadMessageCount = messageNotifications.filter((n: any) => !n.read).length;

    return (
        <NotificationDropdown
            initialNotifications={messageNotifications}
            initialUnreadCount={unreadMessageCount}
            filterType="message"
            icon={<MessageSquare className="size-5" />}
            title="Messages"
            viewAllRoute="/social/messages"
            emptyMessage="No new messages"
        />
    );
}

function MobileNavigation({ auth, location }: MobileNavigationProps) {
    const user = auth.user;
    const { props } = usePage<SharedData>();
    const sharedNotifications = props.notifications;

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
                            <Button key={item.href} variant="ghost" onClick={() => navigate(item.href)} className="w-full justify-start gap-3">
                                {item.icon}
                                <span>{item.title}</span>
                                {item.badge && (
                                    <Badge variant={item.badge.variant} className="ml-auto">
                                        {item.badge.text}
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </nav>

                    {/* User Actions */}
                    {user && (
                        <div className="border-t pt-4 space-y-2">
                            <Button variant="ghost" onClick={() => navigate("/events/create")} className="w-full justify-start gap-3">
                                <Plus className="size-4" />
                                Create Event
                            </Button>
                            <Button variant="ghost" onClick={() => navigate("/notifications")} className="w-full justify-start gap-3">
                                <Bell className="size-4" />
                                Notifications
                                {(sharedNotifications?.unread_count || 0) > 0 && <Badge className="ml-auto">{sharedNotifications?.unread_count}</Badge>}
                            </Button>
                            <Button variant="ghost" onClick={() => navigate("/social/messages")} className="w-full justify-start gap-3">
                                <MessageSquare className="size-4" />
                                Messages
                                {(sharedNotifications?.notifications?.filter(n => n.type === 'message' && !n.read).length || 0) > 0 && (
                                    <Badge className="ml-auto">
                                        {sharedNotifications?.notifications?.filter(n => n.type === 'message' && !n.read).length}
                                    </Badge>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Auth Actions */}
                    <div className="border-t pt-4">
                        {user ? (
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/logout")}
                                className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                            >
                                <LogOut className="size-4" />
                                Log out
                            </Button>
                        ) : (
                            <div className="space-y-2 px-2">
                                <Button onClick={() => navigate("/signup")} className="w-full">
                                    Sign Up
                                </Button>
                                <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
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
export function Header({ auth, location = DEFAULT_LOCATION }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user } = auth;
    const { props } = usePage<SharedData>();
    const sharedNotifications = props.notifications;

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
                isScrolled && "shadow-sm",
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
                                    <Button variant={"secondary"} onClick={() => navigate("/events/create")} className="flex items-center gap-2">
                                        <Plus className="size-4" />
                                        Create Event
                                    </Button>
                                    <NotificationDropdown
                                        initialNotifications={sharedNotifications?.notifications}
                                        initialUnreadCount={sharedNotifications?.unread_count}
                                    />
                                    <MessagesButton notifications={sharedNotifications} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="relative">
                                                <Avatar className="size-8">
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                    <AvatarFallback className="text-xs">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <UserMenuContent user={user} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link href={route("login")}>
                                        <Button variant="ghost">Log In</Button>
                                    </Link>
                                    <Link href={route("register")}>
                                        <Button>Sign Up</Button>
                                    </Link>
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
                            <MobileNavigation auth={auth} location={location} />
                            <Link href={route("home")}>
                                <AppLogoIcon className="text-lg" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="size-10 rounded-full p-1">
                                            <Avatar className="size-8 overflow-hidden rounded-full">
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getUserInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end">
                                        <UserMenuContent user={user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button size="sm" onClick={() => navigate("/login")}>
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
