import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon, EyeIcon, GlobeIcon, RocketIcon, UsersIcon } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";

interface Section {
    id: string;
    type: string;
    title: string;
    description: string | null;
    content: any;
    settings: any;
    is_visible: boolean;
    sort_order: number;
}

interface Workspace {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
}

interface Hub {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    subcategory: string | null;
    location: string | null;
    website: string | null;
    about: string | null;
    design_settings: any;
    is_active: boolean;
    published_at: string | null;
    sections: Section[];
    workspace?: Workspace;
    createdBy?: User;
}

interface Props {
    hub: Hub;
}

export default function HubPreview({ hub }: Props) {
    const visibleSections = (hub.sections || [])
        .filter((s) => s.is_visible)
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <AppLayout>
            <Head title={`Preview: ${hub.name}`} />
            <div className="min-h-screen bg-background">
                {/* Preview Banner */}
                <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
                    <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <EyeIcon className="size-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                Preview Mode — This is how your hub will look when published.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route("hubs.builder", hub.id) as string}>
                                    <ArrowLeftIcon className="mr-2 size-3" />
                                    Back to Builder
                                </Link>
                            </Button>
                            {!hub.published_at && (
                                <Button size="sm" asChild>
                                    <Link href={route("hubs.publish", hub.id) as string} method="post" as="button">
                                        <RocketIcon className="mr-2 size-3" />
                                        Publish
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Hub Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="font-display text-3xl font-black tracking-tight">
                                {hub.name}
                            </h1>
                            {hub.category && (
                                <Badge variant="secondary" className="capitalize">{hub.category}</Badge>
                            )}
                        </div>
                        {hub.description && (
                            <p className="text-lg text-muted-foreground max-w-3xl">
                                {hub.description}
                            </p>
                        )}
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                            {hub.location && (
                                <span className="flex items-center gap-1">
                                    <GlobeIcon className="size-3.5" />
                                    {hub.location}
                                </span>
                            )}
                            {hub.workspace && (
                                <span className="flex items-center gap-1">
                                    <UsersIcon className="size-3.5" />
                                    {hub.workspace.name}
                                </span>
                            )}
                        </div>
                    </div>

                    <Separator className="mb-8" />

                    {/* About Section */}
                    {hub.about && (
                        <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">{hub.about}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Sections */}
                    {visibleSections.length === 0 ? (
                        <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                            <CardContent className="py-16 text-center">
                                <p className="text-muted-foreground">
                                    No visible sections yet. Add sections in the Hub Builder.
                                </p>
                                <Button variant="outline" className="mt-4" asChild>
                                    <Link href={route("hubs.builder", hub.id) as string}>
                                        Open Builder
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {visibleSections.map((section) => (
                                <Card key={section.id} className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{section.title}</CardTitle>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {section.type}
                                            </Badge>
                                        </div>
                                        {section.description && (
                                            <p className="text-sm text-muted-foreground">{section.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        {section.content ? (
                                            <div className="prose dark:prose-invert max-w-none">
                                                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                                                    {JSON.stringify(section.content, null, 2)}
                                                </pre>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                No content configured for this section.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Website Link */}
                    {hub.website && (
                        <div className="mt-8 text-center">
                            <Button variant="outline" asChild>
                                <a href={hub.website} target="_blank" rel="noopener noreferrer">
                                    <GlobeIcon className="mr-2 size-4" />
                                    Visit Website
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
