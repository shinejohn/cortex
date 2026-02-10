import { Link } from "@inertiajs/react";
import { BuildingIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationHierarchyProps {
    organization: {
        id: string;
        name: string;
        organization_type?: string;
        organization_level?: string;
        slug?: string;
    };
    parent?: {
        id: string;
        name: string;
        slug?: string;
    } | null;
    children?: Array<{
        id: string;
        name: string;
        slug?: string;
    }>;
    showContentCount?: boolean;
    onSelect?: (organization: { id: string; name: string }) => void;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
}

export function OrganizationHierarchy({
    organization,
    parent,
    children = [],
    showContentCount = true,
    onSelect,
    theme = "downtownsguide",
    className,
}: OrganizationHierarchyProps) {
    const handleClick = (org: { id: string; name: string }) => {
        if (onSelect) {
            onSelect(org);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Parent Organization */}
            {parent && (
                <div className="overflow-hidden rounded-xl border-none bg-card p-4 shadow-sm">
                    <div className="mb-2 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                        Parent Organization
                    </div>
                    <Link
                        href={parent.slug ? `/organizations/${parent.slug}` : `/organizations/${parent.id}`}
                        onClick={() => handleClick(parent)}
                        className="flex items-center gap-2 transition-colors hover:text-primary"
                    >
                        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50">
                            <BuildingIcon className="size-4 text-primary" />
                        </div>
                        <span className="font-display font-black tracking-tight text-foreground">{parent.name}</span>
                    </Link>
                </div>
            )}

            {/* Current Organization */}
            <div className="overflow-hidden rounded-xl border-2 border-primary/20 bg-accent/30 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <BuildingIcon className="size-4 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-primary">Current Organization</span>
                </div>
                <p className="font-display text-lg font-black tracking-tight text-foreground">{organization.name}</p>
                {organization.organization_type && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {organization.organization_type}
                        {organization.organization_level && ` \u00b7 ${organization.organization_level}`}
                    </p>
                )}
            </div>

            {/* Child Organizations */}
            {children && children.length > 0 && (
                <div className="overflow-hidden rounded-xl border-none bg-card p-4 shadow-sm">
                    <div className="mb-3 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                        Child Organizations ({children.length})
                    </div>
                    <div className="space-y-1">
                        {children.map((child) => {
                            const href = child.slug ? `/organizations/${child.slug}` : `/organizations/${child.id}`;

                            return (
                                <Link
                                    key={child.id}
                                    href={href}
                                    onClick={() => handleClick(child)}
                                    className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted"
                                >
                                    <ChevronRightIcon className="size-4 text-muted-foreground" />
                                    <div className="flex size-6 items-center justify-center rounded-md bg-indigo-50">
                                        <BuildingIcon className="size-3 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{child.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
