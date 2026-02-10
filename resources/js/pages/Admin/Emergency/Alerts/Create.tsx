import { Head, Link, useForm } from "@inertiajs/react";
import { AlertTriangle, ArrowLeftIcon, Loader2, MessageSquare, Radio } from "lucide-react";
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

interface PriorityOption {
    value: string;
    label: string;
    color: string;
    description: string;
}

interface CreateAlertProps {
    communities: Array<{ id: number; name: string }>;
    priorities: PriorityOption[];
    categories: string[];
    channels: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Emergency", href: "/admin/emergency" },
    { title: "Alerts", href: "/admin/emergency/alerts" },
    { title: "Create", href: "#" },
];

function getPriorityBorderColor(priority: string) {
    switch (priority) {
        case "critical":
            return "border-red-500 bg-red-500/5";
        case "urgent":
            return "border-orange-500 bg-orange-500/5";
        case "advisory":
            return "border-yellow-500 bg-yellow-500/5";
        case "info":
            return "border-blue-500 bg-blue-500/5";
        default:
            return "border-border";
    }
}

export default function CreateAlert({ communities, priorities, categories, channels }: CreateAlertProps) {
    const { data, setData, post, processing, errors } = useForm({
        community_id: "",
        priority: "",
        category: "",
        title: "",
        message: "",
        instructions: "",
        source: "",
        source_url: "",
        expires_at: "",
        channels: [] as string[],
        publish_immediately: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin.emergency.alerts.store"));
    };

    const toggleChannel = (channel: string) => {
        const currentChannels = data.channels || [];
        if (currentChannels.includes(channel)) {
            setData(
                "channels",
                currentChannels.filter((c) => c !== channel),
            );
        } else {
            setData("channels", [...currentChannels, channel]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Emergency Alert" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.emergency.alerts.index")}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Create Emergency Alert</h1>
                        <p className="text-muted-foreground mt-1">Broadcast an emergency alert to the community</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Alert Details</CardTitle>
                            </div>
                            <CardDescription>Community, priority, and category</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="community_id">Community *</Label>
                                <Select value={data.community_id} onValueChange={(value) => setData("community_id", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select community" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {communities.map((community) => (
                                            <SelectItem key={community.id} value={community.id.toString()}>
                                                {community.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.community_id && <p className="text-sm text-destructive">{errors.community_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Priority Level *</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {priorities.map((priority) => (
                                        <div
                                            key={priority.value}
                                            onClick={() => setData("priority", priority.value)}
                                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                                                data.priority === priority.value
                                                    ? getPriorityBorderColor(priority.value)
                                                    : "border-border hover:border-muted-foreground/30"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`h-3 w-3 rounded-full`}
                                                    style={{ backgroundColor: priority.color === "red" ? "#ef4444" : priority.color === "orange" ? "#f97316" : priority.color === "yellow" ? "#eab308" : "#3b82f6" }}
                                                />
                                                <span className="font-medium">{priority.label}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{priority.description}</p>
                                        </div>
                                    ))}
                                </div>
                                {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select value={data.category} onValueChange={(value) => setData("category", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Alert Content</CardTitle>
                            </div>
                            <CardDescription>Title, message, and instructions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    placeholder="Severe Weather Warning"
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message *</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData("message", e.target.value)}
                                    rows={4}
                                    placeholder="Describe the emergency situation..."
                                />
                                {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instructions">Instructions</Label>
                                <Textarea
                                    id="instructions"
                                    value={data.instructions}
                                    onChange={(e) => setData("instructions", e.target.value)}
                                    rows={3}
                                    placeholder="What should people do? (e.g., Seek shelter immediately)"
                                />
                                {errors.instructions && <p className="text-sm text-destructive">{errors.instructions}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="source">Source</Label>
                                    <Input
                                        id="source"
                                        value={data.source}
                                        onChange={(e) => setData("source", e.target.value)}
                                        placeholder="National Weather Service"
                                    />
                                    {errors.source && <p className="text-sm text-destructive">{errors.source}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="source_url">Source URL</Label>
                                    <Input
                                        id="source_url"
                                        type="url"
                                        value={data.source_url}
                                        onChange={(e) => setData("source_url", e.target.value)}
                                        placeholder="https://weather.gov/alert/..."
                                    />
                                    {errors.source_url && <p className="text-sm text-destructive">{errors.source_url}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expires_at">Expiration Date</Label>
                                <Input
                                    id="expires_at"
                                    type="datetime-local"
                                    value={data.expires_at}
                                    onChange={(e) => setData("expires_at", e.target.value)}
                                />
                                {errors.expires_at && <p className="text-sm text-destructive">{errors.expires_at}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <Radio className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Broadcast Settings</CardTitle>
                            </div>
                            <CardDescription>Channels and publishing options</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-3">
                                <Label>Broadcast Channels *</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {channels.map((channel) => (
                                        <div
                                            key={channel}
                                            className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                                        >
                                            <Checkbox
                                                id={`channel-${channel}`}
                                                checked={data.channels?.includes(channel)}
                                                onCheckedChange={() => toggleChannel(channel)}
                                            />
                                            <Label htmlFor={`channel-${channel}`} className="cursor-pointer flex-1">
                                                {channel.toUpperCase()}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.channels && <p className="text-sm text-destructive">{errors.channels}</p>}
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border-2 border-dashed p-4">
                                <Checkbox
                                    id="publish_immediately"
                                    checked={data.publish_immediately}
                                    onCheckedChange={(checked) => setData("publish_immediately", checked as boolean)}
                                />
                                <Label htmlFor="publish_immediately" className="cursor-pointer flex-1">
                                    <span className="font-medium">Publish Immediately</span>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Broadcast the alert right away. If unchecked, the alert will be saved as a draft.
                                    </p>
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route("admin.emergency.alerts.index")}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} variant={data.publish_immediately ? "destructive" : "default"}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {data.publish_immediately ? "Publish & Broadcast" : "Save as Draft"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
