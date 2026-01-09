import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeftIcon, Loader2 } from "lucide-react";
import { route } from "ziggy-js";

interface CreateCampaignProps {
    advertisers: Array<{ id: number; name: string }>;
    platforms: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Campaigns", href: "/admin/advertising/campaigns" },
    { title: "Create", href: "/admin/advertising/campaigns/create" },
];

export default function CreateCampaign({ advertisers, platforms }: CreateCampaignProps) {
    const { data, setData, post, processing, errors } = useForm({
        advertiser_id: "",
        name: "",
        description: "",
        status: "draft",
        type: "cpm",
        budget: "",
        daily_budget: "",
        start_date: "",
        end_date: "",
        targeting: {} as Record<string, any>,
        platforms: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin.advertising.campaigns.store"));
    };

    const togglePlatform = (platform: string) => {
        const currentPlatforms = data.platforms || [];
        if (currentPlatforms.includes(platform)) {
            setData(
                "platforms",
                currentPlatforms.filter((p) => p !== platform),
            );
        } else {
            setData("platforms", [...currentPlatforms, platform]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Campaign" />
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.advertising.campaigns.index")}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Create Campaign</h1>
                        <p className="text-muted-foreground mt-1">Set up a new advertising campaign</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Campaign name, advertiser, and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="advertiser_id">Advertiser *</Label>
                                <Select value={data.advertiser_id} onValueChange={(value) => setData("advertiser_id", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select advertiser" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {advertisers.map((advertiser) => (
                                            <SelectItem key={advertiser.id} value={advertiser.id.toString()}>
                                                {advertiser.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.advertiser_id && <p className="text-sm text-destructive mt-1">{errors.advertiser_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="name">Campaign Name *</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} placeholder="Summer Sale 2025" />
                                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    placeholder="Campaign description..."
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Settings</CardTitle>
                            <CardDescription>Budget, type, and scheduling</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type">Campaign Type *</Label>
                                    <Select value={data.type} onValueChange={(value) => setData("type", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cpm">CPM (Cost Per Mille)</SelectItem>
                                            <SelectItem value="cpc">CPC (Cost Per Click)</SelectItem>
                                            <SelectItem value="flat_rate">Flat Rate</SelectItem>
                                            <SelectItem value="sponsored">Sponsored</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-sm text-destructive mt-1">{errors.type}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData("status", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="budget">Total Budget ($) *</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={(e) => setData("budget", e.target.value)}
                                        placeholder="1000.00"
                                    />
                                    {errors.budget && <p className="text-sm text-destructive mt-1">{errors.budget}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="daily_budget">Daily Budget ($)</Label>
                                    <Input
                                        id="daily_budget"
                                        type="number"
                                        step="0.01"
                                        value={data.daily_budget}
                                        onChange={(e) => setData("daily_budget", e.target.value)}
                                        placeholder="100.00"
                                    />
                                    {errors.daily_budget && <p className="text-sm text-destructive mt-1">{errors.daily_budget}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_date">Start Date *</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData("start_date", e.target.value)}
                                    />
                                    {errors.start_date && <p className="text-sm text-destructive mt-1">{errors.start_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="end_date">End Date *</Label>
                                    <Input id="end_date" type="date" value={data.end_date} onChange={(e) => setData("end_date", e.target.value)} />
                                    {errors.end_date && <p className="text-sm text-destructive mt-1">{errors.end_date}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Platforms</CardTitle>
                            <CardDescription>Select which platforms this campaign will run on</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {platforms.map((platform) => (
                                    <div key={platform} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`platform-${platform}`}
                                            checked={data.platforms?.includes(platform)}
                                            onCheckedChange={() => togglePlatform(platform)}
                                        />
                                        <Label htmlFor={`platform-${platform}`} className="cursor-pointer">
                                            {platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.platforms && <p className="text-sm text-destructive mt-2">{errors.platforms}</p>}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route("admin.advertising.campaigns.index")}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Campaign
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
