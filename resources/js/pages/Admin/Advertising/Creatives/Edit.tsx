import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeftIcon, Image, Loader2, Type } from "lucide-react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface AdCreative {
    id: number;
    name: string;
    format: string;
    status: string;
    headline: string | null;
    body: string | null;
    image_url: string | null;
    video_url: string | null;
    audio_url: string | null;
    click_url: string;
    cta_text: string | null;
    width: number | null;
    height: number | null;
    campaign_id: number;
}

interface EditCreativeProps {
    creative: AdCreative;
    campaigns: Array<{ id: number; name: string }>;
    formats: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Creatives", href: "/admin/advertising/creatives" },
    { title: "Edit", href: "#" },
];

export default function EditCreative({ creative, campaigns, formats }: EditCreativeProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: creative.name || "",
        format: creative.format || "",
        headline: creative.headline || "",
        body: creative.body || "",
        image_url: creative.image_url || "",
        video_url: creative.video_url || "",
        audio_url: creative.audio_url || "",
        click_url: creative.click_url || "",
        cta_text: creative.cta_text || "",
        width: creative.width?.toString() || "",
        height: creative.height?.toString() || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("admin.advertising.creatives.update", creative.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Creative: ${creative.name}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.advertising.creatives.show", creative.id)}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Edit Creative</h1>
                        <p className="text-muted-foreground mt-1">{creative.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <Type className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Basic Information</CardTitle>
                            </div>
                            <CardDescription>Update creative name and format</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Creative Name *</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="format">Format *</Label>
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
                                <Type className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Content</CardTitle>
                            </div>
                            <CardDescription>Update headline, body, and call-to-action</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="headline">Headline</Label>
                                <Input id="headline" value={data.headline} onChange={(e) => setData("headline", e.target.value)} />
                                {errors.headline && <p className="text-sm text-destructive">{errors.headline}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="body">Body Text</Label>
                                <Textarea id="body" value={data.body} onChange={(e) => setData("body", e.target.value)} rows={3} />
                                {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="click_url">Click URL *</Label>
                                    <Input id="click_url" type="url" value={data.click_url} onChange={(e) => setData("click_url", e.target.value)} />
                                    {errors.click_url && <p className="text-sm text-destructive">{errors.click_url}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cta_text">CTA Text</Label>
                                    <Input id="cta_text" value={data.cta_text} onChange={(e) => setData("cta_text", e.target.value)} maxLength={50} />
                                    {errors.cta_text && <p className="text-sm text-destructive">{errors.cta_text}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <Image className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Media & Dimensions</CardTitle>
                            </div>
                            <CardDescription>Update media URLs and dimensions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="image_url">Image URL</Label>
                                <Input id="image_url" type="url" value={data.image_url} onChange={(e) => setData("image_url", e.target.value)} />
                                {errors.image_url && <p className="text-sm text-destructive">{errors.image_url}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="video_url">Video URL</Label>
                                <Input id="video_url" type="url" value={data.video_url} onChange={(e) => setData("video_url", e.target.value)} />
                                {errors.video_url && <p className="text-sm text-destructive">{errors.video_url}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="audio_url">Audio URL</Label>
                                <Input id="audio_url" type="url" value={data.audio_url} onChange={(e) => setData("audio_url", e.target.value)} />
                                {errors.audio_url && <p className="text-sm text-destructive">{errors.audio_url}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="width">Width (px)</Label>
                                    <Input id="width" type="number" value={data.width} onChange={(e) => setData("width", e.target.value)} />
                                    {errors.width && <p className="text-sm text-destructive">{errors.width}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height">Height (px)</Label>
                                    <Input id="height" type="number" value={data.height} onChange={(e) => setData("height", e.target.value)} />
                                    {errors.height && <p className="text-sm text-destructive">{errors.height}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route("admin.advertising.creatives.show", creative.id)}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Creative
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
