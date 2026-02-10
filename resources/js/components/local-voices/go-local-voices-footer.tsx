import { Link } from "@inertiajs/react";
import { Facebook, Instagram, Mic, Twitter, Youtube } from "lucide-react";

export default function GoLocalVoicesFooter() {
    return (
        <footer className="bg-muted/50 text-muted-foreground border-t border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4 group">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 p-2.5 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                                <Mic className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <span className="font-display text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                    Go Local Voices
                                </span>
                                <p className="text-xs text-muted-foreground">Community Podcasts</p>
                            </div>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-5 max-w-md leading-relaxed">
                            Discover and share local podcasts from your community. Connect with creators, explore diverse voices, and amplify local
                            stories.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: Twitter, label: "Twitter" },
                                { icon: Facebook, label: "Facebook" },
                                { icon: Instagram, label: "Instagram" },
                                { icon: Youtube, label: "YouTube" },
                            ].map(({ icon: Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border border-border/50 text-muted-foreground hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
                                >
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-display text-sm font-black tracking-tight text-foreground mb-4">Platform</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/" className="text-sm hover:text-indigo-600 transition-colors">
                                    Browse Podcasts
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-sm hover:text-indigo-600 transition-colors">
                                    Become a Creator
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-sm hover:text-indigo-600 transition-colors">
                                    Creator Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display text-sm font-black tracking-tight text-foreground mb-4">Resources</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="https://day.news" className="text-sm hover:text-indigo-600 transition-colors">
                                    Day.News
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-sm hover:text-indigo-600 transition-colors">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm hover:text-indigo-600 transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm hover:text-indigo-600 transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/50 mt-10 pt-8 text-center text-sm text-muted-foreground/70">
                    <p>&copy; {new Date().getFullYear()} Go Local Voices. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
