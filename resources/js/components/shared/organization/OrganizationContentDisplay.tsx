import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BusinessList } from "../business/BusinessList";
import { EventList } from "../events/EventList";
import { NewsList } from "../news/NewsList";
import { ReviewList } from "../reviews/ReviewList";

interface OrganizationContentDisplayProps {
    organization: {
        id: string;
        name: string;
        organization_type?: string;
        organization_level?: string;
    };
    content: {
        [key: string]: Array<unknown>;
    };
    contentTypes?: string[];
    relationshipTypes?: string[];
    includeHierarchy?: boolean;
    showFilters?: boolean;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
}

export function OrganizationContentDisplay({
    organization,
    content,
    contentTypes = ["articles", "events", "coupons"],
    relationshipTypes = [],
    includeHierarchy = false,
    showFilters = true,
    theme = "downtownsguide",
    className,
}: OrganizationContentDisplayProps) {
    const [_selectedType, _setSelectedType] = useState<string | null>(null);

    const contentMap: Record<string, { label: string; component: React.ComponentType<any> }> = {
        "App\\Models\\DayNewsPost": {
            label: "Articles",
            component: NewsList,
        },
        "App\\Models\\Event": {
            label: "Events",
            component: EventList,
        },
        "App\\Models\\Coupon": {
            label: "Coupons",
            component: () => <div>Coupons List</div>, // Placeholder
        },
        "App\\Models\\Business": {
            label: "Businesses",
            component: BusinessList,
        },
        "App\\Models\\Review": {
            label: "Reviews",
            component: ReviewList,
        },
    };

    const availableContent = Object.keys(content).filter((key) => content[key] && Array.isArray(content[key]) && content[key].length > 0);

    if (availableContent.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">No content found for this organization</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Content from {organization.name}</h2>
                {organization.organization_type && (
                    <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{organization.organization_type}</span>
                )}
            </div>

            <Tabs defaultValue={availableContent[0]} className="w-full">
                <TabsList>
                    {availableContent.map((contentKey) => {
                        const config = contentMap[contentKey];
                        return (
                            <TabsTrigger key={contentKey} value={contentKey}>
                                {config?.label || contentKey}
                                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{content[contentKey].length}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {availableContent.map((contentKey) => {
                    const config = contentMap[contentKey];
                    const Component = config?.component || (() => <div>Content</div>);

                    return (
                        <TabsContent key={contentKey} value={contentKey} className="mt-4">
                            <Component items={content[contentKey]} theme={theme} />
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
