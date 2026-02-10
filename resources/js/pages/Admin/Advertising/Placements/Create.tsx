import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeftIcon, LayoutGrid, Loader2, Ruler } from "lucide-react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface CreatePlacementProps {
    platforms: string[];
    formats: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Placements", href: "/admin/advertising/placements" },
    { title: "Create", href: "#" },
];

export default function CreatePlacement({ platforms, formats }: CreatePlacementProps) {
    const { data, setData, post, processing, errors } = useForm({
        platform: "",
        slot: "",
        name: "",
        description: "",
        format: "",
        width: "",
        height: "",
        base_cpm: "",
        base_cpc: "",
        priority: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin.advertising.placements.store"));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Placement" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.advertising.placements.index")}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Create Placement</h1>
                        <p className="text-muted-foreground mt-1">Define a new ad placement slot</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Placement Details</CardTitle>
                            </div>
                            <CardDescription>Platform, slot name, and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform *</Label>
                                    <Select value={data.platform} onValueChange={(value) => setData("platform", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {platforms.map((platform) => (
                                                <SelectItem key={platform} value={platform}>
                                                    {platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.platform && <p className="text-sm text-destructive">{errors.platform}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slot">Slot Identifier *</Label>
                                    <Input id="slot" value={data.slot} onChange={(e) => setData("slot", e.target.value)} placeholder="homepage_header" />
                                    {errors.slot && <p className="text-sm text-destructive">{errors.slot}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name *</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} placeholder="Homepage Header Banner" />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    rows={3}
                                    placeholder="Describe where this placement appears..."
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="format">Ad Format *</Label>
                                <Select value={data.format} onValueChange={(value) => setData("format", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formats.map((format) => (
                                            <SelectItem key={format} value={format}>
                                                {format.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.format && <p className="text-sm text-destructive">{errors.format}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <Ruler className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Dimensions & Pricing</CardTitle>
                            </div>
                            <CardDescription>Size, pricing, and priority settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="width">Width (px) *</Label>
                                    <Input id="width" type="number" min="1" value={data.width} onChange={(e) => setData("width", e.target.value)} placeholder="728" />
                                    {errors.width && <p className="text-sm text-destructive">{errors.width}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height">Height (px) *</Label>
                                    <Input id="height" type="number" min="1" value={data.height} onChange={(e) => setData("height", e.target.value)} placeholder="90" />
                                    {errors.height && <p className="text-sm text-destructive">{errors.height}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="base_cpm">Base CPM ($) *</Label>
                                    <Input id="base_cpm" type="number" step="0.01" min="0" value={data.base_cpm} onChange={(e) => setData("base_cpm", e.target.value)} placeholder="5.00" />
                                    {errors.base_cpm && <p className="text-sm text-destructive">{errors.base_cpm}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="base_cpc">Base CPC ($)</Label>
                                    <Input id="base_cpc" type="number" step="0.01" min="0" value={data.base_cpc} onChange={(e) => setData("base_cpc", e.target.value)} placeholder="0.50" />
                                    {errors.base_cpc && <p className="text-sm text-destructive">{errors.base_cpc}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Input id="priority" type="number" min="0" value={data.priority} onChange={(e) => setData("priority", e.target.value)} placeholder="0" />
                                    {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route("admin.advertising.placements.index")}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Placement
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
