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

    const themeColors = {
        daynews: "text-blue-600",
        downtownsguide: "text-purple-600",
        eventcity: "text-indigo-600",
    };

    return (
        <div className={cn("space-y-2", className)}>
            <h3 className="text-sm font-semibold text-foreground">Related Organizations</h3>
            <div className="space-y-2">
                {displayedOrgs.map((org) => {
                    const href = org.slug ? `/organizations/${org.slug}` : `/organizations/${org.id}`;
                    
                    return (
                        <Link
                            key={org.id}
                            href={href}
                            className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                        >
                            <BuildingIcon className={cn("h-4 w-4", themeColors[theme])} />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{org.name}</p>
                                {showRelationshipType && org.relationship_type && (
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {org.relationship_type.replace('_', ' ')}
                                        {org.is_primary && ' • Primary'}
                                    </p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
            {remainingCount > 0 && (
                <p className="text-xs text-muted-foreground">
                    +{remainingCount} more organization{remainingCount !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}

