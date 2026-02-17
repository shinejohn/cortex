import { Link, usePage } from "@inertiajs/react";
import { Home, Map, Trophy, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DowntownGuideBottomNav() {
    const { url } = usePage();

    const navItems = [
        {
            title: "Home",
            href: "/",
            icon: Home,
            active: url === "/",
        },
        {
            title: "Map",
            href: "/map",
            icon: Map,
            active: url.startsWith("/map"),
        },
        {
            title: "Rewards",
            href: "/rewards",
            icon: Trophy,
            active: url.startsWith("/rewards"),
        },
        {
            title: "Community",
            href: "/community",
            icon: Users,
            active: url.startsWith("/community"),
        },
        {
            title: "Menu",
            href: "/menu",
            icon: Menu,
            active: url.startsWith("/menu"),
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
            <nav className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => (
                    <Link
                        key={item.title}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors hover:text-primary",
                            item.active ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
