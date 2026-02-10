import { Head, Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import AppLayout from "./app-layout";

interface FormLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    backHref: string;
    backLabel: string;
    maxWidth?: string;
    breadcrumbs?: any[]; // For AppLayout
}

export default function FormLayout({
    children,
    title,
    description,
    backHref,
    backLabel,
    maxWidth = "max-w-4xl",
    breadcrumbs,
}: FormLayoutProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="min-h-screen bg-background">
                <div className={`${maxWidth} mx-auto px-4 py-8 sm:px-6 lg:px-8`}>
                    {/* Back navigation */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild className="mb-4">
                            <Link href={backHref}>
                                <ArrowLeft className="mr-2 size-4" />
                                {backLabel}
                            </Link>
                        </Button>
                    </div>

                    {/* Page header */}
                    <div className="mb-8">
                        <h1 className="font-display text-3xl font-black tracking-tight text-foreground">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-muted-foreground">{description}</p>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </AppLayout>
    );
}
