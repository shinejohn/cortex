import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeftIcon, Code, FileText, Loader2 } from "lucide-react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

interface CreateTemplateProps {
    types: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Email", href: "/admin/email" },
    { title: "Templates", href: "/admin/email/templates" },
    { title: "Create", href: "#" },
];

export default function CreateTemplate({ types }: CreateTemplateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        slug: "",
        type: "",
        subject_template: "",
        preview_text: "",
        html_template: "",
        text_template: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin.email.templates.store"));
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleNameChange = (value: string) => {
        setData("name", value);
        if (!data.slug || data.slug === generateSlug(data.name)) {
            setData("slug", generateSlug(value));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Email Template" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={route("admin.email.templates.index")}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Create Template</h1>
                        <p className="text-muted-foreground mt-1">Create a new email template</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="overflow-hidden border-none shadow-sm">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle className="font-display tracking-tight">Template Details</CardTitle>
                            </div>
                            <CardDescription>Name, slug, and type</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="Daily Digest Template"
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug *</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData("slug", e.target.value)}
                                        placeholder="daily-digest-template"
                                    />
                                    {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select value={data.type} onValueChange={(value) => setData("type", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject_template">Subject Template *</Label>
                                <Input
                                    id="subject_template"
                                    value={data.subject_template}
                                    onChange={(e) => setData("subject_template", e.target.value)}
                                    placeholder="{{community_name}} Daily Digest - {{date}}"
                                />
                                {errors.subject_template && <p className="text-sm text-destructive">{errors.subject_template}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preview_text">Preview Text</Label>
                                <Input
                                    id="preview_text"
                                    value={data.preview_text}
                                    onChange={(e) => setData("preview_text", e.target.value)}
                                    placeholder="Today's top stories from your community"
                                    maxLength={255}
                                />
                                {errors.preview_text && <p className="text-sm text-destructive">{errors.preview_text}</p>}
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
                                    placeholder="<html><body>...</body></html>"
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
                                    placeholder="Plain text version of the email..."
                                />
                                {errors.text_template && <p className="text-sm text-destructive">{errors.text_template}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route("admin.email.templates.index")}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Template
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
