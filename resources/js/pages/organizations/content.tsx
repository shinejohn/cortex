import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Building2,
    Calendar,
    ChevronRight,
    FileText,
    Megaphone,
    Newspaper,
    Tag,
    Ticket,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Organization {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    website: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    organization_type: string | null;
    organization_level: string | null;
    organization_category: string | null;
    images: string[] | null;
}

interface ContentItem {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    content?: string;
    created_at: string;
    [key: string]: any;
}

interface HierarchyNode {
    organization: Organization;
    parent: Organization | null;
    children: Organization[];
    ancestors: Organization[];
    descendants: Organization[];
}

interface ContentPageProps {
    organization: Organization;
    content: Record<string, ContentItem[]>;
    hierarchy: HierarchyNode;
}

type ContentType = "all" | string;

const contentTypeLabels: Record<string, { label: string; icon: typeof FileText }> = {
    "App\\Models\\DayNewsPost": { label: "Articles", icon: Newspaper },
    "App\\Models\\Event": { label: "Events", icon: Calendar },
    "App\\Models\\Announcement": { label: "Announcements", icon: Megaphone },
    "App\\Models\\Coupon": { label: "Coupons", icon: Tag },
    "App\\Models\\Advertisement": { label: "Ads", icon: FileText },
    "App\\Models\\TicketPlan": { label: "Tickets", icon: Ticket },
};

function getContentLabel(type: string): string {
    return contentTypeLabels[type]?.label ?? type.split("\\").pop() ?? "Content";
}

function getContentIcon(type: string) {
    return contentTypeLabels[type]?.icon ?? FileText;
}

export default function OrganizationContent() {
    const { organization, content, hierarchy } = usePage<ContentPageProps>().props;
    const [activeFilter, setActiveFilter] = useState<ContentType>("all");

    const contentTypes = Object.keys(content);
    const totalItems = Object.values(content).reduce(
        (sum, items) => sum + (Array.isArray(items) ? items.length : 0),
        0
    );

    const filteredContent =
        activeFilter === "all"
            ? content
            : { [activeFilter]: content[activeFilter] || [] };

    return (
        <div className="min-h-screen bg-zinc-50">
            <Head title={`${organization.name} - Content`} />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Navigation */}
                <div className="mb-8">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors group uppercase tracking-widest"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        Back
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        {/* Organization Header */}
                        <div className="mb-8 overflow-hidden rounded-xl border-none bg-card p-8 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex size-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Building2 className="size-8" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {organization.organization_type && (
                                            <Badge variant="outline" className="text-xs font-semibold capitalize">
                                                {organization.organization_type}
                                            </Badge>
                                        )}
                                        {organization.organization_level && (
                                            <Badge variant="secondary" className="text-xs font-semibold capitalize">
                                                {organization.organization_level}
                                            </Badge>
                                        )}
                                    </div>
                                    <h1 className="mt-2 font-display text-3xl font-black tracking-tight">
                                        {organization.name}
                                    </h1>
                                    {organization.description && (
                                        <p className="mt-2 text-muted-foreground leading-relaxed">
                                            {organization.description}
                                        </p>
                                    )}
                                    {(organization.city || organization.state) && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {[organization.city, organization.state].filter(Boolean).join(", ")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Type Filters */}
                        <div className="mb-6 flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveFilter("all")}
                                className={cn(
                                    "rounded-full px-4 py-2 text-sm font-bold transition-all",
                                    activeFilter === "all"
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-white text-zinc-600 hover:bg-zinc-100 shadow-sm"
                                )}
                            >
                                All ({totalItems})
                            </button>
                            {contentTypes.map((type) => {
                                const items = content[type];
                                const count = Array.isArray(items) ? items.length : 0;
                                const IconComponent = getContentIcon(type);
                                return (
                                    <button
                                        key={type}
                                        onClick={() => setActiveFilter(type)}
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all",
                                            activeFilter === type
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                                : "bg-white text-zinc-600 hover:bg-zinc-100 shadow-sm"
                                        )}
                                    >
                                        <IconComponent className="size-3.5" />
                                        {getContentLabel(type)} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content List */}
                        {totalItems === 0 ? (
                            <div className="rounded-xl border-2 border-dashed p-16 text-center">
                                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                                    <FileText className="size-8 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 font-display text-lg font-black">
                                    No content yet
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    This organization hasn't published any content.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(filteredContent).map(([type, items]) => {
                                    if (!Array.isArray(items) || items.length === 0) return null;
                                    const IconComponent = getContentIcon(type);

                                    return (
                                        <div key={type}>
                                            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-black tracking-tight">
                                                <IconComponent className="size-5 text-primary" />
                                                {getContentLabel(type)}
                                            </h2>
                                            <div className="space-y-3">
                                                {items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="overflow-hidden rounded-xl border-none bg-card p-5 shadow-sm transition-all hover:shadow-md"
                                                    >
                                                        <h3 className="font-bold text-foreground">
                                                            {item.title || item.name || "Untitled"}
                                                        </h3>
                                                        {(item.description || item.content) && (
                                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                                {item.description || item.content}
                                                            </p>
                                                        )}
                                                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                            <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-bold">
                                                                {getContentLabel(type)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Hierarchy */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {/* Hierarchy Card */}
                            <div className="overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm">
                                <h3 className="mb-4 font-display text-lg font-black tracking-tight">
                                    Organization Structure
                                </h3>

                                {/* Ancestors / Parent */}
                                {hierarchy.ancestors && hierarchy.ancestors.length > 0 && (
                                    <div className="mb-4">
                                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            Parent Organizations
                                        </p>
                                        <div className="space-y-2">
                                            {hierarchy.ancestors.map((ancestor) => (
                                                <div
                                                    key={ancestor.id}
                                                    className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm"
                                                >
                                                    <Building2 className="size-4 text-muted-foreground" />
                                                    <span className="font-medium">{ancestor.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Current */}
                                <div className="mb-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="size-4 text-primary" />
                                        <span className="font-bold text-primary">{organization.name}</span>
                                    </div>
                                </div>

                                {/* Children */}
                                {hierarchy.children && hierarchy.children.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            Sub-Organizations ({hierarchy.children.length})
                                        </p>
                                        <div className="space-y-2">
                                            {hierarchy.children.map((child) => (
                                                <div
                                                    key={child.id}
                                                    className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm"
                                                >
                                                    <ChevronRight className="size-4 text-muted-foreground" />
                                                    <span className="font-medium">{child.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!hierarchy.parent &&
                                    (!hierarchy.children || hierarchy.children.length === 0) && (
                                        <p className="text-sm text-muted-foreground">
                                            This is a standalone organization.
                                        </p>
                                    )}
                            </div>

                            {/* Quick Info */}
                            <div className="overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm">
                                <h3 className="mb-4 font-display text-lg font-black tracking-tight">
                                    Quick Info
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {organization.website && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Website
                                            </p>
                                            <a
                                                href={organization.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {organization.website}
                                            </a>
                                        </div>
                                    )}
                                    {organization.phone && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Phone
                                            </p>
                                            <p className="font-medium">{organization.phone}</p>
                                        </div>
                                    )}
                                    {organization.email && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Email
                                            </p>
                                            <a
                                                href={`mailto:${organization.email}`}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {organization.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
