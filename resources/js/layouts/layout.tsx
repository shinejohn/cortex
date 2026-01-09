import { Head } from "@inertiajs/react";
import { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
    title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-background">{children}</div>
        </>
    );
}
