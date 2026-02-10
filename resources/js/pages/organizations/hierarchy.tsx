import { Head, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Building2,
    ChevronDown,
    ChevronRight,
    GitBranch,
    Network,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Organization {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    organization_type: string | null;
    organization_level: string | null;
    organization_category: string | null;
    city: string | null;
    state: string | null;
}

interface HierarchyData {
    organization: Organization;
    parent: Organization | null;
    children: Organization[];
    ancestors: Organization[];
    descendants: Organization[];
}

interface HierarchyPageProps {
    hierarchy: HierarchyData;
}

function TreeNode({
    org,
    isCurrent = false,
    children: childOrgs = [],
    descendants = [],
    defaultExpanded = false,
}: {
    org: Organization;
    isCurrent?: boolean;
    children?: Organization[];
    descendants?: Organization[];
    defaultExpanded?: boolean;
}) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const hasChildren = childOrgs.length > 0;

    return (
        <div className="relative">
            <div
                className={cn(
                    "flex items-start gap-3 rounded-xl p-4 transition-all",
                    isCurrent
                        ? "border-2 border-primary/30 bg-primary/5"
                        : "bg-card shadow-sm hover:shadow-md",
                    hasChildren && "cursor-pointer"
                )}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                {/* Expand/Collapse Toggle */}
                <div className="mt-0.5 flex size-8 flex-shrink-0 items-center justify-center">
                    {hasChildren ? (
                        expanded ? (
                            <ChevronDown className="size-5 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="size-5 text-muted-foreground" />
                        )
                    ) : (
                        <div className="size-2 rounded-full bg-zinc-300" />
                    )}
                </div>

                {/* Organization Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "flex size-9 flex-shrink-0 items-center justify-center rounded-lg",
                                isCurrent ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500"
                            )}
                        >
                            <Building2 className="size-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3
                                className={cn(
                                    "font-bold truncate",
                                    isCurrent ? "text-primary" : "text-foreground"
                                )}
                            >
                                {org.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                {isCurrent && (
                                    <Badge className="bg-primary text-white text-[9px] font-black uppercase tracking-widest">
                                        Current
                                    </Badge>
                                )}
                                {org.organization_type && (
                                    <Badge variant="outline" className="text-[9px] font-bold capitalize">
                                        {org.organization_type}
                                    </Badge>
                                )}
                                {org.organization_level && (
                                    <Badge variant="secondary" className="text-[9px] font-bold capitalize">
                                        {org.organization_level}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    {org.description && (
                        <p className="mt-2 ml-11 line-clamp-2 text-sm text-muted-foreground">
                            {org.description}
                        </p>
                    )}
                    {(org.city || org.state) && (
                        <p className="mt-1 ml-11 text-xs text-muted-foreground">
                            {[org.city, org.state].filter(Boolean).join(", ")}
                        </p>
                    )}
                    {hasChildren && (
                        <p className="mt-1 ml-11 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {childOrgs.length} sub-organization{childOrgs.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
            </div>

            {/* Children */}
            {expanded && hasChildren && (
                <div className="ml-8 mt-2 space-y-2 border-l-2 border-zinc-200 pl-6">
                    {childOrgs.map((child) => {
                        const childDescendants = descendants.filter(
                            (d) => d.id !== child.id
                        );
                        return (
                            <TreeNode
                                key={child.id}
                                org={child}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function OrganizationHierarchy() {
    const { hierarchy } = usePage<HierarchyPageProps>().props;

    const { organization, parent, children, ancestors, descendants } = hierarchy;

    const hasAncestors = ancestors && ancestors.length > 0;
    const hasChildren = children && children.length > 0;
    const hasDescendants = descendants && descendants.length > 0;

    const totalRelated =
        (ancestors?.length || 0) + (children?.length || 0) + (descendants?.length || 0);

    return (
        <div className="min-h-screen bg-zinc-50">
            <Head title={`${organization.name} - Organization Hierarchy`} />

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

                {/* Header */}
                <div className="mb-10">
                    <div className="mb-2 flex items-center gap-2 text-primary">
                        <Network className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            Organization Structure
                        </span>
                    </div>
                    <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
                        {organization.name}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {totalRelated > 0
                            ? `Viewing hierarchy with ${totalRelated} related organization${totalRelated !== 1 ? "s" : ""}`
                            : "This is a standalone organization with no hierarchy"}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Tree View */}
                    <div className="lg:col-span-8">
                        <div className="space-y-3">
                            {/* Ancestors (top-down) */}
                            {hasAncestors && (
                                <div>
                                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <GitBranch className="size-3.5 rotate-180" />
                                        Parent Chain
                                    </p>
                                    <div className="space-y-2">
                                        {[...ancestors].reverse().map((ancestor, index) => (
                                            <div key={ancestor.id} style={{ marginLeft: `${index * 32}px` }}>
                                                <TreeNode org={ancestor} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Current Organization */}
                            <div style={{ marginLeft: hasAncestors ? `${ancestors.length * 32}px` : "0" }}>
                                <TreeNode
                                    org={organization}
                                    isCurrent
                                    children={children || []}
                                    descendants={descendants || []}
                                    defaultExpanded
                                />
                            </div>
                        </div>

                        {/* Empty State */}
                        {!hasAncestors && !hasChildren && (
                            <div className="mt-8 rounded-xl border-2 border-dashed p-12 text-center">
                                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
                                    <Network className="size-7 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 font-display text-lg font-black">
                                    No hierarchy found
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    This organization does not have parent or child organizations.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {/* Stats Card */}
                            <div className="overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm">
                                <h3 className="mb-4 font-display text-lg font-black tracking-tight">
                                    Hierarchy Summary
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3">
                                        <span className="text-sm text-muted-foreground">Ancestors</span>
                                        <span className="font-bold">{ancestors?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3 border border-primary/10">
                                        <span className="text-sm font-medium text-primary">Current</span>
                                        <span className="font-bold text-primary">{organization.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3">
                                        <span className="text-sm text-muted-foreground">Direct Children</span>
                                        <span className="font-bold">{children?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3">
                                        <span className="text-sm text-muted-foreground">All Descendants</span>
                                        <span className="font-bold">{descendants?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Organization Info */}
                            <div className="overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm">
                                <h3 className="mb-4 font-display text-lg font-black tracking-tight">
                                    Organization Details
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {organization.organization_type && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Type
                                            </p>
                                            <p className="font-medium capitalize">{organization.organization_type}</p>
                                        </div>
                                    )}
                                    {organization.organization_level && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Level
                                            </p>
                                            <p className="font-medium capitalize">{organization.organization_level}</p>
                                        </div>
                                    )}
                                    {organization.organization_category && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Category
                                            </p>
                                            <p className="font-medium capitalize">
                                                {organization.organization_category.replace(/_/g, " ")}
                                            </p>
                                        </div>
                                    )}
                                    {organization.description && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Description
                                            </p>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {organization.description}
                                            </p>
                                        </div>
                                    )}
                                    {(organization.city || organization.state) && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Location
                                            </p>
                                            <p className="font-medium">
                                                {[organization.city, organization.state].filter(Boolean).join(", ")}
                                            </p>
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
