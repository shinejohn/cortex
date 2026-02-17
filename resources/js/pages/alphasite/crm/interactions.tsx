import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, Mail, User, Bot, Filter } from "lucide-react";

interface InteractionWithCustomer {
    id: string;
    interaction_type: string;
    channel: string;
    direction: string;
    handled_by: string;
    outcome: string;
    created_at: string;
    customer?: {
        id: string;
        first_name?: string;
        last_name?: string;
        email?: string;
    };
}

interface PaginatedInteractions {
    data: InteractionWithCustomer[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        alphasite_subdomain: string | null;
        subscription_tier: string;
        city: string | null;
        state: string | null;
    };
    subscription: {
        tier: string;
        status: string;
        trial_expires_at: string | null;
        ai_services_enabled: string[];
    } | null;
    interactions: PaginatedInteractions;
    callHistory: unknown[];
}

function ChannelIcon({ channel }: { channel: string }) {
    switch (channel) {
        case 'chat': return <MessageSquare className="h-4 w-4" />;
        case 'phone': return <Phone className="h-4 w-4" />;
        case 'email': return <Mail className="h-4 w-4" />;
        case 'in_person': return <User className="h-4 w-4" />;
        default: return <MessageSquare className="h-4 w-4" />;
    }
}

export default function CrmInteractions({
    business,
    subscription,
    interactions,
    callHistory,
}: Props) {
    const [typeFilter, setTypeFilter] = useState("");
    const [handlerFilter, setHandlerFilter] = useState("");

    const doFilter = () => {
        router.get(route("alphasite.crm.interactions") as string, {
            type: typeFilter || undefined,
            handled_by: handlerFilter || undefined,
        });
    };

    return (
        <AlphasiteCrmLayout
            business={business}
            subscription={subscription}
            title="Interactions"
        >
            <Head title={`Interactions | ${business.name}`} />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-black tracking-tight text-foreground">
                        Interactions
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">History of customer communications.</p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="w-[180px]">
                        <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val === "all" ? "" : val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="chat">Chat</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="in_person">In Person</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[180px]">
                        <Select value={handlerFilter} onValueChange={(val) => setHandlerFilter(val === "all" ? "" : val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All handlers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All handlers</SelectItem>
                                <SelectItem value="ai">AI</SelectItem>
                                <SelectItem value="human">Human</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="secondary" onClick={doFilter}>
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Channel</TableHead>
                                <TableHead>Handled By</TableHead>
                                <TableHead>Outcome</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interactions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No interactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                interactions.data.map((i) => (
                                    <TableRow key={i.id}>
                                        <TableCell className="font-medium">
                                            {i.customer ? (
                                                <Link
                                                    href={route(
                                                        "alphasite.crm.customer.show",
                                                        i.customer.id
                                                    )}
                                                    className="hover:underline text-primary"
                                                >
                                                    {[i.customer.first_name, i.customer.last_name]
                                                        .filter(Boolean)
                                                        .join(" ") ||
                                                        i.customer.email ||
                                                        "—"}
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground italic">Anonymous</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="capitalize">{i.interaction_type}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <ChannelIcon channel={i.channel} />
                                                <span className="capitalize">{i.channel}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {i.handled_by === 'ai' ? (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Bot className="h-3 w-3" /> AI
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="gap-1">
                                                    <User className="h-3 w-3" /> Human
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{i.outcome}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(i.created_at).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {interactions.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {interactions.current_page} of {interactions.last_page}
                        </p>
                        <div className="flex gap-2">
                            {interactions.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    asChild
                                    disabled={!link.url}
                                >
                                    <Link href={link.url ?? "#"} preserveState>
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {callHistory.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>4Calls Call History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs text-muted-foreground overflow-auto max-h-64 bg-muted p-4 rounded-md">
                                {JSON.stringify(callHistory, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AlphasiteCrmLayout>
    );
}
