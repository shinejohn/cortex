import { Head, Link, router } from "@inertiajs/react";
import { CopyIcon, PlusIcon, SearchIcon, TagIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";

interface PromoCode {
    id: string;
    code: string;
    description: string | null;
    type: "percentage" | "fixed";
    value: number;
    min_purchase: number | null;
    max_discount: number | null;
    usage_limit: number | null;
    usage_count: number;
    is_active: boolean;
    starts_at: string | null;
    expires_at: string | null;
    created_at: string;
}

interface PaginatedPromoCodes {
    data: PromoCode[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filters {
    search: string | null;
    active_only: boolean;
}

interface Props {
    promoCodes: PaginatedPromoCodes;
    filters: Filters;
}

export default function PromoCodesIndex({ promoCodes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route("promo-codes.index") as string,
            { search, active_only: filters.active_only || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
    };

    return (
        <AppLayout>
            <Head title="Promo Codes" />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-display text-2xl font-black tracking-tight">Promo Codes</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {promoCodes.total} promo code{promoCodes.total !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={route("promo-codes.create") as string}>
                                <PlusIcon className="mr-2 size-4" />
                                Create Code
                            </Link>
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input placeholder="Search promo codes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                                    </div>
                                </form>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="active_only"
                                        checked={!!filters.active_only}
                                        onCheckedChange={(checked) => {
                                            router.get(
                                                route("promo-codes.index") as string,
                                                { search: filters.search, active_only: checked ? "1" : undefined },
                                                { preserveState: true }
                                            );
                                        }}
                                    />
                                    <Label htmlFor="active_only" className="cursor-pointer text-sm">Active only</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground">Code</th>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground">Discount</th>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground">Usage</th>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black text-muted-foreground">Expires</th>
                                        <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest font-black text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promoCodes.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                                <TagIcon className="mx-auto size-8 mb-2 opacity-50" />
                                                No promo codes found.
                                            </td>
                                        </tr>
                                    ) : (
                                        promoCodes.data.map((code) => (
                                            <tr key={code.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm font-bold">{code.code}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => handleCopyCode(code.code)}
                                                        >
                                                            <CopyIcon className="size-3" />
                                                        </Button>
                                                    </div>
                                                    {code.description && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{code.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {code.type === "percentage" ? `${code.value}%` : `$${Number(code.value).toFixed(2)}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {code.usage_count}{code.usage_limit ? ` / ${code.usage_limit}` : ""}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={code.is_active ? "default" : "secondary"}>
                                                        {code.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {code.expires_at
                                                        ? new Date(code.expires_at).toLocaleDateString()
                                                        : "Never"}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route("promo-codes.show", code.id) as string}>View</Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route("promo-codes.edit", code.id) as string}>Edit</Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {promoCodes.last_page > 1 && (
                            <div className="flex justify-center gap-1 border-t px-4 py-3">
                                {promoCodes.links.map((link, i) => (
                                    <Button key={i} variant={link.active ? "default" : "outline"} size="sm" disabled={!link.url} onClick={() => link.url && router.visit(link.url)} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
