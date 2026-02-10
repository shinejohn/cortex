import { Link } from "@inertiajs/react";
import {
    Bell,
    Building,
    Calendar,
    CreditCard,
    Heart,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Ticket,
    User as UserIcon,
    Users,
} from "lucide-react";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { type User } from "@/types";

interface UserMenuContentProps {
    user: User | null;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        // Clear any cached data and perform logout
        sessionStorage.clear();
        localStorage.clear();
    };

    // Don't render if user is null
    if (!user) {
        return null;
    }

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
                    <Link className="block w-full" href={route("profile.edit") as any} as="button" prefetch onClick={cleanup}>
                        <UserIcon className="mr-2 size-4" />
                        View Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("tickets.index") as any} as="button" prefetch onClick={cleanup}>
                        <Ticket className="mr-2 size-4" />
                        My Tickets
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("calendars.index") as any} as="button" prefetch onClick={cleanup}>
                        <Calendar className="mr-2 size-4" />
                        My Calendar
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("dashboard") as any} as="button" prefetch onClick={cleanup}>
                        <LayoutDashboard className="mr-2 size-4" />
                        Dashboard
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("notifications.index") as any} as="button" prefetch onClick={cleanup}>
                        <Bell className="mr-2 size-4" />
                        Notifications
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("social.messages.index") as any} as="button" prefetch onClick={cleanup}>
                        <MessageSquare className="mr-2 size-4" />
                        Messages
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("social.friends.index") as any} as="button" prefetch onClick={cleanup}>
                        <Users className="mr-2 size-4" />
                        Friends
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("daynews.classifieds.saved") as any} as="button" prefetch onClick={cleanup}>
                        <Heart className="mr-2 size-4" />
                        Saved Items
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("profile.edit") as any} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2 size-4" />
                        Account Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("settings.workspace.billing") as any} as="button" prefetch onClick={cleanup}>
                        <CreditCard className="mr-2 size-4" />
                        Billing & Payouts
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route("venues") as any} as="button" prefetch onClick={cleanup}>
                        <Building className="mr-2 size-4" />
                        Venue Management
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="#" as="button" prefetch onClick={cleanup}>
                        <HelpCircle className="mr-2 size-4" />
                        Help & Support
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route("logout") as any} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Logout
                </Link>
            </DropdownMenuItem>
        </>
    );
}
