import AppLayoutTemplate from "@/layouts/app/app-header-layout";
import { Auth, SharedData, type BreadcrumbItem } from "@/types";
import { usePage } from "@inertiajs/react";
import { type ReactNode } from "react";

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const auth = usePage<SharedData>().props.auth;

    return (
        <AppLayoutTemplate auth={auth} breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};
