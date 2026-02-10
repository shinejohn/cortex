import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon, Building2, Mail, User } from "lucide-react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface EmailSubscriber {
    id: number;
    email: string;
    name: string | null;
    type: string;
    status: string;
    preferences: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    community: {
        id: number;
        name: string;
    } | null;
    business: {
        id: number;
        name: string;
    } | null;
}

interface SubscriberShowProps {
    subscriber: EmailSubscriber;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Email", href: "/admin/email" },
    { title: "Subscribers", href: "/admin/email/subscribers" },
    { title: "Details", href: "#" },
];

function getStatusBadgeVariant(status: string) {
    switch (status) {
        case "active":
            return "default" as const;
        case "pending":
            return "secondary" as const;
        case "unsubscribed":
            return "outline" as const;
        case "bounced":
        case "complained":
            return "destructive" as const;
        default:
            return "outline" as const;
    }
}

export default function SubscriberShow({ subscriber }: SubscriberShowProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Subscriber: ${subscriber.email}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.email.subscribers.index")}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-display text-3xl font-black tracking-tight text-foreground">{subscriber.email}</h1>
                            <Badge variant={getStatusBadgeVariant(subscriber.status)}>{subscriber.status}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {subscriber.name ?? "No name"} &middot; {subscriber.type.toUpperCase()} subscriber
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Subscriber Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5" />
                                        Email
                                    </p>
                                    <p className="mt-1 text-foreground">{subscriber.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="mt-1 text-foreground">{subscriber.name ?? "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <p className="mt-1">
                                        <Badge variant="outline">{subscriber.type.toUpperCase()}</Badge>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <p className="mt-1">
                                        <Badge variant={getStatusBadgeVariant(subscriber.status)}>{subscriber.status}</Badge>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Subscribed</p>
                                    <p className="mt-1 text-foreground">{new Date(subscriber.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                    <p className="mt-1 text-foreground">{new Date(subscriber.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="overflow-hidden border-none shadow-sm">
                            <CardHeader className="bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    <CardTitle className="font-display tracking-tight">Associations</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Community</p>
                                    <p className="mt-1 text-foreground">{subscriber.community?.name ?? "None"}</p>
                                </div>
                                {subscriber.business && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Business</p>
                                        <p className="mt-1 text-foreground">{subscriber.business.name}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {subscriber.preferences && Object.keys(subscriber.preferences).length > 0 && (
                            <Card className="overflow-hidden border-none shadow-sm">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle className="font-display tracking-tight">Preferences</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        {Object.entries(subscriber.preferences).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center py-1.5">
                                                <span className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                                                <span className="text-sm font-medium">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
