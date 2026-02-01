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
        <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg shadow-md">
                            <Mic className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                Go Local Voices
                            </span>
                            <p className="text-xs text-muted-foreground -mt-1">Community Podcasts</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                            Browse
                        </Link>
                        {auth && (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/podcasts/create">
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
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
                    <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md ml-8">
                        <form onSubmit={handleSearch} className="flex-1">
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
                    </div>

                    {/* User Menu / Auth */}
                    <div className="flex items-center space-x-4">
                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={auth.user?.avatar} alt={auth.user?.name || 'User'} />
                                            <AvatarFallback className="bg-accent text-accent-foreground">
                                                {auth.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">{auth.user?.name || 'User'}</p>
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
                            <div className="hidden md:flex items-center space-x-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Get Started</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center space-x-2">
                                        <Mic className="h-6 w-6 text-primary" />
                                        <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold">
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
                                    <nav className="flex flex-col space-y-2">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
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
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        router.get("/dashboard");
                                                        setMobileMenuOpen(false);
                                                    }}
                                                >
                                                    Dashboard
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
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
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        router.get("/login");
                                                        setMobileMenuOpen(false);
                                                    }}
                                                >
                                                    Sign In
                                                </Button>
                                                <Button
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        router.get("/register");
                                                        setMobileMenuOpen(false);
                                                    }}
                                                >
                                                    Get Started
                                                </Button>
                                            </>
                                        )}

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
