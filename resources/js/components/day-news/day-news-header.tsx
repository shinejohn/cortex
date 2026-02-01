import { Link } from "@inertiajs/react";
import { Bell, Menu, User, Search } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Auth } from "@/types";
import { DayNewsUserMenuContent } from "./day-news-user-menu-content";
import LocationSelector from "./location-selector";

interface DayNewsHeaderProps {
    auth?: Auth;
}

const navigationTabs = [
    { title: "News", href: "/news" },
    { title: "Announcements", href: "/announcements" },
    { title: "Events", href: "/events" },
    { title: "Legal Notices", href: "/legal-notices" },
    { title: "Business", href: "/business" },
    { title: "Classifieds", href: "/classifieds" },
    { title: "Coupons", href: "/coupons" },
    { title: "Photos", href: "/photos" },
    { title: "Go Local Voices", href: "/local-voices", external: false },
];

const actionButtons = [
    { title: "Write", type: "article" },
    { title: "Post Ad", type: "ad" },
    { title: "Announce", type: "announcement" },
    { title: "Notice", type: "notice" },
    { title: "Schedule", type: "schedule" },
];

export default function DayNewsHeader({ auth }: DayNewsHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="border-b bg-background sticky top-0 z-50">
            {/* Top Bar */}
            <div className="border-b">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left: Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold">Day News</span>
                        </Link>

                        {/* Right: Search, Location, Notifications, User */}
                        <div className="flex items-center gap-3">
                            {/* Search Bar - Spec enhancement */}
                            <form className="relative hidden lg:block w-48">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search news..."
                                    className="pl-8 bg-muted/50 border-none h-9 text-xs focus-visible:ring-news-primary"
                                />
                            </form>

                            {/* Location Search - Hidden on mobile */}
                            <div className="hidden md:block w-64">
                                <LocationSelector />
                            </div>

                            {/* Notification Bell */}
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="size-5" />
                                <span className="sr-only">Notifications</span>
                            </Button>

                            {/* User Button */}
                            {auth?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Avatar className="size-8">
                                                <AvatarImage src={auth.user?.avatar} alt={auth.user?.name || 'User'} />
                                                <AvatarFallback>
                                                    {auth.user?.name
                                                        ?.split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="sr-only">User menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DayNewsUserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <User className="size-5" />
                                            <span className="sr-only">Sign in</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>Welcome to Day News</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={route("login") as string} className="w-full">
                                                Log In
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={route("register") as string} className="w-full">
                                                Sign Up
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="border-b">
                <div className="container mx-auto px-4">
                    <div className="flex h-12 items-center justify-between">
                        {/* Mobile Menu Toggle */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="size-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground">Navigation</h3>
                                        {navigationTabs.map((tab) => (
                                            <Link
                                                key={tab.href}
                                                href={tab.href}
                                                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {tab.title}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground">Actions</h3>
                                        {actionButtons.map((action) => (
                                            <Link
                                                key={action.type}
                                                href={route("daynews.posts.create", { type: action.type }) as string}
                                                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {action.title}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="md:hidden">
                                        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Location</h3>
                                        <LocationSelector />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Desktop Navigation Tabs - Left */}
                        <NavigationMenu className="hidden md:flex">
                            <NavigationMenuList>
                                {navigationTabs.map((tab) => (
                                    <NavigationMenuItem key={tab.href}>
                                        <Link
                                            href={tab.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                "h-12 rounded-none border-b-2 border-transparent hover:border-primary hover:bg-transparent data-[active=true]:border-primary data-[active=true]:bg-transparent",
                                            )}
                                        >
                                            {tab.title}
                                        </Link>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>

                        {/* Desktop Action Buttons - Right */}
                        <div className="hidden items-center gap-2 md:flex">
                            {actionButtons.map((action) => (
                                <Button key={action.type} variant="ghost" size="sm" asChild>
                                    <Link href={route("daynews.posts.create", { type: action.type }) as string}>{action.title}</Link>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
