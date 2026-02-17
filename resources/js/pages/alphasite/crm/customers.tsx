import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { UserPlus, Search, Filter } from "lucide-react";

interface Customer {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    source: string;
    status: string;
    health_score: number | null;
    lifetime_value: string | null;
    predicted_churn_risk: string | null;
    last_interaction_at: string | null;
    created_at: string;
}

interface PaginatedCustomers {
    data: Customer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
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
    customers: PaginatedCustomers;
}

function HealthBar({ score }: { score: number | null }) {
    if (score === null) return <span className="text-muted-foreground">—</span>;
    const pct = Math.min(100, Math.max(0, score));
    const color =
        pct < 30 ? "bg-red-500" : pct < 60 ? "bg-amber-500" : "bg-emerald-500";
    return (
        <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs font-medium text-muted-foreground w-8">
                {pct}%
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        lead: "secondary",
        prospect: "outline",
        customer: "default",
        inactive: "secondary",
        churned: "destructive",
    };

    return (
        <Badge variant={variants[status] || "outline"} className="capitalize">
            {status}
        </Badge>
    );
}

export default function CrmCustomers({
    business,
    subscription,
    customers,
}: Props) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);

    const doSearch = () => {
        router.get(route("alphasite.crm.customers") as string, {
            search: search || undefined,
            status: statusFilter || undefined,
        });
    };

    return (
        <AlphasiteCrmLayout
            business={business}
            subscription={subscription}
            title="Customers"
        >
            <Head title={`Customers | ${business.name}`} />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-black tracking-tight text-foreground">
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage your relationships and leads.</p>
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Customer
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && doSearch()}
                            className="pl-9"
                        />
                    </div>
                    <div className="w-full sm:w-[200px]">
                        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="prospect">Prospect</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="churned">Churned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="secondary" onClick={doSearch}>
                        Search
                    </Button>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Health</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Last Contact</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.data.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={route(
                                                    "alphasite.crm.customer.show",
                                                    c.id
                                                )}
                                                className="hover:underline text-primary"
                                            >
                                                {[c.first_name, c.last_name]
                                                    .filter(Boolean)
                                                    .join(" ") || "—"}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{c.email ?? "—"}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={c.status} />
                                        </TableCell>
                                        <TableCell>
                                            <HealthBar score={c.health_score} />
                                        </TableCell>
                                        <TableCell className="capitalize">{c.source}</TableCell>
                                        <TableCell>
                                            {c.last_interaction_at
                                                ? new Date(
                                                    c.last_interaction_at
                                                ).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {customers.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {customers.current_page} of {customers.last_page}
                        </p>
                        <div className="flex gap-2">
                            {customers.links.map((link, i) => (
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
            </div>
        </AlphasiteCrmLayout>
    );
}
