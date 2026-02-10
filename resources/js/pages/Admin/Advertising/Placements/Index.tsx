import { Head, Link, router } from "@inertiajs/react";
import { FilterIcon, LayoutGrid, PlusIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
}

interface PlacementsIndexProps {
    placements: {
        data: AdPlacement[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        platform?: string;
        is_active?: string;
    };
    platforms: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Placements", href: "/admin/advertising/placements" },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function PlacementsIndex({ placements, filters, platforms }: PlacementsIndexProps) {
    const [platformFilter, setPlatformFilter] = useState(filters.platform || "");
    const [activeFilter, setActiveFilter] = useState(filters.is_active ?? "");

    const handleFilter = () => {
        router.get(
            route("admin.advertising.placements.index"),
            {
                platform: platformFilter || undefined,
                is_active: activeFilter !== "" ? activeFilter : undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ad Placements" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Ad Placements</h1>
                        <p className="text-muted-foreground mt-1">Manage ad placement slots across platforms</p>
                    </div>
                    <Link href={route("admin.advertising.placements.create")}>
                        <Button className="gap-2">
                            <PlusIcon className="h-4 w-4" />
                            New Placement
                        </Button>
                    </Link>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight text-base">Filters</CardTitle>
                        <CardDescription>Filter placements by platform or active status</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={platformFilter} onValueChange={setPlatformFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Platforms" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Platforms</SelectItem>
                                    {platforms.map((platform) => (
                                        <SelectItem key={platform} value={platform}>
                                            {platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={activeFilter} onValueChange={setActiveFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter} className="gap-2">
                                <FilterIcon className="h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight">Placements ({placements.total})</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {placements.data.length === 0 ? (
                            <div className="text-center py-16">
                                <LayoutGrid className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground text-lg font-medium">No placements found</p>
                                <p className="text-muted-foreground text-sm mt-1">Create your first placement to get started.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Slot</TableHead>
                                        <TableHead>Format</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Base CPM</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {placements.data.map((placement) => (
                                        <TableRow key={placement.id}>
                                            <TableCell>
                                                <Link
                                                    href={route("admin.advertising.placements.show", placement.id)}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {placement.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {placement.platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-xs">{placement.slot}</TableCell>
                                            <TableCell className="text-muted-foreground">{placement.format.replace(/_/g, " ")}</TableCell>
                                            <TableCell className="text-muted-foreground">{placement.width}x{placement.height}</TableCell>
                                            <TableCell>{formatCurrency(placement.base_cpm)}</TableCell>
                                            <TableCell className="text-muted-foreground">{placement.priority ?? "--"}</TableCell>
                                            <TableCell>
                                                <Badge variant={placement.is_active ? "default" : "secondary"}>
                                                    {placement.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {placements.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8 pb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={placements.current_page === 1}
                                    onClick={() => router.get(route("admin.advertising.placements.index"), { page: placements.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm text-muted-foreground">
                                    Page {placements.current_page} of {placements.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={placements.current_page === placements.last_page}
                                    onClick={() => router.get(route("admin.advertising.placements.index"), { page: placements.current_page + 1 })}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
