import { Head, Link, router } from "@inertiajs/react";
import { FileText, FilterIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface EmailTemplate {
    id: number;
    name: string;
    slug: string;
    type: string;
    subject_template: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface TemplatesIndexProps {
    templates: {
        data: EmailTemplate[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        type?: string;
        is_active?: string;
    };
    types: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Email", href: "/admin/email" },
    { title: "Templates", href: "/admin/email/templates" },
];

export default function TemplatesIndex({ templates, filters, types }: TemplatesIndexProps) {
    const [typeFilter, setTypeFilter] = useState(filters.type || "");
    const [activeFilter, setActiveFilter] = useState(filters.is_active ?? "");

    const handleFilter = () => {
        router.get(
            route("admin.email.templates.index"),
            {
                type: typeFilter || undefined,
                is_active: activeFilter !== "" ? activeFilter : undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Templates" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Email Templates</h1>
                        <p className="text-muted-foreground mt-1">Manage email templates for campaigns and digests</p>
                    </div>
                    <Link href={route("admin.email.templates.create")}>
                        <Button className="gap-2">
                            <PlusIcon className="h-4 w-4" />
                            New Template
                        </Button>
                    </Link>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight text-base">Filters</CardTitle>
                        <CardDescription>Filter templates by type or active status</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Types</SelectItem>
                                    {types.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={activeFilter} onValueChange={setActiveFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter} className="gap-2">
                                <FilterIcon className="h-4 w-4" />
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-display tracking-tight">Templates ({templates.total})</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {templates.data.length === 0 ? (
                            <div className="text-center py-16">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground text-lg font-medium">No templates found</p>
                                <p className="text-muted-foreground text-sm mt-1">Create your first email template to get started.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templates.data.map((template) => (
                                        <TableRow key={template.id}>
                                            <TableCell>
                                                <Link
                                                    href={route("admin.email.templates.show", template.id)}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {template.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{template.slug}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {template.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground max-w-[200px] truncate">{template.subject_template}</TableCell>
                                            <TableCell>
                                                <Badge variant={template.is_active ? "default" : "secondary"}>
                                                    {template.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(template.updated_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {templates.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8 pb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={templates.current_page === 1}
                                    onClick={() => router.get(route("admin.email.templates.index"), { page: templates.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm text-muted-foreground">
                                    Page {templates.current_page} of {templates.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={templates.current_page === templates.last_page}
                                    onClick={() => router.get(route("admin.email.templates.index"), { page: templates.current_page + 1 })}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
