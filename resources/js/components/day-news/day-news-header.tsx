import { Link } from "@inertiajs/react";
import { Bell, Menu, User, Search, PenLine, Megaphone, DollarSign, FileText } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import type { Auth } from "@/types";
import { DayNewsUserMenuContent } from "./day-news-user-menu-content";
import LocationSelector from "./location-selector";

interface DayNewsHeaderProps {
    auth?: Auth;
}

const navigationTabs = [
    { title: "News", href: route("daynews.home") as any },
    { title: "Announcements", href: route("daynews.announcements.index") as any },
    { title: "Events", href: route("daynews.events.index") as any },
    { title: "Legal Notices", href: route("daynews.legal-notices.index") as any },
    { title: "Business", href: route("daynews.businesses.index") as any },
    { title: "Classifieds", href: route("daynews.classifieds.index") as any },
    { title: "Local Voices", href: route("daynews.local-voices.index") as any, external: false },
    { title: "Coupons", href: route("daynews.coupons.index") as any },
    { title: "Photos", href: route("daynews.photos.index") as any },
] as const;

const actionButtons = [
    { title: "Write", route: "daynews.posts.create", params: { type: "article" }, icon: PenLine },
    { title: "Advertise", route: "daynews.classifieds.create", params: {}, icon: Megaphone },
    { title: "Sell", route: "daynews.classifieds.create", params: {}, icon: DollarSign },
    { title: "Announce", route: "daynews.announcements.create", params: {}, icon: Megaphone },
    { title: "Notice", route: "daynews.legal-notices.create", params: {}, icon: FileText },
] as const;

export default function DayNewsHeader({ auth }: DayNewsHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-background sticky top-0 z-50 flex flex-col">
            {/* Row 1: Top Bar (Logo, Search, User) */}
            <div className="border-b py-3">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Logo */}
                        <div className="flex items-center gap-4">
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
                                            {actionButtons.map(({ icon: Icon, ...action }) => (
                                                <Link
                                                    key={action.title}
                                                    href={route(action.route, action.params) as any}
                                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <Icon className="size-4" />
                                                    {action.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Link href={route("daynews.home") as any} className="flex items-center gap-2">
                                <span className="font-serif text-2xl font-black tracking-tight">Day.news</span>
                            </Link>
                        </div>

                        {/* Right: Search, Notification, User */}
                        <div className="flex items-center gap-3">
                            <div className="relative hidden w-64 lg:block">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    className="h-9 rounded-full bg-muted/50 pl-9 text-sm border-none shadow-none focus-visible:ring-1"
                                />
                            </div>

                            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                                <Bell className="size-5" />
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
                                <span className="sr-only">Notifications</span>
                            </Button>

                            {auth?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full">
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
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DayNewsUserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                                            <User className="size-5" />
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

                            {/* Write Button (Top Right specific) */}
                            <Button variant="ghost" size="sm" className="hidden font-medium md:flex" asChild>
                                <Link href={route("daynews.posts.create", { type: "article" }) as any}>Write</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Main Navigation (Centered) */}
            <div className="hidden border-b bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center justify-center gap-6">
                        {navigationTabs.map((tab) => (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {tab.title}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Row 3: Action Navigation (Centered) */}
            <div className="hidden border-b bg-muted/20 py-2 md:block">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center justify-center gap-6">
                        {actionButtons.map(({ icon: Icon, ...action }) => (
                            <Link
                                key={action.title}
                                href={route(action.route, action.params) as any}
                                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                            >
                                <Icon className="size-3.5" />
                                {action.title}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
