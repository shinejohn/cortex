import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon, Code, Eye, FileText, PencilIcon } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    created_at: string;
    updated_at: string;
}

interface TemplateShowProps {
    template: EmailTemplate;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin", href: "/admin" },
    { title: "Email", href: "/admin/email" },
    { title: "Templates", href: "/admin/email/templates" },
    { title: "Preview", href: "#" },
];

export default function TemplateShow({ template }: TemplateShowProps) {
    const [previewTab, setPreviewTab] = useState("preview");

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Template: ${template.name}`} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route("admin.email.templates.index")}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                <ArrowLeftIcon className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-display text-3xl font-black tracking-tight text-foreground">{template.name}</h1>
                                <Badge variant={template.is_active ? "default" : "secondary"}>
                                    {template.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1 font-mono text-sm">{template.slug}</p>
                        </div>
                    </div>
                    <Link href={route("admin.email.templates.edit", template.id)}>
                        <Button className="gap-2">
                            <PencilIcon className="h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <CardTitle className="font-display tracking-tight">Template Details</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Type</p>
                                <p className="mt-1">
                                    <Badge variant="outline">
                                        {template.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </Badge>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Subject Template</p>
                                <p className="mt-1 text-foreground font-mono text-sm">{template.subject_template}</p>
                            </div>
                            {template.preview_text && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Preview Text</p>
                                    <p className="mt-1 text-foreground">{template.preview_text}</p>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                <p className="mt-1 text-foreground">{new Date(template.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Updated</p>
                                <p className="mt-1 text-foreground">{new Date(template.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                        {template.variables && template.variables.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Template Variables</p>
                                <div className="flex flex-wrap gap-2">
                                    {template.variables.map((variable) => (
                                        <Badge key={variable} variant="outline" className="font-mono text-xs">
                                            {`{{${variable}}}`}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <div className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-primary" />
                            <CardTitle className="font-display tracking-tight">Template Preview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Tabs value={previewTab} onValueChange={setPreviewTab}>
                            <TabsList>
                                <TabsTrigger value="preview" className="gap-1.5">
                                    <Eye className="h-3.5 w-3.5" />
                                    Preview
                                </TabsTrigger>
                                <TabsTrigger value="html" className="gap-1.5">
                                    <Code className="h-3.5 w-3.5" />
                                    HTML Source
                                </TabsTrigger>
                                {template.text_template && (
                                    <TabsTrigger value="text" className="gap-1.5">
                                        <FileText className="h-3.5 w-3.5" />
                                        Plain Text
                                    </TabsTrigger>
                                )}
                            </TabsList>
                            <TabsContent value="preview" className="mt-4">
                                <div className="border rounded-lg p-4 bg-white">
                                    <div dangerouslySetInnerHTML={{ __html: template.html_template }} />
                                </div>
                            </TabsContent>
                            <TabsContent value="html" className="mt-4">
                                <pre className="border rounded-lg p-4 bg-muted/30 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                                    {template.html_template}
                                </pre>
                            </TabsContent>
                            {template.text_template && (
                                <TabsContent value="text" className="mt-4">
                                    <pre className="border rounded-lg p-4 bg-muted/30 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                                        {template.text_template}
                                    </pre>
                                </TabsContent>
                            )}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
