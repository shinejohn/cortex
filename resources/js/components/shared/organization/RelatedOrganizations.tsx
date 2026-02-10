import { Link } from "@inertiajs/react";
import { BuildingIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedOrganizationsProps {
    relatable: {
        id: string;
        type: string;
    };
    organizations: Array<{
        id: string;
        name: string;
        organization_type?: string;
        organization_level?: string;
        relationship_type?: string;
        is_primary?: boolean;
        slug?: string;
    }>;
    showRelationshipType?: boolean;
    maxDisplay?: number;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
}

export function RelatedOrganizations({
    relatable,
    organizations,
    showRelationshipType = true,
    maxDisplay = 5,
    theme = "downtownsguide",
    className,
}: RelatedOrganizationsProps) {
    const displayedOrgs = organizations.slice(0, maxDisplay);
    const remainingCount = organizations.length - maxDisplay;

    if (organizations.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-3", className)}>
            <h3 className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Related Organizations</h3>
            <div className="space-y-1">
                {displayedOrgs.map((org) => {
                    const href = org.slug ? `/organizations/${org.slug}` : `/organizations/${org.id}`;

                    return (
                        <Link key={org.id} href={href} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                <BuildingIcon className="size-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{org.name}</p>
                                {showRelationshipType && org.relationship_type && (
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {org.relationship_type.replace("_", " ")}
                                        {org.is_primary && " \u00b7 Primary"}
                                    </p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
            {remainingCount > 0 && (
                <p className="text-xs text-muted-foreground">
                    +{remainingCount} more organization{remainingCount !== 1 ? "s" : ""}
                </p>
            )}
        </div>
    );
}
