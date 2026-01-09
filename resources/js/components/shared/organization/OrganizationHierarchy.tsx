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
    const themeColors = {
        daynews: "text-blue-600 border-blue-200",
        downtownsguide: "text-purple-600 border-purple-200",
        eventcity: "text-indigo-600 border-indigo-200",
    };

    const handleClick = (org: { id: string; name: string }) => {
        if (onSelect) {
            onSelect(org);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Parent Organization */}
            {parent && (
                <div className="rounded-lg border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Parent Organization</span>
                    </div>
                    <Link
                        href={parent.slug ? `/organizations/${parent.slug}` : `/organizations/${parent.id}`}
                        onClick={() => handleClick(parent)}
                        className="flex items-center gap-2 hover:text-foreground"
                    >
                        <BuildingIcon className={cn("h-5 w-5", themeColors[theme])} />
                        <span className="font-medium text-foreground">{parent.name}</span>
                    </Link>
                </div>
            )}

            {/* Current Organization */}
            <div className={cn("rounded-lg border-2 bg-card p-4", themeColors[theme])}>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BuildingIcon className={cn("h-5 w-5", themeColors[theme])} />
                    <span>Current Organization</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{organization.name}</p>
                {organization.organization_type && (
                    <p className="text-sm text-muted-foreground">
                        {organization.organization_type}
                        {organization.organization_level && ` • ${organization.organization_level}`}
                    </p>
                )}
            </div>

            {/* Child Organizations */}
            {children && children.length > 0 && (
                <div className="rounded-lg border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Child Organizations ({children.length})</span>
                    </div>
                    <div className="space-y-2">
                        {children.map((child) => {
                            const href = child.slug ? `/organizations/${child.slug}` : `/organizations/${child.id}`;

                            return (
                                <Link
                                    key={child.id}
                                    href={href}
                                    onClick={() => handleClick(child)}
                                    className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                                >
                                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                                    <BuildingIcon className={cn("h-4 w-4", themeColors[theme])} />
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
