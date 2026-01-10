import { Link } from "@inertiajs/react";
import { Mic, Twitter, Facebook, Instagram, Youtube } from "lucide-react";

export default function GoLocalVoicesFooter() {
    return (
        <footer className="bg-muted text-muted-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-3 mb-4">
                            <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg">
                                <Mic className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    Go Local Voices
                                </span>
                                <p className="text-xs text-muted-foreground">Community Podcasts</p>
                            </div>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 max-w-md">
                            Discover and share local podcasts from your community. Connect with creators, explore diverse voices, and amplify local
                            stories.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-foreground font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm hover:text-primary transition-colors">
                                    Browse Podcasts
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-sm hover:text-primary transition-colors">
                                    Become a Creator
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-sm hover:text-primary transition-colors">
                                    Creator Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-foreground font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="https://day.news" className="text-sm hover:text-primary transition-colors">
                                    Day.News
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-sm hover:text-primary transition-colors">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm hover:text-primary transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm hover:text-primary transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Go Local Voices. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
