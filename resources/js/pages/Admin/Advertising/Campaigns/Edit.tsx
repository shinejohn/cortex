import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeftIcon, CalendarDays, DollarSign, Loader2, Megaphone, Monitor } from "lucide-react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface AdCampaign {
    id: number;
    name: string;
    description: string | null;
    status: string;
    type: string;
    budget: number;
    daily_budget: number | null;
    start_date: string;
    end_date: string;
    platforms: string[];
    targeting: Record<string, unknown> | null;
    advertiser_id: number;
}

interface EditCampaignProps {
    campaign: AdCampaign;
    advertisers: Array<{ id: number; name: string }>;
    platforms: string[];
    campaignTypes: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Advertising", href: "/admin/advertising" },
    { title: "Campaigns", href: "/admin/advertising/campaigns" },
    { title: "Edit", href: "#" },
];

export default function EditCampaign({ campaign, advertisers, platforms, campaignTypes }: EditCampaignProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: campaign.name || "",
        description: campaign.description || "",
        budget: campaign.budget?.toString() || "",
        daily_budget: campaign.daily_budget?.toString() || "",
        end_date: campaign.end_date || "",
        platforms: campaign.platforms || ([] as string[]),
        targeting: campaign.targeting || ({} as Record<string, unknown>),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("admin.advertising.campaigns.update", campaign.id));
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
            <Head title={`Edit Campaign: ${campaign.name}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.advertising.campaigns.show", campaign.id)}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Edit Campaign</h1>
                        <p className="text-muted-foreground mt-1">{campaign.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Basic Information</CardTitle>
                            </div>
                            <CardDescription>Update campaign name and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Campaign Name *</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Budget & Schedule</CardTitle>
                            </div>
                            <CardDescription>Update budget and end date</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Total Budget ($) *</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={(e) => setData("budget", e.target.value)}
                                    />
                                    {errors.budget && <p className="text-sm text-destructive">{errors.budget}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="daily_budget">Daily Budget ($)</Label>
                                    <Input
                                        id="daily_budget"
                                        type="number"
                                        step="0.01"
                                        value={data.daily_budget}
                                        onChange={(e) => setData("daily_budget", e.target.value)}
                                    />
                                    {errors.daily_budget && <p className="text-sm text-destructive">{errors.daily_budget}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="flex items-center gap-1.5">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    End Date *
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData("end_date", e.target.value)}
                                />
                                {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Platforms</CardTitle>
                            </div>
                            <CardDescription>Select which platforms this campaign will run on</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {platforms.map((platform) => (
                                    <div
                                        key={platform}
                                        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <Checkbox
                                            id={`platform-${platform}`}
                                            checked={data.platforms?.includes(platform)}
                                            onCheckedChange={() => togglePlatform(platform)}
                                        />
                                        <Label htmlFor={`platform-${platform}`} className="cursor-pointer flex-1">
                                            {platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.platforms && <p className="text-sm text-destructive mt-3">{errors.platforms}</p>}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route("admin.advertising.campaigns.show", campaign.id)}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Campaign
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
