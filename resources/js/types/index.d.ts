import { LucideIcon } from "lucide-react";
import type { Config } from "ziggy-js";
import { NotificationSummary } from "./notifications";
import { Permission } from "./permissions";

export interface Auth {
    user: User;
    passwordEnabled: boolean;
    magicLinkEnabled: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    target?: string;
}

export interface Workspace {
    id: string;
    name: string;
    logo?: string;
    role: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    appDomain: "event-city" | "day-news" | "downtown-guide";
    analytics: {
        ga4Id: string | null;
    };
    workspaces: {
        enabled: boolean;
        all: Workspace[];
        current: (Workspace & { permissions: Permission[] }) | null;
        canCreateWorkspaces: boolean;
    };
    notifications?: NotificationSummary;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginatedData<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
