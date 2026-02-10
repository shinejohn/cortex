import AppLayoutTemplate from "@/layouts/app/app-header-layout";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { Auth, type BreadcrumbItem, SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { type ReactNode } from "react";

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const auth = usePage<SharedData>().props.auth;

    return (
        <ErrorBoundary>
            <AppLayoutTemplate auth={auth} breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
        </ErrorBoundary>
    );
};
