import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon, DollarSign, LayoutGrid, Monitor, PencilIcon, Ruler } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface AdPlacement {
    id: number;
    platform: string;
    slot: string;
    name: string;
    description: string | null;
    format: string;
    width: number;
    height: number;
    base_cpm: number;
    base_cpc: number | null;
    priority: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface PlacementShowProps {
    placement: AdPlacement;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Placements", href: "/admin/advertising/placements" },
    { title: "Details", href: "#" },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function PlacementShow({ placement }: PlacementShowProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Placement: ${placement.name}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route("admin.advertising.placements.index")}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-display text-3xl font-black tracking-tight text-foreground">{placement.name}</h1>
                                <Badge variant={placement.is_active ? "default" : "secondary"}>
                                    {placement.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1 font-mono text-sm">{placement.slot}</p>
                        </div>
                    </div>
                    <Link href={route("admin.advertising.placements.edit", placement.id)}>
                        <Button className="gap-2">
                            <PencilIcon className="h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Placement Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Monitor className="h-3.5 w-3.5" />
                                        Platform
                                    </p>
                                    <p className="mt-1">
                                        <Badge variant="outline">
                                            {placement.platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Slot</p>
                                    <p className="mt-1 font-mono text-sm text-foreground">{placement.slot}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Format</p>
                                    <p className="mt-1 text-foreground capitalize">{placement.format.replace(/_/g, " ")}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                                    <p className="mt-1 text-foreground">{placement.priority ?? "Not set"}</p>
                                </div>
                            </div>
                            {placement.description && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                                    <p className="mt-1 text-foreground">{placement.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="mt-1 text-foreground">{new Date(placement.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Updated</p>
                                    <p className="mt-1 text-foreground">{new Date(placement.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="overflow-hidden border-none shadow-sm">
                            <CardHeader className="bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-primary" />
                                    <CardTitle className="font-display tracking-tight">Dimensions</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-center p-6">
                                    <div className="relative">
                                        <div
                                            className="border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center bg-primary/5"
                                            style={{
                                                width: `${Math.min(placement.width / 3, 300)}px`,
                                                height: `${Math.min(placement.height / 3, 200)}px`,
                                                minWidth: "80px",
                                                minHeight: "40px",
                                            }}
                                        >
                                            <span className="text-sm text-muted-foreground font-mono">
                                                {placement.width} x {placement.height}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-none shadow-sm">
                            <CardHeader className="bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <CardTitle className="font-display tracking-tight">Pricing</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Base CPM</span>
                                    <span className="font-semibold text-lg">{formatCurrency(placement.base_cpm)}</span>
                                </div>
                                {placement.base_cpc !== null && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Base CPC</span>
                                        <span className="font-semibold text-lg">{formatCurrency(placement.base_cpc)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
