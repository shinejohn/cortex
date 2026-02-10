import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeftIcon, LayoutGrid, Loader2, Ruler } from "lucide-react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
}

interface EditPlacementProps {
    placement: AdPlacement;
    platforms: string[];
    formats: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Placements", href: "/admin/advertising/placements" },
    { title: "Edit", href: "#" },
];

export default function EditPlacement({ placement, platforms, formats }: EditPlacementProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: placement.name || "",
        description: placement.description || "",
        base_cpm: placement.base_cpm?.toString() || "",
        base_cpc: placement.base_cpc?.toString() || "",
        is_active: placement.is_active,
        priority: placement.priority?.toString() || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("admin.advertising.placements.update", placement.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Placement: ${placement.name}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.advertising.placements.show", placement.id)}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Edit Placement</h1>
                        <p className="text-muted-foreground mt-1">{placement.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Placement Details</CardTitle>
                            </div>
                            <CardDescription>Update placement name and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name *</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={data.description} onChange={(e) => setData("description", e.target.value)} rows={3} />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="rounded-lg bg-muted/30 p-4 space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Read-only Fields</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Platform: </span>
                                        <span className="font-medium">{placement.platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Slot: </span>
                                        <span className="font-mono">{placement.slot}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Format: </span>
                                        <span className="font-medium capitalize">{placement.format.replace(/_/g, " ")}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Size: </span>
                                        <span className="font-medium">{placement.width}x{placement.height}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <Ruler className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Pricing & Priority</CardTitle>
                            </div>
                            <CardDescription>Update pricing and priority settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="base_cpm">Base CPM ($) *</Label>
                                    <Input id="base_cpm" type="number" step="0.01" min="0" value={data.base_cpm} onChange={(e) => setData("base_cpm", e.target.value)} />
                                    {errors.base_cpm && <p className="text-sm text-destructive">{errors.base_cpm}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="base_cpc">Base CPC ($)</Label>
                                    <Input id="base_cpc" type="number" step="0.01" min="0" value={data.base_cpc} onChange={(e) => setData("base_cpc", e.target.value)} />
                                    {errors.base_cpc && <p className="text-sm text-destructive">{errors.base_cpc}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Input id="priority" type="number" min="0" value={data.priority} onChange={(e) => setData("priority", e.target.value)} />
                                    {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData("is_active", checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer flex-1">
                                    Active
                                    <p className="text-sm text-muted-foreground font-normal mt-0.5">Enable this placement to serve ads</p>
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route("admin.advertising.placements.show", placement.id)}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Placement
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
