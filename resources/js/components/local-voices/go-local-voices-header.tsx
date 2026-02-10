import { Link, router } from "@inertiajs/react";
import { Menu, Mic, Plus, Search, User } from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Auth } from "@/types";

interface GoLocalVoicesHeaderProps {
    auth?: Auth;
}

export default function GoLocalVoicesHeader({ auth }: GoLocalVoicesHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get("/", { search: searchQuery }, { preserveState: true });
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 p-2 rounded-xl shadow-md transition-transform group-hover:scale-105">
                            <Mic className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="font-display text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                Go Local Voices
                            </span>
                            <p className="text-[10px] text-muted-foreground -mt-0.5">Community Podcasts</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Browse
                        </Link>
                        {auth && (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/podcasts/create">
                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                        <Plus className="mr-1.5 h-4 w-4" />
                                        Create Podcast
                                    </Button>
                                </Link>
                            </>
                        )}
                        <Link href="https://day.news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Day.News →
                        </Link>
                    </nav>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex items-center flex-1 max-w-md ml-8">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search podcasts..."
                                    className="pl-10 bg-muted/50 border-border/50 focus:bg-background"
                                />
                            </div>
                        </form>
                    </div>

                    {/* User Menu / Auth */}
                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full">
                                        <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                                            <AvatarImage src={auth.user?.avatar} alt={auth.user?.name || 'User'} />
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-sm">
                                                {auth.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-semibold">{auth.user?.name || 'User'}</p>
                                            <p className="text-xs text-muted-foreground">{auth.user?.email || ''}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/podcasts/create">Create Podcast</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings">Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/logout" method="post">
                                            Sign Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[380px]">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 p-1.5 rounded-lg">
                                            <Mic className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="font-display font-black tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                            Go Local Voices
                                        </span>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 space-y-4">
                                    {/* Mobile Search */}
                                    <form onSubmit={handleSearch}>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search podcasts..."
                                                className="pl-10"
                                            />
                                        </div>
                                    </form>

                                    {/* Mobile Navigation */}
                                    <nav className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-muted-foreground hover:text-foreground"
                                            onClick={() => {
                                                router.get("/");
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            Browse
                                        </Button>
                                        {auth?.user ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                                                    onClick={() => {
                                                        router.get("/dashboard");
                                                        setMobileMenuOpen(false);
                                                    }}
                                                >
                                                    Dashboard
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                                                    onClick={() => {
                                                        router.get("/podcasts/create");
                                                        setMobileMenuOpen(false);
                                                    }}
                                                >
                                                    Create Podcast
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                                                    onClick={() => {
                                                        router.get("/login");
                                                        setMobileMenuOpen(false);
                                                    }}
                                                >
                                                    Sign In
                                                </Button>
                                                <Button
                                                    className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    onClick={() => {
                                                        router.get("/register");
                                                        setMobileMenuOpen(false);
                                                    }}
                                                >
                                                    Get Started
                                                </Button>
                                            </>
                                        )}

                                        <div className="border-t border-border/50 mt-2 pt-2">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-muted-foreground"
                                                onClick={() => {
                                                    window.location.href = "https://day.news";
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                Day.News →
                                            </Button>
                                        </div>
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
