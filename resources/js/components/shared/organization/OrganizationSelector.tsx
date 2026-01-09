import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { SearchIcon, BuildingIcon } from "lucide-react";
import { router } from "@inertiajs/react";

interface OrganizationSelectorProps {
    onSelect: (organization: { id: string; name: string; organization_type?: string; organization_level?: string }) => void;
    organizationType?: string;
    organizationLevel?: string;
    allowCreate?: boolean;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
}

export function OrganizationSelector({
    onSelect,
    organizationType,
    organizationLevel,
    allowCreate = false,
    theme = "downtownsguide",
    className,
}: OrganizationSelectorProps) {
    const [query, setQuery] = useState("");
    const [organizations, setOrganizations] = useState<
        Array<{
            id: string;
            name: string;
            organization_type?: string;
            organization_level?: string;
        }>
    >([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.length < 2) {
            setOrganizations([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            setLoading(true);
            router.get(
                "/api/organizations/search",
                {
                    q: query,
                    type: organizationType,
                    level: organizationLevel,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setOrganizations(page.props.organizations || []);
                        setLoading(false);
                    },
                    onError: () => {
                        setLoading(false);
                    },
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, organizationType, organizationLevel]);

    return (
        <div className={cn("space-y-2", className)}>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="text" placeholder="Search organizations..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
            </div>

            {loading && <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">Searching...</div>}

            {!loading && organizations.length > 0 && (
                <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border bg-card p-2">
                    {organizations.map((org) => (
                        <button
                            key={org.id}
                            onClick={() => {
                                onSelect(org);
                                setQuery("");
                                setOrganizations([]);
                            }}
                            className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-muted"
                        >
                            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{org.name}</p>
                                {org.organization_type && (
                                    <p className="text-xs text-muted-foreground">
                                        {org.organization_type}
                                        {org.organization_level && ` • ${org.organization_level}`}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {!loading && query.length >= 2 && organizations.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">No organizations found</div>
            )}
        </div>
    );
}
