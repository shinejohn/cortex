import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeftIcon, Code, FileText, Loader2 } from "lucide-react";
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

interface EmailTemplate {
    id: number;
    name: string;
    slug: string;
    type: string;
    subject_template: string;
    preview_text: string | null;
    html_template: string;
    text_template: string | null;
    variables: string[] | null;
    is_active: boolean;
}

interface EditTemplateProps {
    template: EmailTemplate;
    types: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Email", href: "/admin/email" },
    { title: "Templates", href: "/admin/email/templates" },
    { title: "Edit", href: "#" },
];

export default function EditTemplate({ template, types }: EditTemplateProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: template.name || "",
        slug: template.slug || "",
        subject_template: template.subject_template || "",
        preview_text: template.preview_text || "",
        html_template: template.html_template || "",
        text_template: template.text_template || "",
        is_active: template.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("admin.email.templates.update", template.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Template: ${template.name}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.email.templates.show", template.id)}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Edit Template</h1>
                        <p className="text-muted-foreground mt-1">{template.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Template Details</CardTitle>
                            </div>
                            <CardDescription>Update name, slug, and subject</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug *</Label>
                                    <Input id="slug" value={data.slug} onChange={(e) => setData("slug", e.target.value)} />
                                    {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                                </div>
                            </div>

                            <div className="rounded-lg bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Type:</span>{" "}
                                    {template.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject_template">Subject Template *</Label>
                                <Input
                                    id="subject_template"
                                    value={data.subject_template}
                                    onChange={(e) => setData("subject_template", e.target.value)}
                                />
                                {errors.subject_template && <p className="text-sm text-destructive">{errors.subject_template}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preview_text">Preview Text</Label>
                                <Input
                                    id="preview_text"
                                    value={data.preview_text}
                                    onChange={(e) => setData("preview_text", e.target.value)}
                                    maxLength={255}
                                />
                                {errors.preview_text && <p className="text-sm text-destructive">{errors.preview_text}</p>}
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData("is_active", checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer flex-1">
                                    Active
                                    <p className="text-sm text-muted-foreground font-normal mt-0.5">Enable this template for use in campaigns</p>
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <Code className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Template Content</CardTitle>
                            </div>
                            <CardDescription>HTML and plain text versions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="html_template">HTML Template *</Label>
                                <Textarea
                                    id="html_template"
                                    value={data.html_template}
                                    onChange={(e) => setData("html_template", e.target.value)}
                                    rows={12}
                                    className="font-mono text-sm"
                                />
                                {errors.html_template && <p className="text-sm text-destructive">{errors.html_template}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="text_template">Plain Text Template</Label>
                                <Textarea
                                    id="text_template"
                                    value={data.text_template}
                                    onChange={(e) => setData("text_template", e.target.value)}
                                    rows={8}
                                    className="font-mono text-sm"
                                />
                                {errors.text_template && <p className="text-sm text-destructive">{errors.text_template}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route("admin.email.templates.show", template.id)}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Template
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
