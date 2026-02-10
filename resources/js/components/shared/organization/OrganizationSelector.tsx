import { router } from "@inertiajs/react";
import { BuildingIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
        <div className={cn("space-y-3", className)}>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search organizations..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="rounded-xl pl-10"
                />
            </div>

            {loading && (
                <div className="rounded-xl border-none bg-card p-4 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Searching...
                    </div>
                </div>
            )}

            {!loading && organizations.length > 0 && (
                <div className="max-h-60 space-y-1 overflow-y-auto rounded-xl border-none bg-card p-2 shadow-sm">
                    {organizations.map((org) => (
                        <button
                            key={org.id}
                            onClick={() => {
                                onSelect(org);
                                setQuery("");
                                setOrganizations([]);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                        >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                <BuildingIcon className="size-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate font-medium text-foreground">{org.name}</p>
                                {org.organization_type && (
                                    <p className="text-xs text-muted-foreground">
                                        {org.organization_type}
                                        {org.organization_level && ` \u00b7 ${org.organization_level}`}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {!loading && query.length >= 2 && organizations.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center">
                    <p className="font-display font-black tracking-tight text-foreground">No organizations found</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try a different search term</p>
                </div>
            )}
        </div>
    );
}
