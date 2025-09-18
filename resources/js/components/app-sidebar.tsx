import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { type NavItem, SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { BookOpen, Folder, LayoutGrid, Settings } from "lucide-react";
import AppLogo from "./app-logo";
import { WorkspaceSelector } from "./workspace-selector";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
    },
];

const workspaceSettingsNavItem: NavItem = {
    title: "Workspace Settings",
    href: "/settings/workspace",
    icon: Settings,
};

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { workspaces } = usePage<SharedData>().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {workspaces.enabled && <WorkspaceSelector workspaces={workspaces} />}
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={workspaces.enabled ? [workspaceSettingsNavItem, ...footerNavItems] : footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
