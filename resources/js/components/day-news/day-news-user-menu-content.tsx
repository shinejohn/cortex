import { Link } from "@inertiajs/react";
import { Bell, BookOpen, Building2, FileText, HelpCircle, LogOut, Megaphone, Newspaper, Settings, User as UserIcon } from "lucide-react";
import { route } from "ziggy-js";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";
import { type User } from "@/types";

interface DayNewsUserMenuContentProps {
    user: User;
}

export function DayNewsUserMenuContent({ user }: DayNewsUserMenuContentProps) {
    const handleLogout = () => {
        // Clear any cached data and perform logout
        sessionStorage.clear();
        localStorage.clear();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("profile.edit") as any} as="button">
                        <UserIcon className="mr-2 size-4" />
                        View Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("daynews.posts.index") as any} as="button">
                        <Newspaper className="mr-2 size-4" />
                        My Articles
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("daynews.announcements.index") as any} as="button">
                        <Megaphone className="mr-2 size-4" />
                        My Announcements
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("daynews.classifieds.my") as any} as="button">
                        <FileText className="mr-2 size-4" />
                        My Ads & Notices
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("daynews.classifieds.saved") as any} as="button">
                        <BookOpen className="mr-2 size-4" />
                        Saved Articles
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("notifications.index") as any} as="button">
                        <Bell className="mr-2 size-4" />
                        Notifications
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("daynews.businesses.index") as any} as="button">
                        <Building2 className="mr-2 size-4" />
                        Business Profile
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("profile.edit") as any} as="button">
                        <Settings className="mr-2 size-4" />
                        Account Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("daynews.home") as any} as="button">
                        <HelpCircle className="mr-2 size-4" />
                        Help & Support
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route("logout")} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Logout
                </Link>
            </DropdownMenuItem>
        </>
    );
}
