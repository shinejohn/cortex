import { Head, Link } from "@inertiajs/react";
import { ArrowLeftIcon } from "lucide-react";
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
    breadcrumbs
}: FormLayoutProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="min-h-screen bg-background">
                <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
                    <div className="mb-6">
                        <Link href={backHref}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                {backLabel}
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                        {description && <p className="text-muted-foreground mt-1">{description}</p>}
                    </div>
                    {children}
                </div>
            </div>
        </AppLayout>
    );
}
