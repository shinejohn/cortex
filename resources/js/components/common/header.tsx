import { Link, usePage } from "@inertiajs/react";
// Re-import navigation items for mobile menu
import {
    Bell,
    BookOpen,
    Calendar,
    CalendarDays,
    ChevronDown,
    Loader2,
    LogOut,
    MapPin,
    Megaphone,
    Menu,
    MessageSquare,
    Music,
    Plus,
    Search,
    ShoppingBag,
    Ticket,
    Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { route } from "ziggy-js";
import LocationPrompt from "@/components/event-city/location-prompt";
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
import { LocationProvider, useLocation } from "@/contexts/location-context";
import { cn } from "@/lib/utils";
import { type Auth, BreadcrumbItem, SharedData } from "@/types";
import { type NotificationData, type NotificationSummary } from "@/types/notifications";
import AppLogo from "../app-logo";
import AppLogoIcon from "../app-logo-icon";
import { CartDropdown } from "../CartDropdown";
import { NotificationDropdown } from "../NotificationDropdown";
import { UserMenuContent } from "../user-menu-content";
import BottomNavigation from "./bottom-navigation";

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

const getMobileNavItems = (): NavItem[] => [
    {
        title: "Events",
        href: route("events") as any,
        icon: <Calendar className="size-4" />,
    },
    {
        title: "Venues",
        href: route("venues") as any,
        icon: <MapPin className="size-4" />,
    },
    {
        title: "Performers",
        href: route("performers") as any,
        icon: <Music className="size-4" />,
    },
    {
        title: "Communities",
        href: route("community.index") as any,
        icon: <Users className="size-4" />,
        highlight: true,
    },
    {
        title: "Calendars",
        href: route("calendars.index") as any,
        icon: <Calendar className="size-4" />,
    },
    {
        title: "Social",
        href: route("social.index") as any,
        icon: <Users className="size-4" />,
        badge: { text: "NEW", variant: "secondary" },
    },
    {
        title: "Tickets",
        href: route("tickets.index") as any,
        icon: <Ticket className="size-4" />,
    },
    {
        title: "Book It",
        href: route("bookings.index") as any,
        icon: <BookOpen className="size-4" />,
        badge: { text: "NEW", variant: "secondary" },
    },
    {
        title: "Shop",
        href: route("shop.discover") as any,
        icon: <ShoppingBag className="size-4" />,
        badge: { text: "NEW", variant: "secondary" },
    },
    {
        title: "Advertise",
        href: route("advertise") as any,
        icon: <Megaphone className="size-4" />,
    },
];

interface HeaderProps {
    readonly auth: Auth;
    readonly breadcrumbs?: BreadcrumbItem[];
}

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

interface SearchBarProps {
    readonly className?: string;
}

interface MobileNavigationProps {
    readonly auth: Auth;
}

interface Region {
    id: string;
    name: string;
    slug: string;
    type: string;
    full_name: string;
}

function LocationSelector() {
    const { currentRegion, searchRegions, setRegion, detectFromBrowser, isLoading } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Region[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setQuery("");
                setResults([]);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            const regions = await searchRegions(query);
            setResults(regions);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, searchRegions]);

    const handleSelect = async (region: Region) => {
        await setRegion(region.id);
        setQuery("");
        setResults([]);
        setIsOpen(false);
    };

    const handleUseMyLocation = async () => {
        setIsDetecting(true);
        try {
            await detectFromBrowser();
            setQuery("");
            setResults([]);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to detect location:", error);
            alert("Unable to detect your location. Please try manually searching.");
        } finally {
            setIsDetecting(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button variant="ghost" className="flex w-full items-center justify-between gap-2 text-sm" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <div className="text-left">
                        <div className="font-medium">{currentRegion?.name || "Select Location"}</div>
                        {currentRegion?.type && <div className="text-xs capitalize text-muted-foreground">{currentRegion.type}</div>}
                    </div>
                </div>
                <ChevronDown className="size-4" />
            </Button>

            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by city or zip code..."
                                className="w-full pl-9"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleUseMyLocation}
                            disabled={isDetecting || isLoading}
                            className="w-full justify-start gap-2 px-4 py-3"
                        >
                            {isDetecting ? <Loader2 className="size-4 animate-spin text-primary" /> : <MapPin className="size-4 text-primary" />}
                            <span className="font-medium">{isDetecting ? "Detecting..." : "Use my current location"}</span>
                        </Button>
                    </div>

                    {results.length > 0 && (
                        <div className="max-h-60 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                            {results.map((region) => (
                                <Button
                                    key={region.id}
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleSelect(region)}
                                    disabled={isLoading}
                                    className="w-full flex-col items-start px-4 py-3 h-auto"
                                >
                                    <span className="font-medium">{region.name}</span>
                                    <span className="text-xs text-muted-foreground">{region.full_name}</span>
                                </Button>
                            ))}
                        </div>
                    )}

                    {query.length >= 2 && results.length === 0 && (
                        <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            No locations found for "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
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

function MessagesButton({ notifications }: { notifications?: NotificationSummary }) {
    const messageNotifications = notifications?.notifications?.filter((n: NotificationData) => n.type === "message") || [];
    const unreadMessageCount = messageNotifications.filter((n: NotificationData) => !n.read).length;

    return (
        <NotificationDropdown
            initialNotifications={messageNotifications}
            initialUnreadCount={unreadMessageCount}
            filterType="message"
            icon={<MessageSquare className="size-5" />}
            title="Messages"
            viewAllRoute={route("social.messages.index") as any}
            emptyMessage="No new messages"
        />
    );
}

function NotificationsButton({ notifications }: { notifications?: NotificationSummary }) {
    return (
        <NotificationDropdown
            initialNotifications={notifications?.notifications}
            initialUnreadCount={notifications?.unread_count}
            filterType="all"
            icon={<Bell className="size-5" />}
            title="Notifications"
            viewAllRoute={route("notifications.index") as any}
            emptyMessage="No new notifications"
        />
    );
}

function MobileNavigation({ auth }: MobileNavigationProps) {
    const user = auth.user;
    const { props } = usePage<SharedData>();
    const sharedNotifications = props.notifications;
    const mobileNavItems = getMobileNavItems();

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
                        <Link href={route("home") as any}>
                            <AppLogo />
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-4">
                    {/* Location */}
                    <div className="border-b pb-4">
                        <div className="w-full">
                            <LocationSelector />
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-2">
                        {mobileNavItems.map((item) => (
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
                    {auth?.user && (
                        <div className="border-t pt-4 space-y-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-start gap-3">
                                        <Plus className="size-4" />
                                        Create
                                        <ChevronDown className="ml-auto size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    <DropdownMenuLabel>Create New</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate(route("events.create") as string)}>
                                        <Calendar className="mr-2 size-4" />
                                        Event
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(route("venues.create") as string)}>
                                        <MapPin className="mr-2 size-4" />
                                        Venue
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(route("performers.create") as string)}>
                                        <Music className="mr-2 size-4" />
                                        Performer
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(route("calendars.create") as string)}>
                                        <CalendarDays className="mr-2 size-4" />
                                        Calendar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="ghost" onClick={() => navigate(route("notifications.index") as any)} className="w-full justify-start gap-3">
                                <Bell className="size-4" />
                                Notifications
                                {(sharedNotifications?.unread_count || 0) > 0 && (
                                    <Badge className="ml-auto">{sharedNotifications?.unread_count}</Badge>
                                )}
                            </Button>
                            <Button variant="ghost" onClick={() => navigate(route("social.messages.index") as any)} className="w-full justify-start gap-3">
                                <MessageSquare className="size-4" />
                                Messages
                                {(sharedNotifications?.notifications?.filter((n) => n.type === "message" && !n.read).length || 0) > 0 && (
                                    <Badge className="ml-auto">
                                        {sharedNotifications?.notifications?.filter((n) => n.type === "message" && !n.read).length}
                                    </Badge>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Auth Actions */}
                    <div className="border-t pt-4">
                        {auth?.user ? (
                            <Button
                                variant="ghost"
                                onClick={() => navigate(route("logout") as any)}
                                className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                            >
                                <LogOut className="size-4" />
                                Log out
                            </Button>
                        ) : (
                            <div className="space-y-2 px-2">
                                <Button onClick={() => navigate(route("register") as any)} className="w-full">
                                    Sign Up
                                </Button>
                                <Button variant="outline" onClick={() => navigate(route("login") as any)} className="w-full">
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

// Inner Header Component (requires LocationProvider)
function HeaderContent({ auth }: HeaderProps) {
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
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Section */}
                        <div className="flex items-center gap-6">
                            <Link href={route("home") as any}>
                                <AppLogo />
                            </Link>
                            <LocationSelector />
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            <SearchBar className="w-64" />

                            {auth?.user ? (
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={"secondary"} className="flex items-center gap-2">
                                                <Plus className="size-4" />
                                                Create
                                                <ChevronDown className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuLabel>Create New</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => navigate(route("events.create") as string)}>
                                                <Calendar className="mr-2 size-4" />
                                                Event
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(route("venues.create") as string)}>
                                                <MapPin className="mr-2 size-4" />
                                                Venue
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(route("performers.create") as string)}>
                                                <Music className="mr-2 size-4" />
                                                Performer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(route("calendars.create") as string)}>
                                                <CalendarDays className="mr-2 size-4" />
                                                Calendar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <CartDropdown />
                                    <NotificationDropdown
                                        initialNotifications={sharedNotifications?.notifications}
                                        initialUnreadCount={sharedNotifications?.unread_count}
                                    />
                                    <MessagesButton notifications={sharedNotifications} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="relative">
                                                <Avatar className="size-8">
                                                    <AvatarImage src={auth.user?.avatar} alt={auth.user?.name || 'User'} />
                                                    <AvatarFallback className="text-xs">{auth.user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <UserMenuContent user={auth.user} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <CartDropdown />
                                    <Link href={route("login") as string}>
                                        <Button variant="ghost">Log In</Button>
                                    </Link>
                                    <Link href={route("register") as string}>
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
                            <MobileNavigation auth={auth} />
                            <Link href={route("home") as string}>
                                <AppLogoIcon className="text-lg" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            {auth?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="size-10 rounded-full p-1">
                                            <Avatar className="size-8 overflow-hidden rounded-full">
                                                <AvatarImage src={auth.user?.avatar} alt={auth.user?.name || 'User'} />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {auth.user?.name ? getUserInitials(auth.user.name) : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button size="sm" onClick={() => navigate(route("login") as any)}>
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

// Main Header Component - wraps with LocationProvider
export function Header({ auth }: HeaderProps) {
    return (
        <LocationProvider>
            <HeaderContent auth={auth} />
        </LocationProvider>
    );
}

export default Header;
